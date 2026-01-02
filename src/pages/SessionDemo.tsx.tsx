import { useEffect, useState } from "react";

type Segment = {
  speaker: string;
  summary: string;
  quote: string;
};

type SessionData = {
  title: string;
  date: string;
  summary: string[];
  segments: Segment[];
};

export default function SessionDemo() {
  const [data, setData] = useState<SessionData | null>(null);

  useEffect(() => {
    fetch("/data/session-demo.json")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>تحميل...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>{data.title}</h1>
      <p>{data.date}</p>

      <h2>ملخص الجلسة</h2>
      <ul>
        {data.summary.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <h2>مداخلات النواب</h2>
      {data.segments.map((seg, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: 16, marginBottom: 12 }}>
          <strong>{seg.speaker}</strong>
          <p>{seg.summary}</p>
          <blockquote>«{seg.quote}»</blockquote>
        </div>
      ))}
    </div>
  );
}
