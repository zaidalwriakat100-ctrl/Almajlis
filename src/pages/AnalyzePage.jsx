import { useState } from "react";
import { matchSpeakerToMP } from "../../utils/speakerMatcher";

export default function AnalyzePage({ mps = [] }) {
  const [text, setText] = useState("");
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      setSegments(data.segments || []);
    } catch (err) {
      console.error("Analyze error:", err);
    } finally {
      setLoading(false);
    }
  };

  const enrichedSegments = segments.map(seg => {
    const mp = matchSpeakerToMP(seg.rawSpeakerName, mps);
    return { ...seg, mp };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-parliament-emblem">
        تحليل جلسة برلمانية
      </h2>

      <textarea
        rows={10}
        className="w-full border border-parliament-grid rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-parliament-sand"
        placeholder="الصقي نص الجلسة البرلمانية هنا..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={analyze}
        disabled={loading}
        className="bg-parliament-dome text-white px-6 py-2 rounded-md hover:bg-parliament-emblem transition disabled:opacity-50"
      >
        {loading ? "جاري التحليل..." : "تحليل الجلسة"}
      </button>

      <hr />

      {enrichedSegments.length === 0 && !loading && (
        <p className="text-sm text-parliament-shadow">
          لم يتم عرض أي نتائج بعد.
        </p>
      )}

      {enrichedSegments.map(seg => (
        <div
          key={seg.segmentId}
          className="border border-parliament-grid rounded-xl p-4 space-y-3 bg-white shadow-sm"
        >
          <div>
            <h4 className="font-bold text-lg text-parliament-emblem">
              {seg.mp ? seg.mp.name : seg.rawSpeakerName}
            </h4>

            {seg.mp && (
              <p className="text-xs text-parliament-shadow">
                {seg.mp.party}
              </p>
            )}
          </div>

          <p className="text-sm leading-relaxed text-parliament-shadow">
            {seg.text}
          </p>

          {seg.ai && (
            <div className="bg-parliament-stone/40 rounded-lg p-3 space-y-2">
              <div>
                <strong>🧠 الملخص:</strong>
                <p className="text-sm">{seg.ai.summary}</p>
              </div>

              <div>
                <strong>⚖️ الموقف:</strong>{" "}
                <span className="text-sm">{seg.ai.stance}</span>
              </div>

              {seg.ai.keywords && seg.ai.keywords.length > 0 && (
                <div>
                  <strong>🏷️ كلمات مفتاحية:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {seg.ai.keywords.map((k, i) => (
                      <span
                        key={i}
                        className="text-xs bg-parliament-dome/10 text-parliament-dome px-2 py-1 rounded-full"
                      >
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
