"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  GitFork,
  Star,
  TimerReset,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { fetchReadme } from "@/features/github/api";
import { useUniverseStore } from "@/features/universe/store";
import { compactNumber, relativeDate } from "@/lib/format";

export function RepositoryModal({ username }: { username: string }) {
  const selectedRepo = useUniverseStore((state) => state.selectedRepo);
  const setSelectedRepo = useUniverseStore((state) => state.setSelectedRepo);
  const { data: readme } = useQuery({
    queryKey: ["repo-readme", username, selectedRepo?.name],
    queryFn: () => fetchReadme(username, selectedRepo?.name ?? ""),
    enabled: Boolean(selectedRepo),
    staleTime: 1000 * 60 * 20,
  });

  return (
    <AnimatePresence>
      {selectedRepo ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/72 p-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="repo-modal-title"
          onClick={() => setSelectedRepo(null)}
        >
          <motion.section
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="mx-auto my-8 max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-[var(--panel-strong)] shadow-glass"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative border-b border-white/10 p-6 sm:p-8">
              <button
                type="button"
                onClick={() => setSelectedRepo(null)}
                className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
                aria-label="Close repository details"
              >
                <X size={18} />
              </button>
              <p className="text-xs uppercase tracking-[0.2em] text-aurora">
                Repository planet
              </p>
              <h2
                id="repo-modal-title"
                className="mt-3 max-w-3xl font-display text-4xl font-semibold sm:text-6xl"
              >
                {selectedRepo.name}
              </h2>
              <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
                {selectedRepo.description ??
                  "No repository description provided."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedRepo.topics.slice(0, 10).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <Metric
                    icon={Star}
                    label="Stars"
                    value={selectedRepo.stargazers_count}
                  />
                  <Metric
                    icon={GitFork}
                    label="Forks"
                    value={selectedRepo.forks_count}
                  />
                  <Metric
                    icon={BookOpen}
                    label="Issues"
                    value={selectedRepo.open_issues_count}
                  />
                  <Metric
                    icon={TimerReset}
                    label="Watchers"
                    value={selectedRepo.watchers_count}
                  />
                </div>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                    <BookOpen size={19} className="text-aurora" />
                    README preview
                  </h3>
                  <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-ink/70 p-4 text-sm leading-6 text-[#d7dce8]">
                    {readme ??
                      "README preview is unavailable for this repository or the GitHub rate limit has been reached."}
                  </pre>
                </section>
              </div>

              <aside className="space-y-4">
                <InfoRow
                  label="Language"
                  value={selectedRepo.language ?? "Other"}
                />
                <InfoRow
                  label="License"
                  value={selectedRepo.license?.name ?? "Unlicensed"}
                />
                <InfoRow
                  label="Visibility"
                  value={selectedRepo.private ? "Private" : "Public"}
                />
                <InfoRow
                  label="Last updated"
                  value={relativeDate(selectedRepo.updated_at)}
                />
                <InfoRow
                  label="Created"
                  value={new Date(selectedRepo.created_at)
                    .getFullYear()
                    .toString()}
                />
                <a
                  href={selectedRepo.html_url}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-aurora font-semibold text-ink transition hover:bg-nova"
                >
                  Open on GitHub
                  <ExternalLink size={17} />
                </a>
              </aside>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className="mb-3 text-nova" size={18} />
      <p className="font-display text-2xl font-semibold">
        {compactNumber(value)}
      </p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}
