"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchUniverse } from "@/features/github/api";

export function useGitHubUniverse(username: string) {
  return useQuery({
    queryKey: ["github-universe", username.toLowerCase()],
    queryFn: () => fetchUniverse(username),
    staleTime: 1000 * 60 * 8,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error) {
        return (
          (error as { status?: number }).status !== 404 && failureCount < 1
        );
      }

      return failureCount < 1;
    },
  });
}
