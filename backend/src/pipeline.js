// Retrieval + generation pipeline using local Transformers.js models
import { pipeline } from "@xenova/transformers";

// Simple grounded generation: we pass retrieved context to FLAN-T5
let textGen;

export async function getGenerator(modelName) {
  if (!textGen) {
    // Loads once (cached in memory)
    textGen = await pipeline("text2text-generation", modelName);
  }
  return textGen;
}

export async function generateAnswer({ context, question, modelName }) {
  const generator = await getGenerator(modelName);
  const prompt = `You are a precise assistant. Answer ONLY using the CONTEXT.
- If dates or deadlines are present, extract them as bullet points: "**<item> — <date> (page X)**".
- If context is insufficient, say: "I don't know."

CONTEXT:
${context}

QUESTION: ${question}
ANSWER:`;
  const out = await generator(prompt, { max_new_tokens: 256 });
  return out[0]?.generated_text?.trim() || "";
}
