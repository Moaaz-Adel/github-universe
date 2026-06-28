import { NextResponse } from "next/server";

import type {
  GitHubEvent,
  GitHubOrganization,
  GitHubProfile,
  GitHubRepository,
} from "@/features/github/types";
import {
  createOfflineUniverseData,
  demoUniverseData,
} from "@/features/github/mockData";
import { buildLanguageDistribution } from "@/features/universe/math";

type RouteContext = {
  params: Promise<{ username: string }>;
};

const GITHUB_API = "https://api.github.com";

function githubHeaders() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function requestGitHub<T>(path: string) {
  let response: Response;

  try {
    response = await fetch(`${GITHUB_API}${path}`, {
      headers: githubHeaders(),
      next: { revalidate: 480 },
    });
  } catch {
    return {
      offline: true,
    };
  }

  if (!response.ok) {
    const message =
      response.status === 403
        ? "GitHub rate limit reached. Add GITHUB_TOKEN to raise the limit."
        : response.status === 404
          ? "That GitHub profile was not found."
          : "GitHub returned an unexpected response.";

    return {
      error: NextResponse.json(
        {
          code:
            response.status === 404
              ? "NOT_FOUND"
              : response.status === 403
                ? "RATE_LIMITED"
                : "GITHUB_ERROR",
          message,
        },
        { status: response.status },
      ),
      response,
    };
  }

  return {
    data: (await response.json()) as T,
    response,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { username } = await context.params;
  const safeUsername = username.trim();

  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(safeUsername)) {
    return NextResponse.json(
      {
        code: "NOT_FOUND",
        message: "Enter a valid GitHub username.",
      },
      { status: 400 },
    );
  }

  if (safeUsername.toLowerCase() === "demo") {
    return NextResponse.json(demoUniverseData);
  }

  const profileResult = await requestGitHub<GitHubProfile>(
    `/users/${safeUsername}`,
  );

  if ("offline" in profileResult) {
    return NextResponse.json(createOfflineUniverseData(safeUsername));
  }

  if ("error" in profileResult) {
    return profileResult.error;
  }

  const [repoResult, orgResult, eventResult] = await Promise.all([
    requestGitHub<GitHubRepository[]>(
      `/users/${safeUsername}/repos?per_page=100&sort=updated&type=owner`,
    ),
    requestGitHub<GitHubOrganization[]>(
      `/users/${safeUsername}/orgs?per_page=60`,
    ),
    requestGitHub<GitHubEvent[]>(
      `/users/${safeUsername}/events/public?per_page=60`,
    ),
  ]);

  if ("offline" in repoResult || "offline" in orgResult) {
    return NextResponse.json(createOfflineUniverseData(safeUsername));
  }
  if ("error" in repoResult) return repoResult.error;
  if ("error" in orgResult) return orgResult.error;

  const events = "data" in eventResult ? eventResult.data : [];
  const remaining =
    repoResult.response.headers.get("x-ratelimit-remaining") ??
    profileResult.response.headers.get("x-ratelimit-remaining");
  const reset =
    repoResult.response.headers.get("x-ratelimit-reset") ??
    profileResult.response.headers.get("x-ratelimit-reset");

  return NextResponse.json({
    profile: profileResult.data,
    repositories: repoResult.data,
    organizations: orgResult.data,
    events,
    languages: buildLanguageDistribution(repoResult.data),
    fetchedAt: new Date().toISOString(),
    rateLimit: { remaining, reset },
  });
}
