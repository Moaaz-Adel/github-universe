import type { UniverseData } from "@/features/github/types";
import { UniverseFetchError } from "@/features/github/types";

export async function fetchUniverse(username: string): Promise<UniverseData> {
  const response = await fetch(`/api/github/${encodeURIComponent(username)}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      code?: UniverseFetchError["code"];
    } | null;

    throw new UniverseFetchError(
      payload?.message ?? "GitHub data could not be loaded.",
      payload?.code ?? "GITHUB_ERROR",
      response.status,
    );
  }

  return response.json() as Promise<UniverseData>;
}

export async function fetchReadme(username: string, repo: string) {
  const response = await fetch(
    `/api/github/${encodeURIComponent(username)}/repos/${encodeURIComponent(repo)}/readme`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { readme: string | null };
  return data.readme;
}
