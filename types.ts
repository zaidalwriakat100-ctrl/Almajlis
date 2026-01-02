
export type LawStatus = 'proposed' | 'in_committee' | 'under_discussion' | 'passed' | 'rejected' | 'unknown';

export interface CommitteeRole {
  committeeName: string;
  role: 'member' | 'chair' | 'deputy-chair' | 'rapporteur';
}

export interface MPMembership {
  session: string;
  bloc: string;
  party?: string;
  committees?: string[];
}

export interface MP {
  id: string;
  fullName: string;
  photoUrl?: string;
  governorate?: string;
  district?: string;
  party?: string;
  parliamentaryBloc?: string;
  winType: 'national' | 'local';
  officialProfileUrl?: string;
  email?: string;
  phone?: string;
  social?: {
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  committeeTerms?: {
    firstOrdinary?: CommitteeRole[];
    secondOrdinary?: CommitteeRole[];
  };
  attendanceRate?: number;
  activityStats?: {
    questionsAsked: number;
    speechesGiven: number;
    billsProposed: number;
    citizenReplies: number;
  };
  topicsOfInterest?: { subject: string; score: number }[];
  source: string;
  lastUpdated: string;
  memberships?: MPMembership[];
}

export interface ApprovedLaw {
  id: string;
  title: string;
  number: string;
  year: string;
  approvedDate: string;
  sourceUrl: string;
  category: string;
  articlesCount: number;
}

export interface Article {
  id: string;
  lawId: string;
  articleNo: string;
  text: string;
}

export type UserVote = 'YES' | 'NO' | 'ABSTAIN';

export type SubscriptionType = 'keyword' | 'speaker' | 'ministry';

export interface Subscription {
  id: string;
  type: SubscriptionType;
  value: string;
  userEmail: string;
  createdAt: string;
}

export interface MentionsAlert {
  id: string;
  subscriptionId: string;
  subscriptionValue: string;
  sessionTitle: string;
  sessionId: string;
  speakerName: string;
  textExcerpt: string;
  date: string;
  matchType: SubscriptionType;
}

export interface ExtractedEntity {
  type: 'وزارة' | 'شخص' | 'مكان' | 'مؤسسة' | 'قانون' | 'آخر';
  name: string;
}

export interface Speech {
  speakerName: string;
  speakerRole: string;
  mainIssueType: string;
  scope: string;
  keyLocations: string[];
  summaryBullets: string[];
  topics: string[];
  stanceTowardGovernment: string;
  stanceSummary: string;
}

export interface SessionKeyMoment {
  label: string;
  timeSeconds: number;
}

export interface NumberMention {
  value: string;
  context: string;
}

export interface TranscriptSegment {
  id: string;
  sessionId: string;
  speakerName: string;
  speakerRole: string;
  startSeconds?: number;
  textExcerpt: string;
  summaryBullets: string[];
  evidenceQuotes: string[];
  topics: string[];
  mainIssueType: string;
  scope: string;
  keyLocations: string[];
  stanceTowardGovernment: string;
  stanceSummary: string;
}

export interface SessionOverview {
  summaryBullets: string[];
  mainTopics: string[];
  keyLawsOrFiles: string[];
}

export interface BriefSummary {
  events: string[];
  mp_interventions: {
    mp_name: string;
    points: string[];
  }[];
  decisions: string[];
}

export interface Intervention {
  id: string;
  speakerType: 'mp' | 'chair' | 'government' | 'unknown';
  speakerNameRaw: string | null;
  start_sec: number | null;
  intervention_text: string;
  topics: string[];
  preview_quote: string;
}

export interface SessionChunk {
  chunk_id: string;
  label: string;
  interventions: Intervention[];
}

export interface ParliamentSession {
  id: string;
  title: string;
  date: string;
  term: string;
  ordinaryTerm?: number;
  duration?: string;           // الحقل الجديد: المدة بتنسيق HH:MM:SS
  duration_sec?: number;       // الحقل الجديد: المدة بالثواني
  num_speakers?: number;       // الحقل الجديد: عدد المتحدثين
  youtube: {
    video_id: string;
    url: string;
  };
  stats?: {
    estimated_duration_minutes: number | null;
    distinct_speakers_count: number;
  };
  chunks: SessionChunk[];
  brief_summary?: BriefSummary;
}

export interface Law {
  id: string;
  title: string;
  description: string;
  status: LawStatus;
  dateProposed: string;
  tags: string[];
  source: string;
  lastUpdated: string;
  simpleExplainer?: {
    summary: string;
    whoIsAffected: string[];
    keyChanges: string[];
  };
  timeline?: {
    stage: string;
    date: string;
    status: 'Completed' | 'Pending';
  }[];
  pdfUrl?: string;
  number?: string;
  year: number;
  datePassed?: string;
  voteBreakdown?: {
    with: number;
    against: number;
    abstain: number;
    absent: number;
  };
}

export interface Party {
  id: string;
  name: string;
  nationalListSeats: number;
  totalBlocSeats: number;
  color: string;
  platform?: string;
  recentStances?: { issue: string; stance: string }[];
  logoUrl?: string;
  foundedYear?: number;
  websiteUrl?: string;
  ideology?: string;
  nameEn?: string;
  source: string;
  lastUpdated: string;
}

// Added missing interface for bloc memberships per term
export interface BlocMembership {
  blocName: string;
  memberName: string;
  term: 1 | 2;
}

// Added missing status types for MP transitions between terms
export type TransitionStatus = 'STABLE' | 'SHIFTED' | 'NEW_ENTRY' | 'LEFT_MEMBER';

// Added missing interface for MP transition data
export interface MPTransition {
  name: string;
  term1Bloc?: string;
  term2Bloc?: string;
  status: TransitionStatus;
}

export interface TranscriptMatch {
  id: string; // The intervention/segment ID
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  speakerName: string;
  speakerRole: string;
  text: string;
  timestamp: number | null;
  videoId: string;
  matchType: 'exact' | 'fuzzy' | 'transcript';
}
