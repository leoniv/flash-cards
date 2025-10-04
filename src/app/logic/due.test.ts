import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies used by due.ts
const NOW = new Date("2024-01-01T00:00:00.000Z").getTime();

type ReviewState = { ivl: number; ease: number; due: number };
const DEFAULT: ReviewState = { ivl: 0, ease: 2.5, due: 0 };

const states: Record<string, ReviewState> = {
  a: { ivl: 0, ease: 2.5, due: NOW - 1 }, // past due
  b: { ivl: 0, ease: 2.5, due: NOW + 1 }, // not due
  c: { ivl: 0, ease: 2.5, due: NOW - 1000 }, // past due
};

vi.mock("./srsStore", () => {
  return {
    loadSrs: vi.fn(() => ({})),
    getState: (s: unknown, id: string) => states[id] ?? DEFAULT,
  };
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("dueCards", () => {
  it("returns only cards due at or before now", async () => {
    const { dueCards } = await import("./due");
    const cards = [
      { id: "a", deck: "x", path: "cards/x/a.md" },
      { id: "b", deck: "x", path: "cards/x/b.md" },
      { id: "c", deck: "y", path: "cards/y/c.md" },
    ];

    const result = dueCards(cards);
    expect(result.map((c) => c.id).sort()).toEqual(["a", "c"]);

    const srs = await import("./srsStore");
    expect((srs.loadSrs as any).mock.calls.length).toBeGreaterThan(0);
  });

  it("filters by deck when provided", async () => {
    const { dueCards } = await import("./due");
    const cards = [
      { id: "a", deck: "x", path: "cards/x/a.md" },
      { id: "b", deck: "x", path: "cards/x/b.md" },
      { id: "c", deck: "y", path: "cards/y/c.md" },
    ];

    const result = dueCards(cards, "x");
    expect(result.map((c) => c.id)).toEqual(["a"]);
  });
});
