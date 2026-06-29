import { NextResponse } from "next/server";
import https from "node:https";

import type {
  GitHubEvent,
  GitHubOrganization,
  GitHubProfile,
  GitHubRepository,
} from "@/features/github/types";
import { demoUniverseData } from "@/features/github/mockData";
import { buildLanguageDistribution } from "@/features/universe/math";

type RouteContext = {
  params: Promise<{ username: string }>;
};

const GITHUB_API = "https://api.github.com";
const GITHUB_CACHE_TTL_MS = 8 * 60 * 1000;

type GitHubSuccess<T> = {
  data: T;
  headers: Headers;
  status: number;
};

type GitHubResponse<T> =
  | GitHubSuccess<T>
  | {
      error: NextResponse;
      headers?: Headers;
      status?: number;
    };

const githubResponseCache = new Map<
  string,
  { expiresAt: number; response: GitHubSuccess<unknown> }
>();

function githubHeaders() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "GitHub-Universe",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function requestGitHub<T>(path: string): Promise<GitHubResponse<T>> {
  const cached = getCachedGitHubResponse<T>(path);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers: githubHeaders(),
      next: { revalidate: 480 },
    });

    if (!response.ok) {
      return githubErrorResponse(response.status, response.headers);
    }

    return cacheGitHubResponse(path, {
      data: (await response.json()) as T,
      headers: new Headers(response.headers),
      status: response.status,
    });
  } catch (error) {
    if (
      process.env.NODE_ENV === "development" &&
      isLocalCertificateError(error)
    ) {
      return requestGitHubWithDevelopmentTlsBypass<T>(path);
    }

    return {
      error: NextResponse.json(
        {
          code: "OFFLINE",
          message:
            "GitHub could not be reached from this server. Check network, DNS, proxy, or TLS certificate settings.",
        },
        { status: 503 },
      ),
    };
  }
}

function getCachedGitHubResponse<T>(path: string): GitHubSuccess<T> | null {
  const cached = githubResponseCache.get(path);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    githubResponseCache.delete(path);
    return null;
  }

  return {
    data: cached.response.data as T,
    headers: new Headers(cached.response.headers),
    status: cached.response.status,
  };
}

function cacheGitHubResponse<T>(
  path: string,
  response: GitHubSuccess<T>,
): GitHubSuccess<T> {
  githubResponseCache.set(path, {
    expiresAt: Date.now() + GITHUB_CACHE_TTL_MS,
    response: {
      data: response.data,
      headers: new Headers(response.headers),
      status: response.status,
    },
  });

  return response;
}

function githubErrorResponse(
  status: number,
  headers?: Headers,
): GitHubResponse<never> {
  const resetMessage = formatRateLimitReset(headers);
  const message =
    status === 403
      ? `GitHub's public API limit is exhausted${resetMessage}. Try again later, or add an optional GITHUB_TOKEN to raise the limit.`
      : status === 404
        ? "That GitHub profile was not found."
        : "GitHub returned an unexpected response.";

  return {
    error: NextResponse.json(
      {
        code:
          status === 404
            ? "NOT_FOUND"
            : status === 403
              ? "RATE_LIMITED"
              : "GITHUB_ERROR",
        message,
      },
      { status },
    ),
    headers,
    status,
  };
}

function formatRateLimitReset(headers?: Headers) {
  const reset = headers?.get("x-ratelimit-reset");

  if (!reset) {
    return "";
  }

  const resetDate = new Date(Number(reset) * 1000);

  if (Number.isNaN(resetDate.getTime())) {
    return "";
  }

  return ` until ${resetDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })}`;
}

function isLocalCertificateError(error: unknown) {
  return (
    (error as { cause?: { code?: string } }).cause?.code ===
    "UNABLE_TO_GET_ISSUER_CERT_LOCALLY"
  );
}

function headersFromIncoming(
  headers: Record<string, string | string[] | undefined>,
) {
  const nextHeaders = new Headers();

  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      nextHeaders.set(key, value.join(", "));
    } else if (value) {
      nextHeaders.set(key, value);
    }
  });

  return nextHeaders;
}

function requestGitHubWithDevelopmentTlsBypass<T>(
  path: string,
): Promise<GitHubResponse<T>> {
  const headers = Object.fromEntries(new Headers(githubHeaders()).entries());

  return new Promise((resolve) => {
    const request = https.request(
      `${GITHUB_API}${path}`,
      {
        headers,
        rejectUnauthorized: false,
      },
      (response) => {
        let body = "";
        const responseHeaders = headersFromIncoming(response.headers);
        const status = response.statusCode ?? 500;

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (status < 200 || status >= 300) {
            resolve(githubErrorResponse(status, responseHeaders));
            return;
          }

          try {
            resolve(
              cacheGitHubResponse(path, {
                data: JSON.parse(body) as T,
                headers: responseHeaders,
                status,
              }),
            );
          } catch {
            resolve(githubErrorResponse(502, responseHeaders));
          }
        });
      },
    );

    request.on("error", () => {
      resolve({
        error: NextResponse.json(
          {
            code: "OFFLINE",
            message:
              "GitHub could not be reached from this server. Check network, DNS, proxy, or TLS certificate settings.",
          },
          { status: 503 },
        ),
      });
    });
    request.end();
  });
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

  if ("error" in repoResult) return repoResult.error;
  if ("error" in orgResult) return orgResult.error;

  const events = "data" in eventResult ? eventResult.data : [];
  const remaining =
    repoResult.headers.get("x-ratelimit-remaining") ??
    profileResult.headers.get("x-ratelimit-remaining");
  const reset =
    repoResult.headers.get("x-ratelimit-reset") ??
    profileResult.headers.get("x-ratelimit-reset");

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
