# Cyborg↔Cyber Glitch on the Official Wordmark — Implementation Plan

**Date:** 2026-07-15
**Spec:** [`docs/superpowers/specs/2026-07-15-cyborg-cyber-glitch-design.md`](../specs/2026-07-15-cyborg-cyber-glitch-design.md)
**Reference implementation (deleted):** `git show 7647d38:animations/cyborg-toggle.js` and `git show 7647d38:styles.css` (`.cyborg-text*` block).

## Measured constants (do not re-derive)

Extracted once from `/assets/logo/crc-logotype-en.svg` (viewBox `85.28 86.35 822.77 87.17`) by rendering the SVG in headless Chrome and reading `path.getBBox()`:

- First 6 glyph paths span x = 88.51 → **315.18** ("Cyborg").
- Path 7 (the "R" of "Resilience") starts at x = **353.68**.
- Word gap = 353.68 − 315.18 = **38.50**.
- Split point = 315.18 + 38.50/2 = **334.43**.
- Fraction in viewBox local coords: (334.43 − 85.28) / 822.77 = **0.3028**.

`--cyborg-frac: 0.3028;` — the sole magic number. It travels with the CSS.

---

## Task list

Each task is bite-sized, names the exact file, and states verification. Execute in order; the CSS work depends on the split markup existing, and the JS depends on both.

### T0 — Branch & commit the plan

- Create `feat/cyborg-cyber-glitch` from `main`.
- Commit this plan file: `docs: plan for restoring cyborg↔cyber glitch`.
- **Verify:** `git log --oneline -2` shows the plan commit; `git branch --show-current` prints the new branch.

### T1 — index.html: split the two glitchable logotypes and re-add resources

Two logotype instances to split (`role="img" aria-label="Cyborg Resilience Co-lab"`):

1. Header brand: currently at `index.html:106`.
2. Hero title: currently at `index.html:139`.

Footer (`index.html:356`) stays untouched.

For each of the two, replace:

```html
<span class="logotype logotype-en" role="img" aria-label="Cyborg Resilience Co-lab"></span>
```

with:

```html
<span class="logotype-split logotype-en" role="img" aria-label="Cyborg Resilience Co-lab">
  <span class="glitch-word" data-alt="cyber">
    <span class="logotype logotype-en-mask logotype-en-mask--cyborg" aria-hidden="true"></span>
    <span class="glitch-word__alt" aria-hidden="true">cyber</span>
  </span><span class="logotype logotype-en-mask logotype-en-mask--rest" aria-hidden="true"></span>
</span>
```

Notes:

- Keep the outer `.logotype-en` class so existing width rules for hero/header/footer still target it. The outer element is now a container (no mask of its own — CSS in T2 turns off masking on the outer when it also carries `.logotype-split`).
- No whitespace between the two child spans (already inline).
- The `logotype-en-mask` class is a new one; it does the mask, not `.logotype-en`.

Also in `<head>`:

- Add `Press Start 2P` to the Google Fonts stylesheet at `index.html:77`. The current URL is `https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&family=Noto+Sans+TC:wght@400;500;700;900&display=swap` — append `&family=Press+Start+2P` before `&display=swap`.

Also in the shared `<defs>` block (`index.html:89-100`), inside `<defs>` alongside the existing symbols, add the spraypaint filter (verbatim from the old stylesheet's reference; expressed as a filter element on the hidden SVG):

```html
<filter id="spraypaint">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
  <feDisplacementMap in="SourceGraphic" scale="3"/>
</filter>
```

**Verify:** open the page in a browser (`python3 -m http.server 8000`), the wordmarks still render (they'll look identical to before once T2 lands). No console errors. `document.querySelectorAll('.glitch-word').length === 2`.

### T2 — styles.css: split-container CSS + glitch/cyber/fade-back states

Add a new block right after the existing `.logotype-en` rule (currently `styles.css:120`). Keep the existing `.logotype-en` rule as-is for the footer instance; add rules that override masking when `.logotype-en` is also `.logotype-split`.

New rules:

```css
/* Split wordmark for the glitch easter egg (hero + header instances).
   The outer .logotype-en carries the sizing rules the header/hero already set;
   masking is done by the two inner .logotype-en-mask segments so we can
   glitch the "Cyborg" side while leaving "Resilience Co-lab" static. */
.logotype-split{
  --cyborg-frac: 0.3028; /* measured from the SVG path geometry */
  background:none;
  -webkit-mask-image:none; mask-image:none;
  display:inline-flex; align-items:stretch;
  aspect-ratio: 822.77/87.17;
  vertical-align:top;
  line-height:0;
}
.logotype-en-mask{
  display:inline-block; height:100%;
  background:currentColor;
  -webkit-mask-image:url("/assets/logo/crc-logotype-en.svg");
          mask-image:url("/assets/logo/crc-logotype-en.svg");
  -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat;
}
.logotype-en-mask--cyborg{
  width: calc(var(--cyborg-frac) * 100%);
  -webkit-mask-size: calc(100% / var(--cyborg-frac)) 100%;
          mask-size: calc(100% / var(--cyborg-frac)) 100%;
  -webkit-mask-position: left center; mask-position: left center;
}
.logotype-en-mask--rest{
  width: calc((1 - var(--cyborg-frac)) * 100%);
  -webkit-mask-size: calc(100% / (1 - var(--cyborg-frac))) 100%;
          mask-size: calc(100% / (1 - var(--cyborg-frac))) 100%;
  -webkit-mask-position: right center; mask-position: right center;
}

/* The .glitch-word wraps the Cyborg segment + the pixel-font "cyber" alt. */
.glitch-word{
  position:relative; display:inline-block;
  width: calc(var(--cyborg-frac) * 100%);
  height:100%;
  container-type: size;
  cursor:pointer;
}
.glitch-word__alt{
  position:absolute; inset:0;
  display:none;
  align-items:center; justify-content:flex-start;
  font-family:"Press Start 2P", cursive;
  font-size: 62cqh;                 /* fills the "Cyborg" slot; tune only if visually off */
  line-height:1;
  color:#fff;
  padding: 0 0.15em;
  -webkit-text-stroke: 1.5px #B7D32D;
  paint-order: stroke fill;
  text-shadow:
    -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000,
     0   -1px 0 #000, 0    1px 0 #000, -1px 0 0 #000, 1px 0 0 #000;
}
/* Black marker highlight behind "cyber" — verbatim port, lime stroke swap only */
.glitch-word__alt::before{
  content:"";
  position:absolute;
  top:33%; left:-2px; right:-2px; bottom:-2px;
  background:#000;
  transform:rotate(-2deg);
  z-index:-1;
}

/* TV-static blink: opacity flicker + animated noise overlay. */
.glitch-word.glitch{ animation: cgStaticFlicker 0.1s steps(2) 5; }
@keyframes cgStaticFlicker{
  0%{opacity:1} 50%{opacity:.3} 100%{opacity:1}
}
.glitch-word.glitch::after{
  content:"";
  position:absolute; inset:-4px -6px; z-index:2; opacity:1;
  image-rendering:pixelated; -ms-interpolation-mode:nearest-neighbor;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 18'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='1' seed='1'%3E%3Canimate attributeName='seed' values='1;7;13;23;37' dur='0.25s' calcMode='discrete' repeatCount='indefinite'/%3E%3C/feTurbulence%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 .33 .67 1'/%3E%3CfeFuncG type='discrete' tableValues='0 .33 .67 1'/%3E%3CfeFuncB type='discrete' tableValues='0 .33 .67 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E") center/cover;
  pointer-events:none;
}

/* Cyber state: vector mask hidden, alt shown, sprayIn keyframes on first show. */
.glitch-word.cyber .logotype-en-mask--cyborg{ visibility:hidden; }
.glitch-word.cyber .glitch-word__alt{
  display:flex;
  animation: cgSprayIn 0.6s cubic-bezier(.22,1,.36,1) forwards;
  filter: url(#spraypaint);
}
.glitch-word.cyber.settled .glitch-word__alt{
  animation:none;
  filter:none;
}
@keyframes cgSprayIn{
  0%  { letter-spacing:0.15em; opacity:0.4; transform:scale(1.08) }
  40% { letter-spacing:0.02em; opacity:0.9 }
  100%{ letter-spacing:-0.02em; opacity:1; transform:scale(1) }
}

/* Fade-back after restore. */
.glitch-word.fade-back .logotype-en-mask--cyborg{
  animation: cgFadeBack 2s ease forwards;
}
@keyframes cgFadeBack{
  0%  { opacity:0.6; filter:blur(1px) }
  100%{ opacity:1;   filter:none }
}

@media (prefers-reduced-motion: reduce){
  .glitch-word.glitch,
  .glitch-word.cyber .glitch-word__alt,
  .glitch-word.fade-back .logotype-en-mask--cyborg{ animation:none !important }
  .glitch-word.glitch::after{ display:none }
}
```

Notes:

- The `container-type: size` on `.glitch-word` gives the alt text a container-query height unit (`cqh`) so `font-size: 62cqh` tracks every rendered wordmark size. Cache `62cqh` as a first attempt; visually tune only if "cyber" doesn't fill the Cyborg slot at the hero size.
- `.settled` is added by JS after the sprayIn animation ends so mid-hold static blinks don't retrigger the animation.
- Stroke color changed from old `#00ff3c` to spec-required brand lime `#B7D32D`.

**Verify:** with T1 shipped and T2 saved, reload — idle wordmark still identical to before. Force each state manually in devtools (add `.glitch` then `.cyber` to a `.glitch-word`) and confirm rendering matches the spec on both themes.

### T3 — animations/cyborg-glitch.js: scheduler port

New file. Export `initCyborgGlitch`. Behavior:

- Return early if `matchMedia('(prefers-reduced-motion: reduce)').matches`.
- Query `document.querySelectorAll('.glitch-word')`. For each, spawn a scheduler.
- Sequence per spec (port of `git show 7647d38:animations/cyborg-toggle.js`):
  1. Add `.glitch` for 500 ms.
  2. Remove `.glitch`; add `.cyber` (which triggers sprayIn via CSS). After 600 ms, add `.settled` to freeze the alt.
  3. During the 10 000 ms hold, schedule 2–5 (`Math.floor(Math.random()*4)+2`) `.glitch` blinks of 150 ms at random times in the first 9500 ms.
  4. At t = 10 000 ms from start of cyber state, add `.glitch` for 500 ms.
  5. Remove `.glitch`, remove `.cyber`, remove `.settled`, add `.fade-back` for 400 ms, then remove it.
  6. Reschedule.
- Auto delay: `(Math.random() * 15 + 5) * 1000` ms.
- Interactive trigger: `mouseenter` and `touchstart` (passive) on the `.glitch-word`. Ignored while a sequence runs.
- Header guard: locate `document.querySelector('.hero__title')` and observe with `IntersectionObserver`. Header `.glitch-word` (identified by being inside `.site-header`) may start a new sequence only while the hero title is **not intersecting** (`isIntersecting === false`). A sequence already in progress is never interrupted. Hero instance has no guard.

**Verify:** hover the hero wordmark → sequence runs immediately; wait 5–20 s idle → sequence auto-triggers. Scroll past hero → header wordmark begins glitching (hero stops being eligible until you scroll back). `matchMedia('(prefers-reduced-motion: reduce)')` short-circuits.

### T4 — script.js: wire it up

- Add `import { initCyborgGlitch } from './animations/cyborg-glitch.js';` at the top.
- Inside the existing `DOMContentLoaded` handler at `script.js:57`, call `initCyborgGlitch();`.

**Verify:** page loads without console errors; `.glitch-word` instances behave per T3.

### T5 — verification pass (headless Chrome, then manual)

1. Serve: `python3 -m http.server 8000`.
2. Screenshot idle desktop light theme (`--window-size=1440,900`) — compare visually to `main` branch screenshot at the same size. Wordmarks must be pixel-identical.
3. Repeat with `html.theme-purple` toggled (evaluate `document.documentElement.classList.add('theme-purple')` via `--evaluate-on-new-document` or a wrapper page).
4. Force `.glitch` and `.cyber` in-page via a query param `?force=glitch` / `?force=cyber` handled by a small inline test script (delete after screenshots) or by editing DOM through `Runtime.evaluate` with the CDP; screenshot both. Confirm marker box + lime stroke + no leakage into the "Resilience Co-lab" segment.
5. 390 px mobile via the iframe technique: a wrapper HTML with `<iframe src="/" style="width:390px;height:800px;border:0"></iframe>` inside a `--window-size=800,900` chrome window.
6. Manual hover on `crcolab.art` dev preview — full sequence including header-guard behavior.

If any of the screenshot steps aren't executable in the sandbox, fall back to DOM/CSS inspection (verify computed widths on both segments, `.glitch-word__alt` styles when `.cyber` is present, presence of the `#spraypaint` filter) and note the visual gap in the PR description.

### T6 — commit sequence

1. `docs: plan for restoring cyborg↔cyber glitch` (this file — T0).
2. `feat(wordmark): split hero + header logotypes for glitch easter egg` — index.html + styles.css (T1 + T2).
3. `feat(wordmark): port cyborg↔cyber TV-static glitch scheduler` — animations/cyborg-glitch.js + script.js (T3 + T4).

Small, reviewable, each compiles/renders on its own (the split by itself is a no-op visually; the scheduler by itself no-ops if the split markup is missing).

### T7 — push & open PR

- `git push -u origin feat/cyborg-cyber-glitch` (retry with backoff on network failure).
- Open a **draft** PR against `main` titled `feat: restore Cyborg↔cyber glitch on the new wordmark`.
- Body: implementation summary, list of verification evidence (attach screenshots), explicit call-outs of anything skipped in the sandbox.

## Rollback

Revert T2 + T3 + T4 commits — the split markup is a visual no-op on its own.
