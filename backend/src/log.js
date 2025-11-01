// CSV logging for queries (simple + portable)
import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_PATH = path.join(LOG_DIR, "queries.csv");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, "timestamp,query,answer_preview,sources\n");

export function logQuery({ query, answer, sources }) {
  const row = [
    new Date().toISOString(),
    JSON.stringify(query),
    JSON.stringify((answer || "").slice(0, 400).replace(/\n/g, " ")),
    JSON.stringify(sources.join("; "))
  ].join(",");
  fs.appendFileSync(LOG_PATH, row + "\n", "utf8");
}

export function readLogs() {
  const raw = fs.readFileSync(LOG_PATH, "utf8").trim();
  const lines = raw.split("\n").slice(1);
  return lines.map(l => {
    const [timestamp, query, preview, sources] = l.split(/,(.+)/)[1]
      ? [l.split(",")[0], ...l.match(/,(.+)/)[1].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/,3)]
      : [l.split(",")[0], "", "", ""];
    return {
      timestamp,
      query: JSON.parse(query || '""'),
      answer_preview: JSON.parse(preview || '""'),
      sources: JSON.parse(sources || '""')
    };
  });
}
