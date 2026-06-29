import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LandingExperience } from "@/features/landing/LandingExperience";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LandingExperience", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("routes to a username universe from the search form", async () => {
    const user = userEvent.setup();
    render(<LandingExperience />);

    await user.type(screen.getByLabelText("GitHub username"), "@vercel");
    await user.click(screen.getByRole("button", { name: /launch/i }));

    expect(push).toHaveBeenCalledWith("/universe?username=vercel");
  });
});
