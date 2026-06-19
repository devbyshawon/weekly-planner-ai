export const CATEGORIES = [
  { value: "prayer", label: "Prayer", color: "var(--color-cat-prayer)" },
  { value: "study", label: "Study", color: "var(--color-cat-study)" },
  { value: "gym", label: "Gym", color: "var(--color-cat-gym)" },
  { value: "freelance", label: "Freelance", color: "var(--color-cat-freelance)" },
  { value: "personal", label: "Personal", color: "var(--color-cat-personal)" },
  { value: "work", label: "Work", color: "var(--color-cat-work)" },
  { value: "other", label: "Other", color: "var(--color-cat-other)" },
];

export function categoryColor(category) {
  return CATEGORIES.find((c) => c.value === category)?.color || "var(--color-cat-other)";
}

export const PRIORITIES = ["low", "medium", "high"];
