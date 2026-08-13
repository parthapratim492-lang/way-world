// Simple XP curve: each level needs a bit more than the last.
// This is intentionally basic — tune it once real usage data exists.

export const RANKS = [
  "Observer",
  "Scout",
  "Explorer",
  "Pathfinder",
  "Navigator",
  "Cartographer",
  "World Builder",
];

const XP_PER_DISCOVERY = 10;

export function xpForNextLevel(level: number) {
  return 50 + level * 40;
}

export function computeLevel(xp: number) {
  let level = 1;
  let remaining = xp;
  let needed = xpForNextLevel(level);

  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpForNextLevel(level);
  }

  const rankIndex = Math.min(Math.floor((level - 1) / 4), RANKS.length - 1);

  return {
    level,
    rank: RANKS[rankIndex],
    xpIntoLevel: remaining,
    xpForLevel: needed,
    progress: remaining / needed,
  };
}

export { XP_PER_DISCOVERY };
