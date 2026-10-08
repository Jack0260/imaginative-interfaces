// Design synthesis: converts parsed intent into a concrete design spec.
import type { Motion, ParsedDream } from "./parser";

export interface DesignSpec {
  palette: { bg: string; panel: string; fg: string; muted: string; a1: string; a2: string; edge: string };
  fonts: { display: string; body: string; googleHref: string };
  radius: number;
  duration: number; // seconds of primary motion loop
  motions: Motion[];
  texture: string | null;
  notes: string[];
}

export function hsl(h: number, s: number, l: number) {
  return `hsl(${Math.round(((h % 360) + 360) % 360)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

const FONT_SETS = [
  { when: (e: number) => e >= 0.8, display: "Syne", body: "Inter" },
  { when: (e: number) => e >= 0.55, display: "Space Grotesk", body: "Inter" },
  { when: (e: number) => e >= 0.3, display: "Fraunces", body: "Inter" },
  { when: () => true, display: "Cormorant Garamond", body: "Inter" },
];

export function synthesize(p: ParsedDream): DesignSpec {
  const primary = p.moods[0];
  const secondary = p.moods[1];
  const energy = p.moods.reduce((s, m) => s + m.energy, 0) / p.moods.length;
  const light = primary.light && !p.motions.includes("glow");
  const h1 = primary.hue;
  const h2 = secondary ? secondary.hue : h1 + (energy > 0.6 ? 150 : 50);
  const sat = 45 + energy * 45;

  const palette = light
    ? { bg: hsl(h1, 40, 96), panel: hsl(h1, 35, 99), fg: hsl(h1, 30, 12), muted: hsl(h1, 12, 42), a1: hsl(h1, sat, 48), a2: hsl(h2, sat, 55), edge: hsl(h1, 25, 86) }
    : { bg: hsl(h1, 35, 5), panel: hsl(h1, 30, 9), fg: hsl(h1, 30, 94), muted: hsl(h1, 15, 64), a1: hsl(h1, sat, 66), a2: hsl(h2, sat, 70), edge: hsl(h1, 28, 17) };

  const f = FONT_SETS.find((s) => s.when(energy))!;
  const fam = (n: string) => n.replace(/ /g, "+");
  const googleHref = `https://fonts.googleapis.com/css2?family=${fam(f.display)}:wght@500;700&family=${fam(f.body)}:wght@400;500&display=swap`;

  const base = p.tempo === "slow" ? 7 : p.tempo === "fast" ? 2.2 : 4.5;
  const duration = Math.round((base - energy * 1.2) * 10) / 10;
  const texture = p.textures[0] ?? null;
  const radius = texture === "crystal" || texture === "chrome" ? 6 : energy > 0.8 ? 10 : 22;

  const notes = [
    `${light ? "Light" : "Dark"} ${primary.name} surface, accents at ${Math.round(h1)}° and ${Math.round(((h2 % 360) + 360) % 360)}°.`,
    `${f.display} for display, ${f.body} for reading.`,
    `Primary motion "${p.motions[0]}" loops every ${duration}s${p.motions.length > 1 ? `, layered with ${p.motions.slice(1).join(", ")}` : ""}.`,
    texture ? `Surface texture: ${texture}.` : `Radius ${radius}px for a ${radius > 16 ? "soft" : "sharp"} silhouette.`,
  ];

  return { palette, fonts: { display: f.display, body: f.body, googleHref }, radius, duration, motions: p.motions, texture, notes };
}
