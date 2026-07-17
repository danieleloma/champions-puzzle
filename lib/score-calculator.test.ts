import { describe, expect, it } from "vitest";
import { calculateScore, calculateXP, formatTime, getRankBadge } from "./score-calculator";

describe("calculateScore", () => {
  it("scores a fast, hint-free, move-efficient run higher than a slow, hint-heavy one", () => {
    const fast = calculateScore({ difficulty: "easy", completionTimeMs: 15_000, moveCount: 16, hintsUsed: 0 });
    const slow = calculateScore({ difficulty: "easy", completionTimeMs: 300_000, moveCount: 60, hintsUsed: 4 });
    expect(fast).toBeGreaterThan(slow);
  });

  it("scales the base score with the difficulty's xpMultiplier", () => {
    const beginner = calculateScore({ difficulty: "beginner", completionTimeMs: 10_000, moveCount: 9, hintsUsed: 0 });
    const medium = calculateScore({ difficulty: "medium", completionTimeMs: 10_000, moveCount: 25, hintsUsed: 0 });
    expect(medium).toBeGreaterThan(beginner);
  });

  it("never returns less than 1, even for an extremely slow, hint-heavy run", () => {
    const score = calculateScore({ difficulty: "beginner", completionTimeMs: 10_000_000, moveCount: 500, hintsUsed: 5 });
    expect(score).toBeGreaterThanOrEqual(1);
  });
});

describe("calculateXP", () => {
  it("awards the speed bonus under 60s and withholds it at/above 60s", () => {
    const under = calculateXP({ difficulty: "beginner", completionTimeMs: 59_999, hintsUsed: 0, score: 10_000 });
    const over = calculateXP({ difficulty: "beginner", completionTimeMs: 60_000, hintsUsed: 0, score: 10_000 });
    expect(under).toBeGreaterThan(over);
  });

  it("awards the no-hint bonus only when hintsUsed is 0", () => {
    const noHints = calculateXP({ difficulty: "beginner", completionTimeMs: 120_000, hintsUsed: 0, score: 10_000 });
    const withHints = calculateXP({ difficulty: "beginner", completionTimeMs: 120_000, hintsUsed: 1, score: 10_000 });
    expect(noHints).toBeGreaterThan(withHints);
  });
});

describe("formatTime", () => {
  it("formats sub-second durations in raw ms", () => {
    expect(formatTime(500)).toBe("500ms");
  });

  it("formats sub-minute durations as seconds.centiseconds", () => {
    expect(formatTime(12_340)).toBe("12.34s");
  });

  it("formats minute-plus durations as m:ss.cc", () => {
    expect(formatTime(75_000)).toBe("1:15.00");
  });

  it("zero-pads seconds and centiseconds", () => {
    expect(formatTime(65_050)).toBe("1:05.05");
  });
});

describe("getRankBadge", () => {
  it("returns medals for the top 3", () => {
    expect(getRankBadge(1)).toBe("🥇");
    expect(getRankBadge(2)).toBe("🥈");
    expect(getRankBadge(3)).toBe("🥉");
  });

  it("returns a trophy for top 10, a star for top 100, and a generic medal beyond", () => {
    expect(getRankBadge(10)).toBe("🏆");
    expect(getRankBadge(100)).toBe("⭐");
    expect(getRankBadge(101)).toBe("🎖️");
  });
});
