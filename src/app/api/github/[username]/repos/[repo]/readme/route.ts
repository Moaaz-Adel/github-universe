import { NextResponse } from "next/server";
import https from "node:https";

type RouteContext = {
  params: Promise<{ username: string; repo: string }>;
};

const GITHUB_API = "https://api.github.com";

function githubHeaders() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": "GitHub-Universe",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

function isLocalCertificateError(error: unknown) {
  return (
    (error as { cause?: { code?: string } }).cause?.code ===
    "UNABLE_TO_GET_ISSUER_CERT_LOCALLY"
  );
}

function fetchReadmeWithDevelopmentTlsBypass(path: string): Promise<Response> {
  const headers = Object.fromEntries(new Headers(githubHeaders()).entries());

  return new Promise((resolve, reject) => {
    const request = https.request(
      `${GITHUB_API}${path}`,
      {
        headers,
        rejectUnauthorized: false,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.from(chunk));
        });
        response.on("end", () => {
          resolve(
            new Response(Buffer.concat(chunks), {
              status: response.statusCode ?? 500,
            }),
          );
        });
      },
    );

    request.on("error", reject);
    request.end();
  });
}

async function fetchReadme(path: string) {
  try {
    return await fetch(`${GITHUB_API}${path}`, {
      headers: githubHeaders(),
      next: { revalidate: 900 },
    });
  } catch (error) {
    if (
      process.env.NODE_ENV === "development" &&
      isLocalCertificateError(error)
    ) {
      return fetchReadmeWithDevelopmentTlsBypass(path);
    }

    return null;
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { username, repo } = await context.params;
  const response = await fetchReadme(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/readme`,
  );

  if (!response?.ok) {
    return NextResponse.json(
      { readme: null },
      { status: response?.status ?? 503 },
    );
  }

  const readme = await response.text();

  return NextResponse.json({
    readme: readme.slice(0, 7000),
  });
}
