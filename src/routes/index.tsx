import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { parseDream } from "@/lib/dream/parser";
import { synthesize } from "@/lib/dream/synth";
import { renderPrototype } from "@/lib/dream/render";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dreamforge — turn dreams into working UI prototypes" },
      { name: "description", content: "Describe a UI like a dream. Dreamforge parses it, synthesizes a design and renders a live HTML/CSS/JS prototype." },
      { property: "og:title", content: "Dreamforge — dream-to-prototype engine" },
      { property: "og:description", content: "Describe a glowing dashboard that breathes and watch it render." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EXAMPLES = [
  "a glowing dashboard that breathes",
  "a calm inbox that whispers",
  "a pricing page that levitates",
  "a login that feels like waking",
  "a cosmic gallery of glass that drifts",
  "an oracle chat made of fog that flickers",
];

function Index() {
  const [draft, setDraft] = useState(EXAMPLES[0]);
  const [dream, setDream] = useState(EXAMPLES[0]);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [stamp, setStamp] = useState(0);

  const { parsed, spec, html, ms } = useMemo(() => {
    const t = performance.now();
    const parsed = parseDream(dream);
    const spec = synthesize(parsed);
    const html = renderPrototype(parsed, spec);
    return { parsed, spec, html, ms: Math.max(1, Math.round(performance.now() - t)) };
  }, [dream]);

  const forge = (text: string) => {
    if (!text.trim()) return;
    setDraft(text);
    setDream(text);
    setStamp((s) => s + 1);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `dream-${parsed.archetype}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const swatches = Object.entries(spec.palette);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink font-body text-foam">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-64 h-[420px] w-[560px] rounded-full bg-violet/10 blur-[120px]" />

      <header className="relative z-10 flex items-center justify-between border-b border-edge/70 px-8 py-5">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 animate-breathe rounded-full bg-cyan" />
          <span className="font-display text-lg font-bold tracking-tight">Dreamforge</span>
        </div>
        <div className="eyebrow flex items-center gap-2 text-mist">
          <span className="rounded-full px-2.5 py-1 text-cyan ring-1 ring-cyan/30">01 Parse</span>
          <span className="rounded-full px-2.5 py-1 text-violet ring-1 ring-violet/30">02 Synthesize</span>
          <span className="rounded-full px-2.5 py-1 ring-1 ring-foam/20">03 Render</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl grid-cols-12 gap-4 px-8 py-8">
        <section className="bento col-span-12 animate-rise">
          <label htmlFor="dream" className="eyebrow mb-3 block text-mist">Describe a UI that dreams</label>
          <form
            onSubmit={(e) => { e.preventDefault(); forge(draft); }}
            className="flex items-center gap-3 rounded-2xl bg-ink/60 px-5 py-3 ring-1 ring-edge focus-within:ring-cyan/50"
          >
            <span className="font-display text-2xl leading-none text-cyan">"</span>
            <input
              id="dream"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 bg-transparent py-1 text-lg text-foam/90 outline-none placeholder:text-mist"
              placeholder="a forest login that breathes slowly…"
            />
            <button type="submit" className="rounded-lg bg-cyan px-5 py-2 font-display text-sm font-bold text-ink transition-colors hover:bg-foam">
              Forge
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => forge(ex)}
                className="rounded-full px-3 py-1.5 text-xs text-mist ring-1 ring-foam/10 transition-colors hover:text-cyan hover:ring-cyan/40"
              >
                {ex}
              </button>
            ))}
          </div>
        </section>

        <section key={`p${stamp}`} className="bento col-span-12 animate-rise [animation-delay:90ms] lg:col-span-4">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight">Semantic Parse</h2>
            <span className="font-mono text-[10px] text-mist">(a) tokens</span>
          </div>
          <div className="space-y-3.5">
            <TokenRow label="Archetype" tone="plain" items={[parsed.archetype]} />
            <TokenRow label="Moods" tone="cyan" items={parsed.moods.map((m) => m.name)} />
            <TokenRow label="Motions" tone="violet" items={parsed.motions} />
            <TokenRow label="Elements" tone="plain" items={[...parsed.elements, ...parsed.textures]} />
            <TokenRow label={`Tempo · ${parsed.tempo}`} tone="plain" items={parsed.unknown.length ? parsed.unknown.map((u) => `~${u}`) : []} />
          </div>
        </section>

        <section className="col-span-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8">
          <div key={`s${stamp}`} className="bento animate-rise [animation-delay:150ms]">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold tracking-tight">Synthesis</h2>
              <span className="font-mono text-[10px] text-mist">(b) spec</span>
            </div>
            <div className="eyebrow mb-2 text-mist">Palette</div>
            <div className="mb-5 flex gap-2">
              {swatches.map(([k, v]) => (
                <span key={k} title={`${k} ${v}`} className="size-8 rounded-lg ring-1 ring-foam/10" style={{ background: v }} />
              ))}
            </div>
            <div className="eyebrow mb-2 text-mist">Type & Motion</div>
            <ul className="space-y-1.5 text-sm leading-relaxed text-foam/85">
              {spec.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>

          <div className="bento flex animate-rise flex-col [animation-delay:210ms]">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold tracking-tight">Render</h2>
              <span className="font-mono text-[10px] text-mist">(c) live</span>
            </div>
            <div className="mb-3 flex gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em]">
              {(["preview", "code"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={tab === t ? "rounded-md bg-cyan/15 px-2.5 py-1 text-cyan" : "rounded-md px-2.5 py-1 text-mist ring-1 ring-foam/10"}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative min-h-[180px] flex-1 overflow-hidden rounded-xl bg-ink ring-1 ring-edge">
              {tab === "preview" ? (
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  {[spec.palette.a1, spec.palette.a2, spec.palette.fg].map((c, i) => (
                    <span
                      key={i}
                      className="h-16 w-16 animate-breathe rounded-xl"
                      style={{ background: `color-mix(in srgb, ${c} 30%, transparent)`, boxShadow: `inset 0 0 0 1px ${c}`, animationDelay: `${i * 1.2}s`, animationDuration: `${spec.duration}s` }}
                    />
                  ))}
                </div>
              ) : (
                <pre className="absolute inset-0 overflow-auto p-3 font-mono text-[10px] leading-relaxed text-mist">{html}</pre>
              )}
            </div>
            <button onClick={download} className="mt-3 rounded-lg bg-cyan py-2.5 font-display text-sm font-bold text-ink transition-colors hover:bg-foam">
              Download HTML
            </button>
          </div>
        </section>

        <section className="bento col-span-12 animate-rise [animation-delay:270ms]">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight">Live Preview</h2>
            <span className="font-mono text-[10px] text-mist">generated · {ms}ms · {(html.length / 1024).toFixed(1)}kb</span>
          </div>
          <iframe
            key={stamp}
            title="Generated prototype"
            srcDoc={html}
            sandbox="allow-scripts"
            className="h-[560px] w-full rounded-xl bg-ink ring-1 ring-edge"
          />
        </section>
      </main>

      <footer className="eyebrow relative z-10 flex items-center justify-between border-t border-edge/70 px-8 py-6 text-mist">
        <span>Dreamforge — an instrument for dreaming</span>
        <span>3 stages · one render</span>
      </footer>
    </div>
  );
}

function TokenRow({ label, items, tone }: { label: string; items: string[]; tone: "cyan" | "violet" | "plain" }) {
  const head = tone === "cyan" ? "text-cyan" : tone === "violet" ? "text-violet" : "text-mist";
  const chip = tone === "cyan" ? "bg-cyan/10 text-cyan" : tone === "violet" ? "bg-violet/10 text-violet" : "ring-1 ring-foam/10 text-foam/80";
  return (
    <div>
      <div className={`eyebrow mb-2 ${head}`}>{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.length ? items.map((t) => <span key={t} className={`rounded-md px-2.5 py-1 text-xs ${chip}`}>{t}</span>) : <span className="text-xs text-mist">—</span>}
      </div>
    </div>
  );
}
