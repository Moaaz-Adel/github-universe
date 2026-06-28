export type GitHubOwner = {
  login: string;
  avatar_url: string;
  html_url: string;
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  archived: boolean;
  private: boolean;
  fork: boolean;
  license: { name: string } | null;
  topics: string[];
  pushed_at: string;
  updated_at: string;
  created_at: string;
  owner: GitHubOwner;
};

export type GitHubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  created_at: string;
};

export type GitHubOrganization = {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
  url: string;
};

export type GitHubEvent = {
  id: string;
  type: string;
  repo?: { name: string };
  created_at: string;
};

export type LanguageDatum = {
  language: string;
  repos: number;
  stars: number;
  forks: number;
  bytes: number;
  color: string;
};

export type UniverseData = {
  profile: GitHubProfile;
  repositories: GitHubRepository[];
  organizations: GitHubOrganization[];
  events: GitHubEvent[];
  languages: LanguageDatum[];
  fetchedAt: string;
  rateLimit?: {
    remaining: string | null;
    reset: string | null;
  };
};

export type UniverseErrorCode =
  "NOT_FOUND" | "RATE_LIMITED" | "OFFLINE" | "GITHUB_ERROR";

export class UniverseFetchError extends Error {
  constructor(
    message: string,
    public code: UniverseErrorCode = "GITHUB_ERROR",
    public status = 500,
  ) {
    super(message);
    this.name = "UniverseFetchError";
  }
}
