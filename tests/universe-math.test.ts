import { describe, expect, it } from "vitest";

import type { GitHubRepository } from "@/features/github/types";
import {
  buildLanguageDistribution,
  createPlanetNodes,
  scoreRepository,
} from "@/features/universe/math";

function repo(overrides: Partial<GitHubRepository>): GitHubRepository {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? "repo",
    full_name: overrides.full_name ?? "octo/repo",
    description: null,
    html_url: "https://github.com/octo/repo",
    homepage: null,
    language: overrides.language ?? "TypeScript",
    stargazers_count: overrides.stargazers_count ?? 0,
    watchers_count: overrides.watchers_count ?? 0,
    forks_count: overrides.forks_count ?? 0,
    open_issues_count: overrides.open_issues_count ?? 0,
    size: overrides.size ?? 100,
    archived: false,
    private: false,
    fork: false,
    license: null,
    topics: [],
    pushed_at: overrides.pushed_at ?? new Date().toISOString(),
    updated_at: overrides.updated_at ?? new Date().toISOString(),
    created_at: overrides.created_at ?? "2020-01-01T00:00:00Z",
    owner: {
      login: "octo",
      avatar_url: "https://example.com/avatar.png",
      html_url: "https://github.com/octo",
    },
  };
}

describe("universe math", () => {
  it("scores popular and active repositories higher", () => {
    const quiet = repo({ stargazers_count: 1, forks_count: 0, size: 25 });
    const active = repo({ stargazers_count: 50, forks_count: 12, size: 900 });

    expect(scoreRepository(active)).toBeGreaterThan(scoreRepository(quiet));
  });

  it("builds sorted language distributions", () => {
    const distribution = buildLanguageDistribution([
      repo({ language: "TypeScript", stargazers_count: 10 }),
      repo({ language: "Python", stargazers_count: 40 }),
      repo({ language: "TypeScript", stargazers_count: 5 }),
    ]);

    expect(distribution[0]).toMatchObject({ language: "Python", repos: 1 });
    expect(distribution[1]).toMatchObject({
      language: "TypeScript",
      repos: 2,
      stars: 15,
    });
  });

  it("creates deterministic planet nodes", () => {
    const nodes = createPlanetNodes([
      repo({ id: 1, name: "small", stargazers_count: 2 }),
      repo({ id: 2, name: "large", stargazers_count: 100 }),
    ]);

    expect(nodes).toHaveLength(2);
    expect(nodes[0].repo.name).toBe("large");
    expect(nodes[0].orbitRadius).toBeGreaterThan(0);
    expect(nodes[0].position).toHaveLength(3);
  });
});
