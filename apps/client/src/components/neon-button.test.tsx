import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NeonButton } from "@/components/neon-button";

describe("NeonButton", () => {
  it("renders a button by default", () => {
    render(<NeonButton>Buy</NeonButton>);
    expect(screen.getByRole("button", { name: "Buy" })).toBeTruthy();
  });

  it("renders a link when given an href", () => {
    render(<NeonButton href="/boutique">Shop</NeonButton>);
    expect(screen.getByRole("link", { name: "Shop" }).getAttribute("href")).toBe("/boutique");
  });

  it("does not leak the intent prop onto the DOM", () => {
    render(<NeonButton intent="service">Repair</NeonButton>);
    expect(screen.getByRole("button", { name: "Repair" }).getAttribute("intent")).toBeNull();
  });
});
