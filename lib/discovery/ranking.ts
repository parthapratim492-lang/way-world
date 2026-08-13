// A "discovery score" combining the signals we actually have:
//   - proximity: closer places score higher
//   - freshness: recently added places get a small boost, so new discoveries
//     are visible rather than buried under old ones forever
//   - relevance: how many of the searched terms actually appear in the place
//
// Deliberately NOT included: popularity, trust, engagement. We don't track
// views, saves, or community ratings yet, so faking those numbers into the
// score would just be a more hidden version of a fabricated stat.

export type RankablePlace = {
  name: string;
  description?: string;
  tags?: string[];
  category?: string;
  createdAt?: string | Date;
  distanceMeters?: number;
};

export function relevanceScore(place: RankablePlace, terms: string[]): number {
  if (terms.length === 0) return 0;

  const haystacks = [
    place.name?.toLowerCase() || "",
    place.description?.toLowerCase() || "",
    (place.tags || []).join(" ").toLowerCase(),
    place.category?.toLowerCase() || "",
  ].join(" ");

  let matched = 0;
  for (const term of terms) {
    if (haystacks.includes(term.toLowerCase())) matched += 1;
  }

  // A name match matters more than a tag match — small extra boost.
  const nameBoost = terms.some((t) => place.name?.toLowerCase().includes(t.toLowerCase())) ? 1 : 0;

  return matched + nameBoost;
}

export function freshnessScore(createdAt?: string | Date): number {
  if (!createdAt) return 0;
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return 1 / (1 + ageDays); // ~1.0 for brand new, decays toward 0 over weeks
}

export function proximityScore(distanceMeters?: number): number {
  if (distanceMeters === undefined) return 0;
  const km = distanceMeters / 1000;
  return 1 / (1 + km); // ~1.0 very close, decays with distance
}

export function discoveryScore(place: RankablePlace, terms: string[]): number {
  const relevance = relevanceScore(place, terms);
  const freshness = freshnessScore(place.createdAt);
  const proximity = proximityScore(place.distanceMeters);

  // Relevance dominates when there's a search query; otherwise proximity leads.
  return relevance * 100 + proximity * 10 + freshness * 5;
}
