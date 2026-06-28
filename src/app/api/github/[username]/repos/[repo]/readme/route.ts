import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ username: string; repo: string }>;
};

const GITHUB_API = "https://api.github.com";

function githubHeaders() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.raw+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

export async function GET(_request: Request, context: RouteContext) {
  const { username, repo } = await context.params;
  const response = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/readme`,
    {
      headers: githubHeaders(),
      next: { revalidate: 900 },
    },
  );

  if (!response.ok) {
    return NextResponse.json({ readme: null }, { status: response.status });
  }

  const readme = await response.text();

  return NextResponse.json({
    readme: readme.slice(0, 7000),
  });
}
