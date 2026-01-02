import {
  MP,
  ParliamentSession,
  BlocMembership,
  MPTransition,
  TranscriptMatch
} from "../types";
import { Party } from "../types";
import { Law } from "../types";



/* =========================
   Utils
========================= */
export const normalizeForSearch = (text: string) =>
  text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FF0-9a-z\s]/gi, "")
    .trim();

/* =========================
   MPs
========================= */
export const getMPs = async (): Promise<MP[]> => {
  const res = await fetch("/data/mps.json");
  if (!res.ok) return [];
  return await res.json();
};

export const getMPById = async (id: string) => {
  const mps = await getMPs();
  return mps.find(mp => mp.id === id);
};

/* =========================
   Sessions (LOCAL JSON)
========================= */
export const getSessions = async (): Promise<ParliamentSession[]> => {
  try {
    const res = await fetch("/data/sessions.json");
    if (!res.ok) return [];

    const data = await res.json();

    return data.map((s: any) => ({
      id: s.id,
      title: s.title,
      date: s.date,
      term: s.term || "الدورة العادية",
      ordinaryTerm: s.ordinaryTerm,
      // الحقول الجديدة
      duration: s.duration,
      duration_sec: s.duration_sec,
      num_speakers: s.num_speakers,
      youtube: {
        video_id: s.youtube?.video_id || s.youtubeVideoId || "",
        url: s.youtube?.url || s.youtubeUrl || (s.youtubeVideoId ? `https://www.youtube.com/watch?v=${s.youtubeVideoId}` : "")
      },
      // Fallback للقيم القديمة
      stats: {
        estimated_duration_minutes: s.stats?.estimated_duration_minutes || (s.duration_sec ? Math.round(s.duration_sec / 60) : 120),
        distinct_speakers_count: s.stats?.distinct_speakers_count || s.num_speakers || s.chunks?.[0]?.interventions?.length || s.segments?.length || 0
      },
      brief_summary: s.brief_summary,
      chunks: s.chunks || [
        {
          chunk_id: "full",
          label: "مداخلات الجلسة",
          interventions: (s.segments || []).map((seg: any) => ({
            id: seg.id || seg.segmentId,
            speakerType: seg.speakerRole?.includes("نائب") ? "mp" : (seg.speakerRole?.includes("رئيس") ? "chair" : "unknown"),
            speakerNameRaw: seg.speakerName,
            start_sec: seg.videoTimestamp || null,
            intervention_text: seg.textExcerpt || seg.text || "",
            topics: seg.topics || [],
            preview_quote: (seg.textExcerpt || seg.text || "").slice(0, 120)
          }))
        }
      ]
    }));
  } catch {
    return [];
  }
};

export const getSessionById = async (id: string) => {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id);
};

/* =========================
   Bloc Memberships
========================= */
export const getBlocMemberships = async (
  term: 1 | 2
): Promise<BlocMembership[]> => {
  const mps = await getMPs();
  const key = term === 1 ? "ordinary_1" : "ordinary_2";

  return mps
    .map(mp => {
      const membership = mp.memberships?.find(m => m.session === key);
      if (!membership) return null;

      return {
        blocName: membership.bloc,
        memberName: mp.fullName,
        term
      };
    })
    .filter(Boolean) as BlocMembership[];
};

/* =========================
   MP Transitions
========================= */
export const getMPTransitions = async (): Promise<MPTransition[]> => {
  const mps = await getMPs();

  return mps.map(mp => {
    const t1 = mp.memberships?.find(m => m.session === "ordinary_1")?.bloc;
    const t2 =
      mp.memberships?.find(m => m.session === "ordinary_2")?.bloc ||
      mp.parliamentaryBloc ||
      "مستقل";

    return {
      name: mp.fullName,
      term1Bloc: t1,
      term2Bloc: t2,
      status: t1 && t1 !== t2 ? "SHIFTED" : "STABLE"
    };
  });
};

/* =========================
   Transcript Search
========================= */

// تحميل ملفات التفريغ الحرفي والملخصات بناءً على الفهرس
const loadTranscriptFiles = async (): Promise<{ fileName: string; content: string; type: string; sessionTitle: string }[]> => {
  try {
    const indexRes = await fetch('/data/transcripts_index.json');
    if (!indexRes.ok) return [];

    const fileList: { fileName: string; type: string; sessionTitle: string }[] = await indexRes.json();
    const transcripts: { fileName: string; content: string; type: string; sessionTitle: string }[] = [];

    for (const file of fileList) {
      try {
        const folder = file.type === 'verbatim' ? 'minutes_verbatim' : 'transcripts';
        const res = await fetch(`/data/${folder}/${file.fileName}`);
        if (res.ok) {
          const content = await res.text();
          transcripts.push({
            fileName: file.fileName,
            content,
            type: file.type,
            sessionTitle: file.sessionTitle
          });
        }
      } catch (err) {
        console.error(`Error loading: ${file.fileName}`, err);
      }
    }
    return transcripts;
  } catch (error) {
    console.error("Error loading transcript index", error);
    return [];
  }
};

// البحث في التفريغ الحرفي والملخصات
const searchInTranscripts = async (query: string): Promise<TranscriptMatch[]> => {
  const transcripts = await loadTranscriptFiles();
  const q = normalizeForSearch(query);
  const results: TranscriptMatch[] = [];

  transcripts.forEach(({ fileName, content, type, sessionTitle }) => {
    const normalizedContent = normalizeForSearch(content);

    if (normalizedContent.includes(q)) {
      const lines = content.split('\n');

      lines.forEach((line, lineIndex) => {
        if (normalizeForSearch(line).includes(q)) {
          // استخراج سياق معتدل (سطرين قبل وسطرين بعد)
          const contextStart = Math.max(0, lineIndex - 2);
          const contextEnd = Math.min(lines.length, lineIndex + 3);
          const contextText = lines.slice(contextStart, contextEnd).join('\n').trim();

          results.push({
            id: `transcript_${fileName}_${lineIndex}`,
            sessionId: fileName.replace('.txt', ''),
            sessionTitle: sessionTitle,
            sessionDate: '',
            speakerName: type === 'verbatim' ? 'من التفريغ الحرفي (المحاضر)' : 'من ملخص الجلسة',
            speakerRole: 'transcript',
            text: contextText,
            timestamp: null,
            videoId: '',
            matchType: 'transcript'
          });
        }
      });
    }
  });

  return results;
};

export const searchTranscripts = async (
  query: string
): Promise<TranscriptMatch[]> => {
  if (query.trim().length < 2) return [];

  const sessions = await getSessions();
  const q = normalizeForSearch(query);
  const results: TranscriptMatch[] = [];

  // البحث في بيانات الجلسات
  sessions.forEach(session => {
    session.chunks?.forEach(chunk => {
      chunk.interventions.forEach(i => {
        if (normalizeForSearch(i.intervention_text).includes(q)) {
          results.push({
            id: i.id,
            sessionId: session.id,
            sessionTitle: session.title,
            sessionDate: session.date,
            speakerName: i.speakerNameRaw,
            speakerRole: i.speakerType,
            text: i.intervention_text,
            timestamp: null,
            videoId: session.youtube.video_id,
            matchType: "exact"
          });
        }
      });
    });
  });

  // البحث في ملفات التفريغ الحرفي
  const transcriptResults = await searchInTranscripts(query);
  results.push(...transcriptResults);

  return results;
};

/* =========================
   Subscriptions (LOCAL)
========================= */
const SUBS_KEY = "parliament_subscriptions";

export const addSubscription = (
  type: "mp" | "keyword" | "speaker",
  value: string
) => {
  const stored = localStorage.getItem(SUBS_KEY);
  const subs = stored ? JSON.parse(stored) : [];

  if (subs.find((s: any) => s.type === type && s.value === value)) return;

  subs.push({
    id: Math.random().toString(36).slice(2),
    type,
    value,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
};

export const getSubscriptions = () => {
  const stored = localStorage.getItem(SUBS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const removeSubscription = (id: string) => {
  const stored = localStorage.getItem(SUBS_KEY);
  if (!stored) return;

  const subs = JSON.parse(stored).filter((s: any) => s.id !== id);
  localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
};
/* =========================
   Parties (LOCAL JSON)
========================= */

export const getParties = async (): Promise<Party[]> => {
  try {
    const res = await fetch("/data/parties.json");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

export const getPartyById = async (id: string): Promise<Party | undefined> => {
  const parties = await getParties();
  return parties.find(p => p.id === id);
};
/* =========================
   Laws (LOCAL JSON)
========================= */

export const getLaws = async (): Promise<Law[]> => {
  try {
    const res = await fetch("/data/laws.json");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

export const getLawById = async (id: string): Promise<Law | undefined> => {
  const laws = await getLaws();
  return laws.find(l => l.id === id);
};

/* =========================
   User Email (LOCAL)
========================= */
const USER_EMAIL_KEY = "parliament_user_email";

export const getUserEmail = (): string | null => {
  return localStorage.getItem(USER_EMAIL_KEY);
};

export const setUserEmail = (email: string): void => {
  localStorage.setItem(USER_EMAIL_KEY, email);
};

/* =========================
   Alerts Generation
========================= */
export const generateAlerts = async (): Promise<any[]> => {
  const subs = getSubscriptions();
  const sessions = await getSessions();
  const alerts: any[] = [];

  subs.forEach((sub: any) => {
    sessions.forEach(session => {
      session.chunks?.forEach(chunk => {
        chunk.interventions.forEach(intervention => {
          const text = intervention.intervention_text || "";
          const normalizedText = normalizeForSearch(text);
          const normalizedValue = normalizeForSearch(sub.value);

          if (normalizedText.includes(normalizedValue)) {
            alerts.push({
              id: Math.random().toString(36).slice(2),
              subscriptionId: sub.id,
              subscriptionValue: sub.value,
              sessionTitle: session.title,
              sessionId: session.id,
              speakerName: intervention.speakerNameRaw || "غير معروف",
              textExcerpt: text.slice(0, 150),
              date: session.date,
              matchType: sub.type
            });
          }
        });
      });
    });
  });

  return alerts.slice(0, 20); // Limit to 20 alerts
};

/* =========================
   Approved Laws (LOCAL JSON)
========================= */
export const getApprovedLaws = async (): Promise<any[]> => {
  const allLaws = await getLaws();
  return allLaws.filter(law => law.status === 'passed');
};

/* =========================
   Proposed Bills (LOCAL JSON)
========================= */
export const getProposedBills = async (): Promise<Law[]> => {
  const allLaws = await getLaws();
  return allLaws.filter(law => law.status === 'proposed');
};

/* =========================
   User Votes (LOCAL)
========================= */
const USER_VOTES_KEY = "parliament_user_votes";

export const getUserVotes = (): Record<string, string> => {
  const stored = localStorage.getItem(USER_VOTES_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const saveUserVote = (articleId: string, vote: string): void => {
  const votes = getUserVotes();
  votes[articleId] = vote;
  localStorage.setItem(USER_VOTES_KEY, JSON.stringify(votes));
};
