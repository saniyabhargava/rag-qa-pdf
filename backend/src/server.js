/**
 * Express API:
 *   POST /api/upload  -> index PDFs into Qdrant
 *   POST /api/ask     -> RAG: retrieve top-k chunks, generate answer with context
 *   GET  /api/health  -> {"ok": true}
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { pipeline } from "@xenova/transformers";
import { DocStore } from "./store.js";
import { cache, makeKey } from "./cache.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const upload = multer({ storage: multer.memoryStorage() });
const store = new DocStore();

// Lazy-load text generator so cold start stays fast
let generatorPromise = null;
async function getGenerator() {
  if (!generatorPromise) {
    const model = process.env.GENERATION_MODEL || "Xenova/flan-t5-base";
    generatorPromise = pipeline("text2text-generation", model);
  }
  return generatorPromise;
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/upload", upload.array("files"), async (req, res) => {
  const files = req.files || [];
  for (const f of files) {
    await store.addPDF(f.buffer, f.originalname);
  }
  res.json({ ok: true, indexed: store.listFiles() });
});

app.post("/api/ask", async (req, res) => {
  const { question = "", topK = 4 } = req.body || {};
  if (!question.trim()) return res.json({ answer: "Please enter a question.", sources: [] });

  const key = makeKey(JSON.stringify({ q: question, k: topK, idx: store.listFiles() }));
  const cached = cache.get(key);
  if (cached) return res.json({ ...cached, cached: true });

  // Retrieve relevant chunks
  const hits = await store.search(question, topK);
  const sources = hits.map((h) => `${h.metadata?.source || "unknown"}#p${h.metadata?.page ?? 0}`);

  const context = hits.map((h, i) => `#${i + 1} (${h.metadata.source} p${h.metadata.page}): ${h.pageContent}`).join("\n\n");

  // If nothing was retrieved, be honest
  if (!context.trim()) {
    const out = { answer: "I don't know.", sources: [], topK };
    cache.set(key, out);
    return res.json(out);
  }

  // Generate answer using the retrieved context
  const prompt =
`Answer the QUESTION using only the CONTEXT.
- If the answer is not in the context, say exactly: "I don't know."
- Keep answers concise and factual. Include bullet points for dates or deadlines.

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:`;

  const gen = await getGenerator();
  const result = await gen(prompt, { max_new_tokens: 180 });
  const answer = (Array.isArray(result) ? result[0]?.generated_text : result?.generated_text || "").trim();

  const payload = { answer: answer || "I don't know.", sources, topK, cached: false };
  cache.set(key, payload);
  res.json(payload);
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
