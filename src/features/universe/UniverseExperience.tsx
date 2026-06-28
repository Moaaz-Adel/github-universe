"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Filter,
  Code2,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import { useMemo } from "react";

import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useGitHubUniverse } from "@/features/github/useGitHubUniverse";
import { ProfileDashboard } from "@/features/profile/ProfileDashboard";
import { RepositoryModal } from "@/features/repository/RepositoryModal";
import { createPlanetNodes } from "@/features/universe/math";
import { useUniverseStore } from "@/features/universe/store";

const UniverseCanvas = dynamic(
  () =>
    import("@/features/universe/UniverseCanvas").then(
      (mod) => mod.UniverseCanvas,
    ),
  {
    ssr: false,
    loading: () => <SceneFallback />,
  },
);

export function UniverseExperience({ username }: { username: string }) {
  const { data, isLoading, error, refetch, isFetching } =
    useGitHubUniverse(username);
  const query = useUniverseStore((state) => state.query);
  const language = useUniverseStore((state) => state.language);
  const minStars = useUniverseStore((state) => state.minStars);
  const showArchived = useUniverseStore((state) => state.showArchived);
  const setQuery = useUniverseStore((state) => state.setQuery);
  const setLanguage = useUniverseStore((state) => state.setLanguage);
  const setMinStars = useUniverseStore((state) => state.setMinStars);
  const setShowArchived = useUniverseStore((state) => state.setShowArchived);

  const languages = useMemo(
    () => ["All", ...(data?.languages.map((item) => item.language) ?? [])],
    [data?.languages],
  );

  const filteredRepos = useMemo(() => {
    const normalized = query.toLowerCase();

    return (
      data?.repositories.filter((repo) => {
        const matchesQuery =
          repo.name.toLowerCase().includes(normalized) ||
          repo.description?.toLowerCase().includes(normalized);
        const matchesLanguage =
          language === "All" || (repo.language ?? "Other") === language;
        const matchesStars = repo.stargazers_count >= minStars;
        const matchesArchived = showArchived || !repo.archived;

        return (
          matchesQuery && matchesLanguage && matchesStars && matchesArchived
        );
      }) ?? []
    );
  }, [data?.repositories, language, minStars, query, showArchived]);

  const planets = useMemo(
    () => createPlanetNodes(filteredRepos),
    [filteredRepos],
  );

  return (
    <main className="noise min-h-screen overflow-hidden">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[var(--background)]/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[96rem] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
              aria-label="Back to landing"
            >
              <ArrowLeft size={18} />
            </Link>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            {data ? (
              <a
                href={data.profile.html_url}
                className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20 sm:inline-flex"
              >
                <Code2 size={16} />@{data.profile.login}
              </a>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="grid min-h-screen pt-16 lg:h-screen lg:min-h-0 lg:grid-cols-[22rem_minmax(0,1fr)_24rem] lg:overflow-hidden">
        <aside className="z-20 border-b border-white/10 bg-[var(--background)]/80 p-4 backdrop-blur-2xl lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pt-6">
          <ControlPanel
            isFetching={isFetching}
            languages={languages}
            query={query}
            language={language}
            minStars={minStars}
            showArchived={showArchived}
            onQueryChange={setQuery}
            onLanguageChange={setLanguage}
            onMinStarsChange={setMinStars}
            onShowArchivedChange={setShowArchived}
            onRefresh={() => void refetch()}
          />
        </aside>

        <section className="relative min-h-[34rem] overflow-hidden lg:min-h-0">
          {isLoading ? <SceneFallback /> : null}
          {error ? (
            <ErrorState
              message={(error as Error).message}
              onRetry={() => void refetch()}
            />
          ) : null}
          {data && !error ? (
            <>
              <UniverseCanvas planets={planets} />
              <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-10 flex flex-wrap items-end justify-between gap-3">
                <div className="glass pointer-events-auto max-w-xl rounded-3xl p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-aurora">
                    Universe loaded
                  </p>
                  <h1 className="mt-2 font-display text-3xl font-semibold">
                    {data.profile.name ?? data.profile.login}
                  </h1>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                    {data.profile.bio ??
                      "A live map of repositories, language systems, organizations, and recent activity."}
                  </p>
                </div>
                <div className="glass pointer-events-auto rounded-3xl p-4 text-sm text-[var(--muted)]">
                  <span className="text-[var(--foreground)]">
                    {filteredRepos.length}
                  </span>{" "}
                  visible planets
                </div>
              </div>
            </>
          ) : null}
        </section>

        <aside className="z-20 border-t border-white/10 bg-[var(--background)]/80 p-4 backdrop-blur-2xl lg:overflow-y-auto lg:border-l lg:border-t-0 lg:pt-6">
          {data ? (
            <ProfileDashboard data={data} visibleRepos={filteredRepos} />
          ) : (
            <DashboardSkeleton />
          )}
        </aside>
      </section>

      {data ? <RepositoryModal username={data.profile.login} /> : null}
    </main>
  );
}

function ControlPanel({
  isFetching,
  languages,
  query,
  language,
  minStars,
  showArchived,
  onQueryChange,
  onLanguageChange,
  onMinStarsChange,
  onShowArchivedChange,
  onRefresh,
}: {
  isFetching: boolean;
  languages: string[];
  query: string;
  language: string;
  minStars: number;
  showArchived: boolean;
  onQueryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onMinStarsChange: (value: number) => void;
  onShowArchivedChange: (value: boolean) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-aurora">
          <Filter size={14} />
          Mission control
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">
          Explore the map
        </h2>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-[var(--muted)]">
          Search repositories
        </span>
        <span className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            size={17}
          />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 pl-10 pr-3 outline-none transition focus:border-aurora/70"
            placeholder="repo name, topic, idea"
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-[var(--muted)]">
          Language system
        </span>
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 px-3 outline-none transition focus:border-aurora/70"
        >
          {languages.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
          Minimum stars{" "}
          <span className="text-[var(--foreground)]">{minStars}</span>
        </span>
        <input
          type="range"
          min="0"
          max="500"
          step="10"
          value={minStars}
          onChange={(event) => onMinStarsChange(Number(event.target.value))}
          className="w-full accent-aurora"
        />
      </label>

      <label className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
        Include archived planets
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(event) => onShowArchivedChange(event.target.checked)}
          className="size-5 accent-aurora"
        />
      </label>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-aurora font-semibold text-ink transition hover:bg-nova"
      >
        {isFetching ? (
          <Loader2 className="animate-spin" size={17} />
        ) : (
          <RotateCcw size={17} />
        )}
        Refresh telemetry
      </button>
    </div>
  );
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="glass flex items-center gap-3 rounded-3xl px-5 py-4 text-[var(--muted)]">
        <Loader2 className="animate-spin text-aurora" size={20} />
        Mapping repositories into orbit
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-md rounded-3xl p-6 text-center"
      >
        <AlertTriangle className="mx-auto text-ember" size={30} />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          Could not map this universe
        </h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-aurora px-5 font-semibold text-ink"
        >
          Try again
        </button>
      </motion.div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/10"
        />
      ))}
    </div>
  );
}
