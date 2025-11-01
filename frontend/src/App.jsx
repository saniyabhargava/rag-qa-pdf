import React, { useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function App() {
  const [files, setFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(4);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [indexed, setIndexed] = useState([]);

  async function upload(ev) {
    const picked = Array.from(ev.target.files || []);
    setFiles(picked);
    if (!picked.length) return;

    const form = new FormData();
    picked.forEach(f => form.append("files", f, f.name));
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/upload`, { method: "POST", body: form });
      const j = await r.json();
      setIndexed(j.indexed || []);
    } finally { setBusy(false); }
  }

  async function ask() {
    if (!question.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, topK: Number(topK) })
      });
      const j = await r.json();
      setResult({ ...j, question });
    } finally { setBusy(false); }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>LangChain RAG QA - Ask the PDF Anything!</h1>
        <span className="badge">React Frontend • Node + Qdrant Backend</span>
      </div>

      <div className="card">
        <div className="section-title">Upload & Ask</div>
        <div className="grid">
          <div>
            <div className="label">Upload PDFs</div>
            <input className="file" type="file" accept=".pdf" multiple onChange={upload} disabled={busy}/>
          </div>
          <div>
            <div className="label">Your question</div>
            <input className="input" value={question} onChange={e=>setQuestion(e.target.value)}
              placeholder="e.g., What are my next deadlines?" />
          </div>
          <div>
            <div className="label">Top-K</div>
            <input className="num" type="number" min={2} max={10} value={topK} onChange={e=>setTopK(e.target.value)} />
          </div>
          <div>
            <div className="label">&nbsp;</div>
            <button className="btn" onClick={ask} disabled={busy}>{busy ? "Working..." : "Ask"}</button>
          </div>
        </div>

        {indexed.length ? (
          <div style={{marginTop:10}}>
            <span className="badge">Indexed:</span> <span className="mono">{indexed.join(", ")}</span>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h3>Answer</h3>
        {!result ? <p>Ask something after uploading your PDFs.</p> : (
          <>
            <p><b>Q:</b> {result.question}</p>
            <p className="answer">{result.answer}</p>
          </>
        )}
      </div>

      <div className="card">
        <h3>Sources</h3>
        {!result?.sources?.length ? <p>—</p> : (
          <ul className="list">
            {result.sources.map((s,i)=><li key={i}>{s}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
