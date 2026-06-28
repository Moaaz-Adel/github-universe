import type { GitHubRepository, LanguageDatum } from "@/features/github/types";
import { getLanguageColor } from "@/features/universe/config";

export type PlanetNode = {
  repo: GitHubRepository;
  color: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
  moons: number;
  satellites: number;
  activityScore: number;
  position: [number, number, number];
};

export function scoreRepository(repo: GitHubRepository) {
  const ageDays = Math.max(
    1,
    (Date.now() - new Date(repo.pushed_at).getTime()) / 86_400_000,
  );
  const recencyBoost = Math.max(0.16, 1 / Math.log10(ageDays + 10));

  return (
    repo.stargazers_count * 3 +
    repo.watchers_count * 1.6 +
    repo.forks_count * 2.2 +
    Math.sqrt(repo.size) * 0.18 +
    recencyBoost * 34
  );
}

export function buildLanguageDistribution(repos: GitHubRepository[]) {
  const byLanguage = new Map<string, LanguageDatum>();

  repos.forEach((repo) => {
    const language = repo.language ?? "Other";
    const existing = byLanguage.get(language) ?? {
      language,
      repos: 0,
      stars: 0,
      forks: 0,
      bytes: 0,
      color: getLanguageColor(language),
    };

    existing.repos += 1;
    existing.stars += repo.stargazers_count;
    existing.forks += repo.forks_count;
    existing.bytes += repo.size;
    byLanguage.set(language, existing);
  });

  return Array.from(byLanguage.values()).sort((a, b) => b.stars - a.stars);
}

export function createPlanetNodes(repos: GitHubRepository[]) {
  const sorted = [...repos].sort(
    (a, b) => scoreRepository(b) - scoreRepository(a),
  );

  return sorted.map<PlanetNode>((repo, index) => {
    const activityScore = scoreRepository(repo);
    const band = index % 7;
    const orbitRadius = 6 + band * 3.1 + Math.floor(index / 7) * 1.35;
    const initialAngle = ((index * 137.5) % 360) * (Math.PI / 180);
    const radius = Math.min(1.9, 0.42 + Math.log10(activityScore + 8) * 0.27);
    const y = ((index % 5) - 2) * 0.46;

    return {
      repo,
      color: getLanguageColor(repo.language),
      radius,
      orbitRadius,
      orbitSpeed: 0.07 + (7 - band) * 0.009,
      initialAngle,
      moons: Math.min(6, Math.ceil(repo.forks_count / 12)),
      satellites: Math.min(8, Math.ceil(repo.open_issues_count / 8)),
      activityScore,
      position: [
        Math.cos(initialAngle) * orbitRadius,
        y,
        Math.sin(initialAngle) * orbitRadius,
      ],
    };
  });
}
