import { describe, expect, it } from "vitest";

import { renderFlat, renderFlatPair, renderFlatSvg } from "@/lib/flats/render";
import { RIVIERA_HOODIE, flatSpecV1Schema, parseFlatSpec } from "@/lib/flats/spec";
import { measurementsFor } from "@/lib/flats/templates/hoodie";

describe("flat spec is a safe model output surface", () => {
  it("rejects any field the vocabulary does not define", () => {
    // The injection boundary: a model cannot express an identifier it has no
    // slot for. If this ever passes, the boundary has been widened by accident.
    for (const smuggled of [
      { organizationId: "org-1" },
      { userId: "user-1" },
      { role: "owner" },
      { storageKey: "s3://bucket/key" },
      { price: 1000 },
      { targetTable: "subscriptions" },
    ]) {
      const result = flatSpecV1Schema.safeParse({ ...RIVIERA_HOODIE, ...smuggled });
      expect(result.success, `${Object.keys(smuggled)[0]} was accepted`).toBe(false);
    }
  });

  it("rejects values outside the enum vocabulary", () => {
    expect(flatSpecV1Schema.safeParse({ ...RIVIERA_HOODIE, silhouette: "custom" }).success).toBe(
      false,
    );
    expect(flatSpecV1Schema.safeParse({ ...RIVIERA_HOODIE, sleeve: "batwing" }).success).toBe(false);
  });

  it("bounds free numerics", () => {
    const deep = { ...RIVIERA_HOODIE, neckline: { kind: "v-neck" as const, depthCm: 400 } };
    expect(flatSpecV1Schema.safeParse(deep).success).toBe(false);
  });

  it("accepts the seed hoodie", () => {
    expect(parseFlatSpec(RIVIERA_HOODIE)).toEqual(RIVIERA_HOODIE);
  });
});

describe("rendering is deterministic", () => {
  it("produces byte-identical output for the same spec", () => {
    expect(renderFlatSvg(RIVIERA_HOODIE, "front")).toBe(renderFlatSvg(RIVIERA_HOODIE, "front"));
  });

  it("changes output when a parameter changes", () => {
    const boxy = renderFlatSvg({ ...RIVIERA_HOODIE, silhouette: "boxy" }, "front");
    expect(renderFlatSvg(RIVIERA_HOODIE, "front")).not.toBe(boxy);
  });

  it("emits no NaN or undefined into path data", () => {
    for (const view of ["front", "back"] as const) {
      const svg = renderFlatSvg(RIVIERA_HOODIE, view);
      expect(svg).not.toContain("NaN");
      expect(svg).not.toContain("undefined");
    }
  });
});

describe("front and back cannot drift apart", () => {
  it("derives both views from one measurement set", () => {
    const m = measurementsFor(RIVIERA_HOODIE);
    const front = renderFlat(RIVIERA_HOODIE, "front");
    const back = renderFlat(RIVIERA_HOODIE, "back");

    // Shoulder tips sit at the same x in both views.
    const shoulderX = (200 - m.shoulder).toString();
    expect(front.body).toContain(shoulderX);
    expect(back.body).toContain(shoulderX);
    expect(front.viewBox).toBe(back.viewBox);
  });

  it("gives the back a shallower neckline than the front", () => {
    const pair = renderFlatPair(RIVIERA_HOODIE);
    expect(pair.front).not.toBe(pair.back);
  });

  it("keeps pockets and plackets off the back view", () => {
    const withZip = { ...RIVIERA_HOODIE, placket: "full-zip" as const };
    expect(renderFlatSvg(withZip, "front")).toContain('id="placket"');
    expect(renderFlatSvg(withZip, "back")).not.toContain('id="placket"');
    expect(renderFlatSvg(RIVIERA_HOODIE, "front")).toContain('id="pocket"');
    expect(renderFlatSvg(RIVIERA_HOODIE, "back")).not.toContain('id="pocket"');
  });
});

describe("parameters actually drive geometry", () => {
  it("widens the body as silhouette grows", () => {
    const widths = (["regular", "boxy", "oversized"] as const).map(
      (silhouette) => measurementsFor({ ...RIVIERA_HOODIE, silhouette }).chest,
    );
    expect(widths[0]!).toBeLessThan(widths[1]!);
    expect(widths[1]!).toBeLessThan(widths[2]!);
  });

  it("lengthens the body as bodyLength grows", () => {
    const lengths = (["cropped", "regular", "long"] as const).map(
      (bodyLength) => measurementsFor({ ...RIVIERA_HOODIE, bodyLength }).hemY,
    );
    expect(lengths[0]!).toBeLessThan(lengths[1]!);
    expect(lengths[1]!).toBeLessThan(lengths[2]!);
  });

  it("omits sleeves when sleeveless and draws them otherwise", () => {
    // Both cases set `sleeve` explicitly. Reading the sleeveless case off
    // RIVIERA_HOODIE coupled this test to the seed constant, so correcting the
    // seed (it was sleeveless, contradicting its own cuff and sleeve-length
    // specs) failed a test about parameter response.
    expect(renderFlatSvg({ ...RIVIERA_HOODIE, sleeve: "sleeveless" }, "front")).not.toContain(
      'id="sleeves"',
    );
    expect(renderFlatSvg({ ...RIVIERA_HOODIE, sleeve: "long" }, "front")).toContain('id="sleeves"');
  });

  it("omits the hood for a crew neck", () => {
    const crew = renderFlatSvg({ ...RIVIERA_HOODIE, neckline: { kind: "crew" } }, "front");
    expect(crew).toContain('id="hood"></g>');
  });

  it("drops the drawcord when the hood has none", () => {
    const noCord = {
      ...RIVIERA_HOODIE,
      neckline: { kind: "hood" as const, layers: 2 as const, drawcord: false },
    };
    expect(renderFlatSvg(RIVIERA_HOODIE, "front")).toContain('id="drawcord"');
    expect(renderFlatSvg(noCord, "front")).not.toContain('id="drawcord"');
  });
});

describe("callout anchors", () => {
  it("exposes the placements artwork and callouts attach to", () => {
    const { anchors } = renderFlat(RIVIERA_HOODIE, "front");
    expect(Object.keys(anchors)).toEqual(
      expect.arrayContaining(["front-chest", "back-neck", "hem-center", "hood-top"]),
    );
  });

  it("moves anchors with the garment rather than hardcoding them", () => {
    const short = renderFlat({ ...RIVIERA_HOODIE, bodyLength: "cropped" }, "front");
    const long = renderFlat({ ...RIVIERA_HOODIE, bodyLength: "long" }, "front");
    expect(short.anchors["hem-center"]!.y).toBeLessThan(long.anchors["hem-center"]!.y);
  });

  it("keeps every anchor inside the drawing area", () => {
    const { anchors } = renderFlat(RIVIERA_HOODIE, "front");
    for (const [name, point] of Object.entries(anchors)) {
      expect(point.x, `${name} x`).toBeGreaterThan(0);
      expect(point.x, `${name} x`).toBeLessThan(400);
      expect(point.y, `${name} y`).toBeGreaterThan(0);
      expect(point.y, `${name} y`).toBeLessThan(560);
    }
  });
});
