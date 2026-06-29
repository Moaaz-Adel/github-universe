"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Orbit,
  Radar,
  Search,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const examples = ["demo", "vercel", "github", "microsoft", "torvalds"];
const featureCards: Array<{
  title: string;
  body: string;
  Icon: LucideIcon;
}> = [
  {
    title: "Repository planets",
    body: "Size and orbit respond to stars, forks, watchers, and recency.",
    Icon: Orbit,
  },
  {
    title: "Language galaxies",
    body: "Each language receives a distinct color system and constellation lane.",
    Icon: Radar,
  },
  {
    title: "Living activity",
    body: "Recent events, issues, and releases become satellites and trails.",
    Icon: Sparkles,
  },
];

export function LandingExperience() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeGithubInput(username);

    if (normalized) {
      router.push(`/universe/${encodeURIComponent(normalized)}`);
    }
  }

  return (
    <main className="noise min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-white/20 sm:inline-flex"
          >
            <Code2 size={16} />
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-4 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)]">
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-aurora/25 bg-aurora/10 px-4 py-2 text-sm text-aurora"
          >
            <Sparkles size={16} />
            Stellar cartography for open source portfolios
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="font-display text-5xl font-semibold leading-[0.94] tracking-normal text-balance sm:text-7xl lg:text-8xl"
          >
            GitHub, rendered as a living universe.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl"
          >
            Repositories become planets, languages form star systems, forks turn
            into moons, and recent activity keeps the whole profile in motion.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            onSubmit={submit}
            className="glass mt-9 flex max-w-2xl flex-col gap-3 rounded-[2rem] p-3 sm:flex-row"
          >
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">GitHub username</span>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                size={19}
              />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="GitHub username or owner/repo"
                autoComplete="off"
                className="h-14 w-full rounded-full border border-transparent bg-white/10 pl-12 pr-4 text-base outline-none transition placeholder:text-[var(--muted)] focus:border-aurora/60"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-aurora px-6 font-semibold text-ink transition hover:scale-[1.02] hover:bg-nova"
            >
              Launch
              <ArrowRight size={18} />
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.34 }}
            className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]"
          >
            <span>Try</span>
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => router.push(`/universe/${example}`)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-[var(--foreground)] transition hover:border-aurora/50 hover:bg-aurora/10"
              >
                @{example}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.12 }}
          className="relative min-h-[34rem] lg:min-h-[44rem]"
          aria-hidden="true"
        >
          <LandingOrbit />
        </motion.div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-5 pb-10 sm:grid-cols-3 sm:px-8">
        {featureCards.map(({ title, body, Icon }) => (
          <div key={title} className="glass rounded-3xl p-6">
            <Icon className="mb-5 text-aurora" size={22} />
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

function normalizeGithubInput(value: string) {
  const trimmed = value.trim().replace(/^@/, "");
  const lowerTrimmed = trimmed.toLowerCase();
  const pathParts = trimmed.split("/").filter(Boolean);

  try {
    const url = new URL(
      lowerTrimmed.startsWith("github.com") ? `https://${trimmed}` : trimmed,
    );

    if (url.hostname === "github.com" || url.hostname.endsWith(".github.com")) {
      return url.pathname.split("/").filter(Boolean)[0] ?? "";
    }
  } catch {
    return pathParts[0] ?? trimmed;
  }

  return pathParts[0] ?? trimmed;
}

function LandingOrbit() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative aspect-square w-[min(92vw,42rem)]">
        <div className="absolute inset-[14%] rounded-full border border-aurora/20 bg-aurora/5 blur-sm" />
        {[0, 1, 2, 3, 4].map((orbit) => (
          <div
            key={orbit}
            className="absolute rounded-full border border-white/10"
            style={{
              inset: `${orbit * 8 + 5}%`,
              transform: `rotate(${orbit * 13}deg)`,
            }}
          />
        ))}
        {[
          ["TypeScript", "72%", "#2f81f7"],
          ["React", "41%", "#56f0b2"],
          ["Rust", "19%", "#ff8f50"],
          ["Docs", "12%", "#ffb84d"],
        ].map(([label, place, color], index) => (
          <motion.div
            key={label}
            className="absolute"
            style={{
              left: place,
              top: `${18 + index * 17}%`,
            }}
            animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
            transition={{
              duration: 5 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="grid size-16 place-items-center rounded-full border border-white/20 text-[10px] font-semibold text-ink shadow-glow"
              style={{ background: color }}
            >
              {label}
            </div>
          </motion.div>
        ))}
        <div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-porcelain text-center text-sm font-semibold text-ink shadow-glow">
          GitHub
          <br />
          profile
        </div>
      </div>
    </div>
  );
}
