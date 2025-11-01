/**
 * Document store + embeddings + Qdrant integration.
 * - Uses @xenova/transformers locally for embeddings (feature-extraction).
 * - Chunks text with overlap, upserts vectors into Qdrant.
 * - Searches Qdrant by cosine similarity.
 */
import pdfParse from "pdf-parse";
import { pipeline } from "@xenova/transformers";
import { QdrantClient } from "@qdrant/js-client-rest";

// --- helpers ---
function normalize(vec) {
  const n = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
  return vec.map((x) => x / n);
}

function chunkText(text, size = 1000, overlap = 200) {
  const clean = (text || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  const parts = [];
  for (let i = 0; i < clean.length; i += size - overlap) {
    parts.push(clean.slice(i, i + size));
  }
  return parts;
}

export class DocStore {
  constructor() {
    this.collection = process.env.COLLECTION_NAME || "pdf_docs";
    const url = process.env.QDRANT_URL || "http://localhost:6333";
    this.qdrant = new QdrantClient({ url });
    this.embedderPromise = null; // lazy-load
    this.files = []; // [{name, count}]
  }

  async _getEmbedder() {
    if (!this.embedderPromise) {
      const model = process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2";
      // feature-extraction returns [1, 384] tensor -> we average pool
      this.embedderPromise = pipeline("feature-extraction", model);
    }
    return this.embedderPromise;
  }

  async ensureCollection() {
    const list = await this.qdrant.getCollections();
    const exists = list?.collections?.some((c) => c.name === this.collection);
    if (!exists) {
      await this.qdrant.createCollection(this.collection, {
        vectors: { size: 384, distance: "Cosine" }
      });
    }
  }

  async addPDF(buffer, name) {
    await this.ensureCollection();
    const parsed = await pdfParse(buffer);
    const text = parsed.text || "";
    const chunks = chunkText(text, 1000, 200);

    // embed all chunks (sequential to keep memory low)
    const embed = await this._getEmbedder();
    const points = [];
    for (let i = 0; i < chunks.length; i++) {
      const out = await embed(chunks[i], { pooling: "mean", normalize: true });
      // out.data is Float32Array already normalized if normalize:true
      const vector = Array.from(out.data);
      points.push({
        id: Number(`${Date.now()}${i}`),
        vector,
        payload: { source: name, chunk_index: i, preview: chunks[i].slice(0, 180) }
      });
    }
    if (points.length) {
      await this.qdrant.upsert(this.collection, { points });
      this.files.push({ name, count: points.length });
    }
  }

  async search(query, k = 4) {
    await this.ensureCollection();
    const embed = await this._getEmbedder();
    const out = await embed(query, { pooling: "mean", normalize: true });
    const vector = Array.from(out.data);
    const res = await this.qdrant.search(this.collection, {
      vector,
      limit: Math.max(1, Math.min(10, Number(k) || 4)),
      with_payload: true
    });
    return (res || []).map((hit) => ({
      score: hit.score,
      pageContent: hit.payload?.preview || "",
      metadata: {
        source: hit.payload?.source || "unknown",
        page: (hit.payload?.chunk_index ?? 0) + 1
      }
    }));
  }

  listFiles() {
    return this.files.map((f) => f.name);
  }
}
