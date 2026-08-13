export const CATEGORIES = [
  { id: "cafe", label: "Café", color: "#B8823C", emoji: "☕" },
  { id: "food", label: "Food", color: "#C1633B", emoji: "🍜" },
  { id: "viewpoint", label: "Viewpoint", color: "#4C6FA5", emoji: "🏔️" },
  { id: "hidden-spot", label: "Hidden spot", color: "#7A5C8E", emoji: "🗺️" },
  { id: "event", label: "Event", color: "#D4A63B", emoji: "🎉" },
  { id: "service", label: "Service", color: "#A6544F", emoji: "🧰" },
  { id: "other", label: "Other", color: "#9C9484", emoji: "✦" },
] as const;

export function categoryMeta(id: string) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
