import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 rounded-full"
      aria-label="GitHub Universe home"
    >
      <span className="relative grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 shadow-glow">
        <span className="size-4 rounded-full bg-aurora shadow-[0_0_28px_rgba(86,240,178,0.8)]" />
        <span className="absolute size-8 rounded-full border border-nova/70" />
      </span>
      <span className="font-display text-lg font-semibold tracking-normal">
        GitHub Universe
      </span>
    </Link>
  );
}
