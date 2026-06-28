import { describe, expect, it, vi } from "vitest";

import { fetchReadme, fetchUniverse } from "@/features/github/api";
import { UniverseFetchError } from "@/features/github/types";

describe("GitHub client API", () => {
  it("fetches universe data through the local route", async () => {
    const payload = { profile: { login: "octo" }, repositories: [] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    await expect(fetchUniverse("octo")).resolves.toBe(payload);
    expect(global.fetch).toHaveBeenCalledWith("/api/github/octo");
  });

  it("raises typed errors for failed universe requests", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        code: "NOT_FOUND",
        message: "That GitHub profile was not found.",
      }),
    });

    await expect(fetchUniverse("missing")).rejects.toBeInstanceOf(
      UniverseFetchError,
    );
  });

  it("returns null when a README cannot be loaded", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchReadme("octo", "missing")).resolves.toBeNull();
  });
});
