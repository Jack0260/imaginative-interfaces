// Semantic parser: turns a dream-like sentence into structured design intent.

export type Archetype =
  | "dashboard"
  | "inbox"
  | "pricing"
  | "login"
  | "gallery"
  | "chat"
  | "landing";

export type Motion =
  | "breathe"
  | "glow"
  | "float"
  | "drift"
  | "pulse"
  | "shimmer"
  | "ripple"
  | "fade"
  | "orbit"
  | "flicker";

export interface Mood {
  name: string;
  hue: number; // 0-360
  light: boolean; // prefers light surface
  energy: number; // 0..1
}

export interface ParsedDream {
  input: string;
  archetype: Archetype;
  elements: string[];
  motions: Motion[];
  moods: Mood[];
  textures: string[];
  tempo: "slow" | "medium" | "fast";
  unknown: string[];
}

const ARCHETYPES: Record<string, Archetype> = {
  dashboard: "dashboard", analytics: "dashboard", metrics: "dashboard", console: "dashboard", panel: "dashboard", stats: "dashboard", observatory: "dashboard",
  inbox: "inbox", mail: "inbox", email: "inbox", messages: "inbox", notifications: "inbox",
  pricing: "pricing", plans: "pricing", checkout: "pricing", subscription: "pricing", store: "pricing", shop: "pricing",
  login: "login", signin: "login", "sign-in": "login", signup: "login", onboarding: "login", auth: "login", door: "login", gate: "login",
  gallery: "gallery", portfolio: "gallery", photos: "gallery", museum: "gallery", album: "gallery", exhibit: "gallery",
  chat: "chat", conversation: "chat", assistant: "chat", oracle: "chat", messenger: "chat",
  landing: "landing", homepage: "landing", website: "landing", page: "landing", site: "landing",
};

const MOTIONS: Record<string, Motion> = {
  breathe: "breathe", breathes: "breathe", breathing: "breathe", inhales: "breathe", exhales: "breathe", alive: "breathe",
  glow: "glow", glowing: "glow", glows: "glow", luminous: "glow", radiant: "glow", shines: "glow", bioluminescent: "glow",
  float: "float", floats: "float", floating: "float", levitate: "float", levitates: "float", hovering: "float", weightless: "float",
  drift: "drift", drifts: "drift", drifting: "drift", wander: "drift", wanders: "drift", sway: "drift", sways: "drift",
  pulse: "pulse", pulses: "pulse", pulsing: "pulse", heartbeat: "pulse", beats: "pulse", throbs: "pulse",
  shimmer: "shimmer", shimmers: "shimmer", sparkle: "shimmer", sparkles: "shimmer", glitter: "shimmer", iridescent: "shimmer",
  ripple: "ripple", ripples: "ripple", wave: "ripple", waves: "ripple", liquid: "ripple", flows: "ripple", melts: "ripple",
  whisper: "fade", whispers: "fade", fades: "fade", fading: "fade", waking: "fade", wakes: "fade", dissolves: "fade", emerges: "fade",
  orbit: "orbit", orbits: "orbit", spins: "orbit", spinning: "orbit", revolves: "orbit", circles: "orbit",
  flicker: "flicker", flickers: "flicker", candle: "flicker", glitch: "flicker", glitches: "flicker", static: "flicker",
};

const MOODS: Record<string, Omit<Mood, "name"> & { name?: string }> = {
  calm: { hue: 200, light: false, energy: 0.2, name: "serene" },
  serene: { hue: 195, light: false, energy: 0.2 },
  quiet: { hue: 220, light: false, energy: 0.15, name: "hushed" },
  ocean: { hue: 190, light: false, energy: 0.4, name: "aquatic" },
  underwater: { hue: 185, light: false, energy: 0.35, name: "aquatic" },
  fire: { hue: 20, light: false, energy: 0.9, name: "ember" },
  ember: { hue: 15, light: false, energy: 0.7 },
  lava: { hue: 10, light: false, energy: 0.9, name: "molten" },
  forest: { hue: 140, light: false, energy: 0.35, name: "verdant" },
  moss: { hue: 110, light: false, energy: 0.3, name: "verdant" },
  neon: { hue: 320, light: false, energy: 1, name: "electric" },
  electric: { hue: 280, light: false, energy: 1 },
  dream: { hue: 260, light: false, energy: 0.4, name: "ethereal" },
  dreamy: { hue: 260, light: false, energy: 0.4, name: "ethereal" },
  cloud: { hue: 220, light: true, energy: 0.2, name: "airy" },
  clouds: { hue: 220, light: true, energy: 0.2, name: "airy" },
  night: { hue: 235, light: false, energy: 0.3, name: "nocturnal" },
  midnight: { hue: 240, light: false, energy: 0.3, name: "nocturnal" },
  dark: { hue: 240, light: false, energy: 0.4, name: "nocturnal" },
  sunrise: { hue: 35, light: true, energy: 0.5, name: "dawn" },
  morning: { hue: 45, light: true, energy: 0.5, name: "dawn" },
  waking: { hue: 40, light: true, energy: 0.4, name: "dawn" },
  cosmic: { hue: 270, light: false, energy: 0.6 },
  star: { hue: 250, light: false, energy: 0.5, name: "cosmic" },
  stars: { hue: 250, light: false, energy: 0.5, name: "cosmic" },
  galaxy: { hue: 285, light: false, energy: 0.6, name: "cosmic" },
  ice: { hue: 195, light: true, energy: 0.3, name: "frost" },
  frozen: { hue: 200, light: true, energy: 0.2, name: "frost" },
  candy: { hue: 330, light: true, energy: 0.8, name: "sugared" },
  gold: { hue: 48, light: false, energy: 0.5, name: "gilded" },
  golden: { hue: 48, light: false, energy: 0.5, name: "gilded" },
  rose: { hue: 350, light: true, energy: 0.4, name: "tender" },
  desert: { hue: 30, light: true, energy: 0.4, name: "sunbaked" },
  storm: { hue: 230, light: false, energy: 0.9, name: "tempest" },
  haunted: { hue: 160, light: false, energy: 0.5, name: "spectral" },
  ghost: { hue: 170, light: false, energy: 0.3, name: "spectral" },
  glowing: { hue: 180, light: false, energy: 0.6, name: "luminous" },
};

const TEXTURES = ["glass", "paper", "velvet", "crystal", "grain", "silk", "chrome", "fog", "mist", "smoke", "marble", "liquid"];
const SLOW = ["slow", "slowly", "lazy", "sleepy", "gentle", "gently", "calm", "soft", "softly", "whispers"];
const FAST = ["fast", "quick", "frantic", "racing", "rapid", "electric", "storm", "glitch"];
const STOP = new Set(["a", "an", "the", "that", "which", "with", "and", "of", "like", "feels", "is", "it", "to", "in", "on", "for", "as", "when", "you", "your", "my", "made", "from", "into", "its", "be", "are", "by", "at"]);

export function hashHue(word: string): number {
  let h = 0;
  for (const c of word) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

export function parseDream(input: string): ParsedDream {
  const words = input.toLowerCase().match(/[a-z][a-z-]*/g) ?? [];
  let archetype: Archetype | null = null;
  const elements: string[] = [];
  const motions: Motion[] = [];
  const moods: Mood[] = [];
  const textures: string[] = [];
  const unknown: string[] = [];
  let slow = 0;
  let fast = 0;

  for (const w of words) {
    let known = false;
    if (ARCHETYPES[w]) {
      archetype ??= ARCHETYPES[w];
      if (!elements.includes(w)) elements.push(w);
      known = true;
    }
    if (MOTIONS[w]) {
      if (!motions.includes(MOTIONS[w])) motions.push(MOTIONS[w]);
      known = true;
    }
    if (MOODS[w]) {
      const m = MOODS[w];
      const name = m.name ?? w;
      if (!moods.some((x) => x.name === name)) moods.push({ name, hue: m.hue, light: m.light, energy: m.energy });
      known = true;
    }
    if (TEXTURES.includes(w)) {
      if (!textures.includes(w)) textures.push(w);
      known = true;
    }
    if (SLOW.includes(w)) slow++;
    if (FAST.includes(w)) fast++;
    if (!known && !STOP.has(w) && w.length > 2 && !SLOW.includes(w) && !FAST.includes(w)) unknown.push(w);
  }

  // Unrecognised imagery still colours the dream: hash it into a mood.
  if (moods.length === 0) {
    const seed = unknown[0] ?? input ?? "dream";
    moods.push({ name: unknown[0] ? `${unknown[0]}-tinted` : "ethereal", hue: unknown[0] ? hashHue(seed) : 260, light: false, energy: 0.45 });
  }
  if (motions.length === 0) motions.push("drift");

  return {
    input,
    archetype: archetype ?? "landing",
    elements: elements.length ? elements : ["landing"],
    motions,
    moods,
    textures,
    tempo: slow > fast ? "slow" : fast > slow ? "fast" : "medium",
    unknown: unknown.slice(0, 6),
  };
}
