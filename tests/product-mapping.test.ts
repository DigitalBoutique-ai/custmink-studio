import { describe, expect, it } from "vitest";

import {
  TOTAL_SECTIONS,
  readinessScore,
  relativeTime,
  toProduct,
} from "@/lib/data/product-mapping";

describe("readiness scoring", () => {
  it("scores an empty product at 0 and a finished one at 100", () => {
    expect(readinessScore(0)).toBe(0);
    expect(readinessScore(TOTAL_SECTIONS)).toBe(100);
  });

  it("scores partial completion proportionally", () => {
    expect(readinessScore(6)).toBe(60);
    expect(readinessScore(TOTAL_SECTIONS / 2)).toBe(50);
  });

  it("clamps values outside the section range", () => {
    expect(readinessScore(-3)).toBe(0);
    expect(readinessScore(TOTAL_SECTIONS + 5)).toBe(100);
  });
});

describe("relative timestamps", () => {
  const now = new Date("2026-08-31T18:00:00Z");

  it("renders recent edits in minutes", () => {
    expect(relativeTime(new Date("2026-08-31T17:52:00Z"), now)).toBe("8 min ago");
  });

  it("renders sub-minute edits as Just now", () => {
    expect(relativeTime(new Date("2026-08-31T17:59:40Z"), now)).toBe("Just now");
  });

  it("renders the previous day as Yesterday", () => {
    expect(relativeTime(new Date("2026-08-30T17:00:00Z"), now)).toBe("Yesterday");
  });

  it("falls back to a short date beyond a day, matching the prototype's \"Aug 27\"", () => {
    expect(relativeTime(new Date("2026-08-27T17:00:00Z"), now)).toBe("Aug 27");
    expect(relativeTime(new Date("2026-08-20T17:00:00Z"), now)).toBe("Aug 20");
  });
});

describe("product row mapping", () => {
  const now = new Date("2026-08-31T18:00:00Z");
  const row = {
    id: "7f1c2f6e-0000-4000-8000-000000000001",
    name: "Riviera Oversized Hoodie",
    articleCode: "CI-HOD-2407",
    category: "Hoodies",
    season: "FW 2027",
    status: "sampling",
    displayColor: "#8faee8",
    updatedAt: new Date("2026-08-31T17:52:00Z"),
    completeSections: 6,
  };

  it("maps a database row onto the shape the UI renders", () => {
    expect(toProduct(row, now)).toEqual({
      id: row.id,
      name: "Riviera Oversized Hoodie",
      code: "CI-HOD-2407",
      category: "Hoodies",
      season: "FW 2027",
      status: "Sampling",
      progress: 60,
      color: "#8faee8",
      updated: "8 min ago",
    });
  });

  it("turns enum statuses into the labels the badges show", () => {
    expect(toProduct({ ...row, status: "in_development" }, now).status).toBe("In development");
    expect(toProduct({ ...row, status: "in_production" }, now).status).toBe("In production");
  });

  it("falls back to Draft for an unrecognised status", () => {
    expect(toProduct({ ...row, status: "who_knows" }, now).status).toBe("Draft");
  });

  it("tolerates a missing season", () => {
    expect(toProduct({ ...row, season: null }, now).season).toBe("");
  });
});
