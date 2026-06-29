"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UniverseExperience } from "@/features/universe/UniverseExperience";

export function UniverseFromSearch() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username")?.trim();

  if (username) {
    return <UniverseExperience username={username} />;
  }

  return (
    <main className="noise grid min-h-screen place-items-center px-5">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[var(--background)]/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <section className="glass max-w-lg rounded-[2rem] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-aurora">
          Missing coordinates
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold">
          Choose a GitHub profile
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Search for a username from the landing page to map a repository
          universe.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-aurora px-6 font-semibold text-ink transition hover:bg-nova"
        >
          Back to launch
        </Link>
      </section>
    </main>
  );
}
