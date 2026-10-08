import { describe, expect, it } from "vitest";
import { parseDream } from "./parser";
import { synthesize } from "./synth";
import { renderPrototype } from "./render";

describe("dream engine", () => {
  it("parses archetype, motions and mood", () => {
    const p = parseDream("a glowing dashboard that breathes");
    expect(p.archetype).toBe("dashboard");
    expect(p.motions).toEqual(["glow", "breathe"]);
    expect(p.moods[0]?.name).toBe("luminous");
  });

  it("defaults to a landing page that drifts", () => {
    const p = parseDream("something made of lighthouses");
    expect(p.archetype).toBe("landing");
    expect(p.motions).toEqual(["drift"]);
  });

  it("slow tempo yields a longer loop than fast", () => {
    const slow = synthesize(parseDream("a slow calm inbox"));
    const fast = synthesize(parseDream("a fast frantic inbox"));
    expect(slow.duration).toBeGreaterThan(fast.duration);
  });

  it("renders a full document with the motion keyframes", () => {
    const p = parseDream("a pricing page that levitates");
    const html = renderPrototype(p, synthesize(p));
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("@keyframes m-float");
    expect(html).toContain("class=\"tiers\"");
  });
});
