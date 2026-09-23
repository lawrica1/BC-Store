import { describe, expect, it } from "vitest";
import { cn, formatXaf } from "@/lib/utils";

describe("formatXaf", () => {
  it("appends the FCFA currency label", () => {
    expect(formatXaf(45000, "fr")).toMatch(/FCFA$/);
  });

  it("groups thousands digits", () => {
    expect(formatXaf(1234567, "en").replace(/\D/g, "")).toBe("1234567");
  });
});

describe("cn", () => {
  it("merges conflicting tailwind classes, last one wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    const skip = false as boolean;
    expect(cn("a", skip && "b", undefined, "c")).toBe("a c");
  });
});
