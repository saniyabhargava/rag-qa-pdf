const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function upload(files) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  const res = await fetch(`${API}/api/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function ask(question, topK = 4) {
  const res = await fetch(`${API}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, topK })
  });
  if (!res.ok) throw new Error("Ask failed");
  return res.json();
}

export async function getLogs() {
  const res = await fetch(`${API}/api/logs`);
  return res.json();
}
