export const SIGNALS = [
  { id: "quiet", label: "Quiet", sentiment: "positive" },
  { id: "great-wifi", label: "Great WiFi", sentiment: "positive" },
  { id: "good-parking", label: "Good parking", sentiment: "positive" },
  { id: "family-friendly", label: "Family friendly", sentiment: "positive" },
  { id: "beautiful-at-night", label: "Beautiful at night", sentiment: "positive" },
  { id: "good-value", label: "Good value", sentiment: "positive" },
  { id: "expensive", label: "Expensive", sentiment: "negative" },
  { id: "crowded", label: "Crowded", sentiment: "negative" },
  { id: "hard-to-find", label: "Hard to find", sentiment: "negative" },
] as const;

export type SignalId = (typeof SIGNALS)[number]["id"];

export function signalMeta(id: string) {
  return SIGNALS.find((s) => s.id === id);
}
