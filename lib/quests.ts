export type QuestId = "daily-discovery" | "cafe-hunter" | "night-walker" | "social-butterfly" | "signal-booster";

export const QUESTS: {
  id: QuestId;
  title: string;
  description: string;
  target: number;
  recurring: boolean; // daily quests reset each day; the rest are lifetime progress
}[] = [
  {
    id: "daily-discovery",
    title: "Discover something new",
    description: "Publish one place today",
    target: 1,
    recurring: true,
  },
  {
    id: "cafe-hunter",
    title: "Café Hunter",
    description: "Discover 3 cafés",
    target: 3,
    recurring: false,
  },
  {
    id: "night-walker",
    title: "Night Walker",
    description: "Document 5 places after dark (7pm–5am)",
    target: 5,
    recurring: false,
  },
  {
    id: "social-butterfly",
    title: "Social Butterfly",
    description: "Follow 3 fellow explorers",
    target: 3,
    recurring: false,
  },
  {
    id: "signal-booster",
    title: "Signal Booster",
    description: "Add 5 community signals to places",
    target: 5,
    recurring: false,
  },
];
