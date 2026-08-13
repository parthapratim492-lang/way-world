// Turns a free-text query like "somewhere quiet to work" into structured
// search terms — extra keywords and likely categories — using Claude.
//
// This is genuinely optional: if ANTHROPIC_API_KEY isn't set, or the call
// fails for any reason (network, rate limit, bad response), this returns
// null and the caller falls back to the honest literal keyword matching
// from Phase 3. Search never breaks because of this.

import { CATEGORIES } from "@/lib/categories";

export type ParsedIntent = {
  keywords: string[];
  categories: string[];
};

// Tiny in-memory cache so identical queries within a few minutes don't hit
// the API (and cost money) repeatedly. This resets on server restart —
// it's a cost optimization, not a persistence layer.
const cache = new Map<string, { value: ParsedIntent; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function parseIntent(query: string): Promise<ParsedIntent | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !query.trim()) return null;

  const cacheKey = query.trim().toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.value;

  const categoryIds = CATEGORIES.map((c) => c.id).join(", ");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system:
          `You extract search intent from a short query about finding a place. ` +
          `Respond with ONLY a JSON object, no other text, no markdown fences. Shape: ` +
          `{"keywords": string[], "categories": string[]}. ` +
          `"keywords" are concrete words that might appear in a place's name, description, or tags ` +
          `(e.g. "quiet coffee wifi" for a query about a calm place to work). Keep it to 2-6 words. ` +
          `"categories" must only contain values from this exact list, or be empty if unclear: ${categoryIds}.`,
        messages: [{ role: "user", content: query }],
      }),
      // Keep this fast — if Claude is slow, we'd rather fall back than make search feel sluggish.
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    if (!text) return null;

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const result: ParsedIntent = {
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 6) : [],
      categories: Array.isArray(parsed.categories)
        ? parsed.categories.filter((c: string) => CATEGORIES.some((cat) => cat.id === c))
        : [],
    };

    cache.set(cacheKey, { value: result, expires: Date.now() + CACHE_TTL_MS });
    return result;
  } catch {
    // Network error, timeout, bad JSON — any failure here just means no AI
    // enrichment this time. The caller handles null gracefully.
    return null;
  }
}
