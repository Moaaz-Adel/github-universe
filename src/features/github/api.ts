import {
  UniverseFetchError,
  type GitHubEvent,
  type GitHubOrganization,
  type GitHubProfile,
  type GitHubRepository,
  type UniverseData,
} from "@/features/github/types";
import { demoUniverseData } from "@/features/github/mockData";
import { buildLanguageDistribution } from "@/features/universe/math";

const GITHUB_API = "https://api.github.com";
const GITHUB_JSON_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
const GITHUB_RAW_HEADERS = {
  Accept: "application/vnd.github.raw+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
const usesStaticGitHubClient = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

export async function fetchUniverse(username: string): Promise<UniverseData> {
  if (usesStaticGitHubClient) {
    return fetchUniverseFromGitHub(username);
  }

  const response = await fetch(`/api/github/${encodeURIComponent(username)}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      msg?: string;
      code?: UniverseFetchError["code"];
    } | null;

    throw new UniverseFetchError(
      payload?.message ?? payload?.msg ?? "GitHub data could not be loaded.",
      payload?.code ?? "GITHUB_ERROR",
      response.status,
    );
  }

  return response.json() as Promise<UniverseData>;
}

export async function fetchReadme(username: string, repo: string) {
  if (usesStaticGitHubClient) {
    return fetchReadmeFromGitHub(username, repo);
  }

  const response = await fetch(
    `/api/github/${encodeURIComponent(username)}/repos/${encodeURIComponent(repo)}/readme`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { readme: string | null };
  return data.readme;
}

async function fetchUniverseFromGitHub(
  username: string,
): Promise<UniverseData> {
  const safeUsername = username.trim();

  if (safeUsername.toLowerCase() === "demo") {
    return demoUniverseData;
  }

  const profile = await fetchGitHubJson<GitHubProfile>(
    `/users/${safeUsername}`,
  );
  const [repositories, organizations, events] = await Promise.all([
    fetchGitHubJson<GitHubRepository[]>(
      `/users/${safeUsername}/repos?per_page=100&sort=updated&type=owner`,
    ),
    fetchGitHubJson<GitHubOrganization[]>(
      `/users/${safeUsername}/orgs?per_page=60`,
    ),
    fetchGitHubJson<GitHubEvent[]>(
      `/users/${safeUsername}/events/public?per_page=60`,
    ).catch(() => []),
  ]);

  return {
    profile,
    repositories,
    organizations,
    events,
    languages: buildLanguageDistribution(repositories),
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchReadmeFromGitHub(username: string, repo: string) {
  const response = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/readme`,
    {
      headers: GITHUB_RAW_HEADERS,
    },
  );

  if (!response.ok) {
    return null;
  }

  return (await response.text()).slice(0, 7000);
}

async function fetchGitHubJson<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: GITHUB_JSON_HEADERS,
  });

  if (!response.ok) {
    throw createGitHubError(response);
  }

  return response.json() as Promise<T>;
}

function createGitHubError(response: Response) {
  const code =
    response.status === 404
      ? "NOT_FOUND"
      : response.status === 403
        ? "RATE_LIMITED"
        : "GITHUB_ERROR";
  const reset = response.headers.get("x-ratelimit-reset");
  const resetTime = reset ? new Date(Number(reset) * 1000) : null;
  const resetMessage =
    resetTime && !Number.isNaN(resetTime.getTime())
      ? ` Try again after ${resetTime.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })}.`
      : "";
  const message =
    response.status === 404
      ? "That GitHub profile was not found."
      : response.status === 403
        ? `GitHub's public API limit is exhausted.${resetMessage}`
        : "GitHub data could not be loaded.";

  return new UniverseFetchError(message, code, response.status);
}
