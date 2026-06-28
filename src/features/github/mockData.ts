import type {
  GitHubEvent,
  GitHubOrganization,
  GitHubProfile,
  GitHubRepository,
  UniverseData,
} from "@/features/github/types";
import { buildLanguageDistribution } from "@/features/universe/math";

const now = new Date("2026-06-28T00:00:00Z");

function daysAgo(days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const demoOwner = {
  login: "demo",
  avatar_url: "https://avatars.githubusercontent.com/u/9919?v=4",
  html_url: "https://github.com/github",
};

const repositories: GitHubRepository[] = [
  repo(
    1,
    "nebula-ui",
    "A design system for orbital product interfaces.",
    "TypeScript",
    1240,
    122,
    18,
    12,
    4,
  ),
  repo(
    2,
    "starforge",
    "CLI that turns release workflows into observable pipelines.",
    "Go",
    860,
    97,
    22,
    18,
    12,
  ),
  repo(
    3,
    "orbit-db-lab",
    "Realtime collaboration experiments with visual conflict maps.",
    "Rust",
    640,
    61,
    31,
    9,
    28,
  ),
  repo(
    4,
    "constellation",
    "Language graph and dependency visualization toolkit.",
    "Python",
    420,
    44,
    12,
    7,
    2,
  ),
  repo(
    5,
    "mission-control",
    "Operations dashboard with timeline playback.",
    "JavaScript",
    380,
    39,
    6,
    14,
    16,
  ),
  repo(
    6,
    "solar-markdown",
    "README renderer with annotations and repository context.",
    "TypeScript",
    310,
    28,
    4,
    5,
    7,
  ),
  repo(
    7,
    "aurora-theme",
    "Color tokens, surface recipes, and accessible contrast checks.",
    "CSS",
    260,
    19,
    2,
    3,
    22,
  ),
  repo(
    8,
    "launchpad",
    "Template for new product experiments.",
    "Shell",
    190,
    24,
    1,
    2,
    40,
  ),
  repo(
    9,
    "vector-field",
    "Small WebGL experiments for animated dashboards.",
    "TypeScript",
    170,
    21,
    8,
    4,
    11,
  ),
  repo(
    10,
    "galaxy-docs",
    "Documentation site generator for technical teams.",
    "MDX",
    130,
    16,
    0,
    2,
    34,
  ),
  repo(
    11,
    "issue-comets",
    "Classifier that groups issues into product themes.",
    "Python",
    92,
    11,
    17,
    1,
    56,
  ),
  repo(
    12,
    "release-capsules",
    "Release note automation and changelog summaries.",
    "Ruby",
    76,
    8,
    3,
    1,
    83,
  ),
];

const profile: GitHubProfile = {
  login: "demo",
  name: "GitHub Universe Demo",
  bio: "A local sample account for exploring the universe without GitHub API access.",
  avatar_url: demoOwner.avatar_url,
  html_url: demoOwner.html_url,
  followers: 12840,
  following: 42,
  public_repos: repositories.length,
  public_gists: 18,
  location: "Orbit",
  company: "@github",
  blog: "https://github.com",
  twitter_username: null,
  created_at: "2019-01-01T00:00:00Z",
};

const organizations: GitHubOrganization[] = [
  {
    id: 1,
    login: "octo-labs",
    avatar_url: demoOwner.avatar_url,
    description: "Experimental developer tools.",
    url: "https://api.github.com/orgs/octo-labs",
  },
  {
    id: 2,
    login: "stellar-systems",
    avatar_url: demoOwner.avatar_url,
    description: "Design infrastructure for product teams.",
    url: "https://api.github.com/orgs/stellar-systems",
  },
];

const events: GitHubEvent[] = Array.from({ length: 48 }).map((_, index) => ({
  id: `demo-event-${index}`,
  type:
    index % 3 === 0
      ? "PushEvent"
      : index % 3 === 1
        ? "PullRequestEvent"
        : "IssuesEvent",
  repo: { name: `demo/${repositories[index % repositories.length].name}` },
  created_at: daysAgo(index % 31),
}));

export const demoUniverseData: UniverseData = {
  profile,
  repositories,
  organizations,
  events,
  languages: buildLanguageDistribution(repositories),
  fetchedAt: now.toISOString(),
  rateLimit: {
    remaining: "demo",
    reset: null,
  },
};

export function createOfflineUniverseData(username: string): UniverseData {
  const login = username.toLowerCase();
  const initial = login.slice(0, 1).toUpperCase();
  const avatarSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="24" fill="#101322"/><circle cx="48" cy="48" r="30" fill="#56f0b2"/><text x="48" y="58" font-family="Arial,sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#070713">${initial}</text></svg>`,
  );
  const owner = {
    login,
    avatar_url: `data:image/svg+xml,${avatarSvg}`,
    html_url: `https://github.com/${login}`,
  };
  const offlineRepositories = repositories.map((repository, index) => ({
    ...repository,
    id: 1000 + index,
    full_name: `${login}/${repository.name}`,
    html_url: `https://github.com/${login}/${repository.name}`,
    owner,
    topics: [
      "offline",
      ...repository.topics.filter((topic) => topic !== "demo"),
    ],
  }));
  const offlineEvents = events.map((event, index) => ({
    ...event,
    id: `${login}-offline-event-${index}`,
    repo: {
      name: `${login}/${offlineRepositories[index % offlineRepositories.length].name}`,
    },
  }));

  return {
    profile: {
      ...profile,
      login,
      name: `${username} Offline Universe`,
      bio: "GitHub could not be reached from this environment, so this fallback universe uses local sample telemetry.",
      avatar_url: owner.avatar_url,
      html_url: owner.html_url,
      public_repos: offlineRepositories.length,
    },
    repositories: offlineRepositories,
    organizations,
    events: offlineEvents,
    languages: buildLanguageDistribution(offlineRepositories),
    fetchedAt: new Date().toISOString(),
    rateLimit: {
      remaining: "offline",
      reset: null,
    },
  };
}

function repo(
  id: number,
  name: string,
  description: string,
  language: string,
  stars: number,
  forks: number,
  issues: number,
  watchers: number,
  updatedDaysAgo: number,
): GitHubRepository {
  return {
    id,
    name,
    full_name: `demo/${name}`,
    description,
    html_url: `https://github.com/github/${name}`,
    homepage: null,
    language,
    stargazers_count: stars,
    watchers_count: watchers,
    forks_count: forks,
    open_issues_count: issues,
    size: 800 + id * 230,
    archived: id === 12,
    private: false,
    fork: false,
    license: { name: id % 2 === 0 ? "MIT" : "Apache-2.0" },
    topics: ["demo", "visualization", language.toLowerCase()],
    pushed_at: daysAgo(updatedDaysAgo),
    updated_at: daysAgo(updatedDaysAgo),
    created_at: daysAgo(900 - id * 24),
    owner: demoOwner,
  };
}
