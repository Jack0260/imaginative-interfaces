// Rendering engine: emits a standalone HTML/CSS/JS document from a design spec.
import type { Archetype, Motion, ParsedDream } from "./parser";
import type { DesignSpec } from "./synth";

const KEYFRAMES: Record<Motion, string> = {
  breathe: "@keyframes m-breathe{0%,100%{transform:scale(1);opacity:.82}50%{transform:scale(1.035);opacity:1}}",
  glow: "@keyframes m-glow{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 48px -6px var(--a1)}}",
  float: "@keyframes m-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}",
  drift: "@keyframes m-drift{0%,100%{transform:translate(0,0)}33%{transform:translate(6px,-5px)}66%{transform:translate(-5px,4px)}}",
  pulse: "@keyframes m-pulse{0%,100%{transform:scale(1)}12%{transform:scale(1.05)}24%{transform:scale(1)}36%{transform:scale(1.03)}}",
  shimmer: "@keyframes m-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}",
  ripple: "@keyframes m-ripple{0%,100%{border-radius:var(--r)}50%{border-radius:calc(var(--r)*2) var(--r) calc(var(--r)*2.4) calc(var(--r)*.6)}}",
  fade: "@keyframes m-fade{0%,100%{opacity:.45;filter:blur(.6px)}50%{opacity:1;filter:blur(0)}}",
  orbit: "@keyframes m-orbit{to{transform:rotate(360deg)}}",
  flicker: "@keyframes m-flicker{0%,100%{opacity:1}41%{opacity:1}42%{opacity:.4}43%{opacity:1}77%{opacity:.85}78%{opacity:.3}79%{opacity:1}}",
};

function motionCss(m: Motion, d: number) {
  if (m === "shimmer")
    return `.card{background-image:linear-gradient(110deg,transparent 30%,color-mix(in srgb,var(--a1) 14%,transparent) 50%,transparent 70%);background-size:200% 100%;animation:m-shimmer ${d * 1.4}s linear infinite}`;
  if (m === "orbit") return `.orb{animation:m-orbit ${d * 4}s linear infinite}`;
  return `.card{animation:m-${m} ${d}s ease-in-out infinite}`;
}

function textureCss(t: string | null) {
  switch (t) {
    case "glass": case "crystal": return ".card{backdrop-filter:blur(14px);background-color:color-mix(in srgb,var(--panel) 55%,transparent)}";
    case "grain": case "paper": return "body::after{content:'';position:fixed;inset:0;pointer-events:none;opacity:.08;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")}";
    case "fog": case "mist": case "smoke": return ".veil{filter:blur(70px);opacity:.55}";
    default: return "";
  }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function body(a: Archetype, title: string): string {
  switch (a) {
    case "dashboard":
      return `<header class="top"><b class="brand">${title}</b><span class="muted">live · <span id="clock"></span></span></header>
<main class="grid">
 <div class="card span2"><small>Resonance</small><h2 class="big" data-count="98.4">0</h2><svg viewBox="0 0 300 60" class="spark"><path id="spark" fill="none" stroke="var(--a1)" stroke-width="2"/></svg></div>
 <div class="card"><small>Breaths</small><h2 class="big a2" data-count="1284">0</h2><p class="muted">since dusk</p></div>
 <div class="card"><small>Drift</small><h2 class="big" data-count="3.7">0</h2><p class="muted">units / hour</p></div>
 <div class="card span2"><small>Signals</small><div class="bars">${Array.from({ length: 18 }, () => "<i></i>").join("")}</div></div>
 <div class="card span2 row"><span class="dot"></span><span class="muted">The surface moves in unison with you.</span></div>
</main>`;
    case "inbox":
      return `<header class="top"><b class="brand">${title}</b><span class="muted" id="count"></span></header>
<main class="list">${["The tide sent a letter", "Your shadow replied", "Moonlight, rescheduled", "A quiet invitation", "Notes from the hallway of doors"].map((s, i) => `<div class="card mail" data-i="${i}"><span class="dot"></span><div><b>${s}</b><p class="muted">Opened softly, read slowly, kept forever…</p></div><small class="muted">${i + 1}h</small></div>`).join("")}</main>`;
    case "pricing":
      return `<header class="center"><h1>${title}</h1><p class="muted">Choose how far you want to float.</p></header>
<main class="tiers">${[["Drift", "0", "For first dreams"], ["Lucid", "12", "Steer your sleep"], ["Oneiric", "40", "Build entire worlds"]].map(([n, p, d], i) => `<div class="card tier ${i === 1 ? "hot" : ""}"><small>${n}</small><h2 class="big">$${p}<span class="muted">/mo</span></h2><p class="muted">${d}</p><button>Begin</button></div>`).join("")}</main>`;
    case "login":
      return `<main class="center full"><div class="card auth"><div class="orb"><span></span></div><h1>${title}</h1><p class="muted">Open your eyes slowly.</p><input placeholder="your name in the dream"/><input type="password" placeholder="the word you remember"/><button id="wake">Wake up</button><p class="muted" id="msg"></p></div></main>`;
    case "gallery":
      return `<header class="top"><b class="brand">${title}</b><span class="muted">rooms 1 — 9</span></header>
<main class="masonry">${Array.from({ length: 9 }, (_, i) => `<div class="card tile" style="height:${120 + ((i * 53) % 140)}px;--h:${i * 40}"><small>No. ${i + 1}</small></div>`).join("")}</main>`;
    case "chat":
      return `<main class="chat"><header class="top"><b class="brand">${title}</b><span class="muted">listening</span></header><div id="log" class="log"><div class="card msg them">You arrived. What did you dream?</div></div><form id="f" class="say"><input id="q" placeholder="say something softly"/><button>Send</button></form></main>`;
    default:
      return `<main class="center full"><div class="orb big-orb"><span></span></div><h1 class="hero">${title}</h1><p class="muted lead">A place assembled from half-remembered light.</p><div class="row gap"><div class="card mini">Wander</div><div class="card mini">Remember</div><div class="card mini">Return</div></div></main>`;
  }
}

const SCRIPT = `
document.querySelectorAll('.card').forEach((c,i)=>c.style.animationDelay=(i*0.35)+'s');
document.querySelectorAll('[data-count]').forEach(el=>{const t=parseFloat(el.dataset.count);const dec=String(t).includes('.')?1:0;let s=null;const step=ts=>{s??=ts;const k=Math.min((ts-s)/1400,1);el.textContent=(t*(1-Math.pow(1-k,3))).toFixed(dec);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
const clock=document.getElementById('clock');if(clock){const t=()=>clock.textContent=new Date().toLocaleTimeString();t();setInterval(t,1000)}
const sp=document.getElementById('spark');if(sp){let p=0;const draw=()=>{p+=0.04;let d='M0 30';for(let x=0;x<=300;x+=10)d+=' L'+x+' '+(30+Math.sin(x/28+p)*14*Math.sin(p/3+x/90));sp.setAttribute('d',d);requestAnimationFrame(draw)};draw()}
document.querySelectorAll('.bars i').forEach((b,i)=>{const go=()=>{b.style.height=(20+Math.random()*80)+'%'};go();setInterval(go,900+i*40)});
const cnt=document.getElementById('count');if(cnt){const up=()=>cnt.textContent=document.querySelectorAll('.mail:not(.read)').length+' unread';up();document.querySelectorAll('.mail').forEach(m=>m.onclick=()=>{m.classList.toggle('read');up()})}
const wake=document.getElementById('wake');if(wake)wake.onclick=()=>{document.getElementById('msg').textContent='…you are almost awake.';document.body.classList.add('awake')};
const f=document.getElementById('f');if(f){const replies=['Tell me more about the light.','And then the floor became water?','I remember that one too.','Stay a little longer.'];f.onsubmit=e=>{e.preventDefault();const q=document.getElementById('q');if(!q.value.trim())return;const log=document.getElementById('log');const add=(t,c)=>{const d=document.createElement('div');d.className='card msg '+c;d.textContent=t;log.appendChild(d);log.scrollTop=1e9};add(q.value,'me');q.value='';setTimeout(()=>add(replies[Math.floor(Math.random()*replies.length)],'them'),700)}}
document.addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',e.clientX/innerWidth);document.documentElement.style.setProperty('--my',e.clientY/innerHeight)});
`;

export function titleFor(p: ParsedDream) {
  const w = p.unknown[0] ?? p.moods[0]!.name.split("-")[0];
  return w.charAt(0).toUpperCase() + w.slice(1);
}

export function renderPrototype(p: ParsedDream, s: DesignSpec): string {
  const { palette: c, fonts, radius, duration } = s;
  const title = esc(titleFor(p));
  const motion = s.motions.map((m, i) => motionCss(m, duration * (1 + i * 0.6))).join("\n");
  const kf = s.motions.map((m) => KEYFRAMES[m]).join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Dreamforge prototype</title>
<!-- Dream: ${esc(p.input)} -->
<link rel="stylesheet" href="${fonts.googleHref}">
<style>
:root{--bg:${c.bg};--panel:${c.panel};--fg:${c.fg};--muted:${c.muted};--a1:${c.a1};--a2:${c.a2};--edge:${c.edge};--r:${radius}px;--mx:.5;--my:.5}
*{box-sizing:border-box;margin:0}
body{min-height:100vh;background:var(--bg);color:var(--fg);font-family:'${fonts.body}',sans-serif;overflow-x:hidden;position:relative;transition:filter 2s}
body::before{content:'';position:fixed;inset:-20%;pointer-events:none;background:radial-gradient(40% 35% at calc(var(--mx)*100%) calc(var(--my)*100%),color-mix(in srgb,var(--a1) 22%,transparent),transparent 70%),radial-gradient(35% 30% at 80% 85%,color-mix(in srgb,var(--a2) 18%,transparent),transparent 70%);filter:blur(30px)}
body.awake{filter:brightness(1.25) saturate(1.2)}
h1,h2,.brand{font-family:'${fonts.display}',serif;letter-spacing:-.02em}
h1{font-size:clamp(28px,4vw,44px)} .hero{font-size:clamp(44px,8vw,96px);line-height:.95}
small{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--a1)}
.muted{color:var(--muted);font-size:14px} .lead{max-width:30ch;text-align:center;margin:14px auto 28px;font-size:17px}
.big{font-size:44px;margin:8px 0 4px} .a2{color:var(--a2)}
.card{position:relative;background-color:var(--panel);border:1px solid var(--edge);border-radius:var(--r);padding:20px}
.top{display:flex;justify-content:space-between;align-items:center;padding:20px 28px;position:relative}
.center{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;position:relative}
.full{min-height:100vh}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:8px 28px 28px;position:relative}
.span2{grid-column:span 2} .row{display:flex;align-items:center;gap:12px} .gap{gap:14px;justify-content:center}
.spark{width:100%;height:60px} .bars{display:flex;align-items:flex-end;gap:5px;height:90px;margin-top:10px}
.bars i{flex:1;background:linear-gradient(var(--a1),var(--a2));border-radius:3px;transition:height .9s ease}
.dot{width:10px;height:10px;border-radius:50%;background:var(--a1);box-shadow:0 0 14px var(--a1);flex:none}
.list{display:flex;flex-direction:column;gap:12px;padding:8px 28px 28px;max-width:720px;margin:auto;position:relative}
.mail{display:flex;gap:14px;align-items:center;cursor:pointer;transition:opacity .4s} .mail>div{flex:1} .mail.read{opacity:.4} .mail.read .dot{background:var(--muted);box-shadow:none}
.tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding:0 28px 40px;max-width:980px;margin:auto;position:relative}
.tier.hot{border-color:var(--a1);box-shadow:0 0 60px -20px var(--a1)}
button{font:500 14px '${fonts.body}';margin-top:16px;width:100%;padding:12px;border:0;border-radius:calc(var(--r)*.6);background:var(--a1);color:var(--bg);cursor:pointer;transition:transform .2s}
button:hover{transform:translateY(-2px)}
input{width:100%;margin-top:12px;padding:12px 14px;border-radius:calc(var(--r)*.6);border:1px solid var(--edge);background:var(--bg);color:var(--fg);font:14px '${fonts.body}'}
.auth{width:min(380px,100%);text-align:center}
.orb{width:70px;height:70px;margin:0 auto 18px;border-radius:50%;border:1px dashed var(--a1);position:relative}
.orb span{position:absolute;top:-5px;left:50%;width:10px;height:10px;border-radius:50%;background:var(--a2);box-shadow:0 0 12px var(--a2)}
.big-orb{width:140px;height:140px;margin-bottom:28px}
.mini{padding:12px 20px;font-size:14px}
.masonry{columns:3 220px;gap:16px;padding:8px 28px 28px;position:relative} .tile{break-inside:avoid;margin-bottom:16px;background:linear-gradient(160deg,color-mix(in srgb,var(--a1) 30%,var(--panel)),color-mix(in srgb,var(--a2) 25%,var(--panel)));filter:hue-rotate(calc(var(--h)*1deg))}
.chat{max-width:640px;margin:auto;height:100vh;display:flex;flex-direction:column;position:relative}
.log{flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:8px 24px}
.msg{max-width:78%;padding:12px 16px} .me{align-self:flex-end;border-color:var(--a1)} .them{align-self:flex-start}
.say{display:flex;gap:10px;padding:16px 24px} .say input,.say button{margin:0} .say button{width:auto;padding:0 20px}
@media(max-width:720px){.grid{grid-template-columns:1fr 1fr}.tiers{grid-template-columns:1fr}}
${kf}
${motion}
${textureCss(s.texture)}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}
</style></head>
<body>
${body(p.archetype, title)}
<script>${SCRIPT}</script>
</body></html>`;
}
