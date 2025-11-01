// Tiny LRU cache for answers so repeat queries are instant
import { LRUCache } from "lru-cache";
import crypto from "crypto";

export const cache = new LRUCache({
  max: Number(process.env.CACHE_SIZE || 200),
  ttl: 1000 * 60 * 30, // 30 mins
});

export function makeKey(str) {
  return crypto.createHash("sha1").update(String(str)).digest("hex");
}
