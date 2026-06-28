"use client";

import { create } from "zustand";

import type { GitHubRepository } from "@/features/github/types";

type UniverseState = {
  selectedRepo: GitHubRepository | null;
  query: string;
  language: string;
  minStars: number;
  showArchived: boolean;
  setSelectedRepo: (repo: GitHubRepository | null) => void;
  setQuery: (query: string) => void;
  setLanguage: (language: string) => void;
  setMinStars: (minStars: number) => void;
  setShowArchived: (showArchived: boolean) => void;
};

export const useUniverseStore = create<UniverseState>((set) => ({
  selectedRepo: null,
  query: "",
  language: "All",
  minStars: 0,
  showArchived: true,
  setSelectedRepo: (repo) => set({ selectedRepo: repo }),
  setQuery: (query) => set({ query }),
  setLanguage: (language) => set({ language }),
  setMinStars: (minStars) => set({ minStars }),
  setShowArchived: (showArchived) => set({ showArchived }),
}));
