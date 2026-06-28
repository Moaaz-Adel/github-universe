"use client";

import { Building2, GitFork, Star, Users } from "lucide-react";

import type { GitHubRepository, UniverseData } from "@/features/github/types";
import { compactNumber, relativeDate } from "@/lib/format";

export function ProfileDashboard({
  data,
  visibleRepos,
}: {
  data: UniverseData;
  visibleRepos: GitHubRepository[];
}) {
  const totalStars = visibleRepos.reduce(
    (total, repo) => total + repo.stargazers_count,
    0,
  );
  const totalForks = visibleRepos.reduce(
    (total, repo) => total + repo.forks_count,
    0,
  );
  const topRepos = [...visibleRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <section className="glass rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <img
            src={data.profile.avatar_url}
            alt=""
            className="size-16 rounded-2xl border border-white/15"
          />
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-semibold">
              {data.profile.name ?? data.profile.login}
            </h2>
            <p className="truncate text-sm text-[var(--muted)]">
              @{data.profile.login}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat icon={Users} label="Followers" value={data.profile.followers} />
          <Stat
            icon={Building2}
            label="Orgs"
            value={data.organizations.length}
          />
          <Stat icon={Star} label="Stars" value={totalStars} />
          <Stat icon={GitFork} label="Forks" value={totalForks} />
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-display text-lg font-semibold">Language galaxy</h3>
        <div className="mt-4 space-y-3">
          {data.languages.slice(0, 6).map((item) => {
            const max = Math.max(
              ...data.languages.map((language) => language.repos),
            );
            const width = `${Math.max(9, (item.repos / max) * 100)}%`;

            return (
              <div key={item.language}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    {item.language}
                  </span>
                  <span className="text-[var(--muted)]">
                    {item.repos} repos
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{ width, background: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-display text-lg font-semibold">
          Contribution signal
        </h3>
        <ContributionHeatmap events={data.events} />
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-display text-lg font-semibold">Top planets</h3>
        <div className="mt-4 space-y-3">
          {topRepos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-aurora/50 hover:bg-aurora/10"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium">{repo.name}</span>
                <span className="text-sm text-nova">
                  {compactNumber(repo.stargazers_count)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-[var(--muted)]">
                Updated {relativeDate(repo.updated_at)}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <Icon className="mb-3 text-aurora" size={17} />
      <p className="font-display text-2xl font-semibold">
        {compactNumber(value)}
      </p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}

function ContributionHeatmap({ events }: { events: UniverseData["events"] }) {
  const days = Array.from({ length: 35 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (34 - index));
    const key = date.toISOString().slice(0, 10);
    const count = events.filter((event) =>
      event.created_at.startsWith(key),
    ).length;

    return { key, count };
  });
  const max = Math.max(1, ...days.map((day) => day.count));

  return (
    <div
      className="mt-4 grid grid-cols-7 gap-1.5"
      aria-label="Recent activity heatmap"
    >
      {days.map((day) => (
        <span
          key={day.key}
          title={`${day.count} events on ${day.key}`}
          className="aspect-square rounded-md border border-white/10"
          style={{
            background:
              day.count === 0
                ? "rgba(255,255,255,0.06)"
                : `rgba(86, 240, 178, ${0.18 + (day.count / max) * 0.72})`,
          }}
        />
      ))}
    </div>
  );
}
