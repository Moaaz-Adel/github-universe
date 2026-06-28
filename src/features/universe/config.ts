export const languagePalette: Record<string, string> = {
  TypeScript: "#2f81f7",
  JavaScript: "#f7df1e",
  Python: "#56f0b2",
  Go: "#00add8",
  Rust: "#ff8f50",
  Java: "#ff6b6b",
  Kotlin: "#a97bff",
  Swift: "#ffb84d",
  Ruby: "#e64b5f",
  PHP: "#8b9cff",
  C: "#9aa4b2",
  "C++": "#f34b7d",
  "C#": "#7b61ff",
  HTML: "#ff784f",
  CSS: "#4cc9f0",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Dart: "#00b4ab",
  Elixir: "#c792ea",
  Other: "#d7dce8",
};

export const universeMotion = {
  planetHoverScale: 1.14,
  cameraEase: [0.22, 1, 0.36, 1],
  panelTransition: { type: "spring", stiffness: 260, damping: 28 },
} as const;

export function getLanguageColor(language: string | null | undefined) {
  if (!language) {
    return languagePalette.Other;
  }

  return languagePalette[language] ?? languagePalette.Other;
}
