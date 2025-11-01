// Simple, readable chunker for PDFs (LangChain splitter in JS)
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function chunkText(pagesText) {
  // pagesText = [{text, meta}]  meta holds source/page
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150
  });
  const docs = [];
  for (const p of pagesText) {
    const parts = await splitter.splitDocuments([
      { pageContent: p.text, metadata: p.meta }
    ]);
    docs.push(...parts);
  }
  return docs;
}
