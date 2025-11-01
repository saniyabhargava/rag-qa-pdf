import { useState } from "react";
import { ask, upload } from "../api";

export default function QueryForm({ onAnswer }) {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(4);
  const [busy, setBusy] = useState(false);

  const handleUpload = async (e) => {
    setBusy(true);
    try {
      const files = e.target.files;
      if (!files?.length) return;
      await upload(files);
      alert("Documents indexed ✅");
    } catch {
      alert("Upload failed");
    } finally { setBusy(false); }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setBusy(true);
    try {
      const res = await ask(question, topK);
      onAnswer({ question, ...res });
    } catch {
      alert("Query failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <div className="row">
        <div style={{flex:2}}>
          <label>Upload PDFs</label>
          <input className="file" type="file" accept=".pdf" multiple onChange={handleUpload} disabled={busy}/>
        </div>
        <div style={{flex:3}}>
          <label>Your question</label>
          <input className="input" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="e.g., What is the methodology?"/>
        </div>
        <div style={{width:160}}>
          <label>Top-K</label>
          <input className="input" type="number" min={2} max={10} value={topK} onChange={e=>setTopK(Number(e.target.value))}/>
        </div>
        <div style={{width:140, alignSelf:"end"}}>
          <button className="btn" onClick={handleAsk} disabled={busy}>{busy ? "Working..." : "Ask"}</button>
        </div>
      </div>
    </div>
  );
}
