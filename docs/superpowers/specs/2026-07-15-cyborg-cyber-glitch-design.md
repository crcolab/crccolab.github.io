# Cyborg↔Cyber Glitch on the Official Wordmark — Design

**Date:** 2026-07-15
**Status:** Approved for planning

## Purpose

The pre-redesign landing page had a signature easter egg: the word "Cyborg" in
the wordmark would randomly glitch (TV-static flicker) into a pixel-font
"cyber", hold for ten seconds, and glitch back — a nod to the org's dual name
(Cyborg Resilience Co-lab / Cyber Resilience Co-lab, both still present in the
site metadata). The 2026 redesign replaced the text wordmark with the official
logotype vector (rendered as a `currentColor` mask, brand rule: never re-typeset
the name), which removed the effect. This spec brings it back on top of the new
identity.

Reference implementation: `animations/cyborg-toggle.js` and the
`.cyborg-text*` CSS at git commit `7647d38` (both deleted in the redesign).

## Scope

- Applies to the **hero `h1` wordmark** and the **sticky-header brand
  logotype** (the two places the old site glitched).
- The **footer** lockup and all other logotype uses stay static.
- No change to SEO metadata, accessibility names, or the ZH logotype.

## Design

### 1. Wordmark split (markup + CSS)

Each glitchable `.logotype-en` span is replaced by a split structure that
renders **pixel-identically when idle**:

```html
<span class="logotype-split" role="img" aria-label="Cyborg Resilience Co-lab">
  <span class="glitch-word" data-alt="cyber">
    <span class="logotype logotype-en logotype-en--cyborg" aria-hidden="true"></span>
    <span class="glitch-word__alt" aria-hidden="true">cyber</span>
  </span>
  <span class="logotype logotype-en logotype-en--rest" aria-hidden="true"></span>
</span>
```

- Both segments crop the **same** mask image
  (`/assets/logo/crc-logotype-en.svg`) using the sprite technique:
  `mask-size: calc(100% / f) 100%` + `mask-position: left` for the "Cyborg"
  segment, and the mirror crop (`mask-position: right`,
  `mask-size: calc(100% / (1 - f)) 100%`) for the "Resilience Co-lab" segment.
- The split fraction `f` (x-position where "Cyborg" ends, plus half the word
  gap, relative to the vector's viewBox width `822.77`) is **measured once from
  the SVG path geometry** at implementation time and stored as a CSS custom
  property (e.g. `--cyborg-frac`). It therefore scales with every responsive
  size; no per-breakpoint tuning.
- The existing width rules for `.logotype-en` in the hero and header move to
  the new container; segment widths are `calc(var(--cyborg-frac) * 100%)` and
  the remainder.
- Accessibility: the container keeps the constant
  `aria-label="Cyborg Resilience Co-lab"`; all children are `aria-hidden`.
  The visual swap never changes the accessible name.

### 2. Glitch states (CSS)

Three classes on `.glitch-word`, driven by JS. Keyframes and the animated
feTurbulence noise data-URI are ported verbatim from the old stylesheet; only
colors change.

- **`.glitch`** — TV-static flicker: old `staticFlicker` keyframes
  (opacity steps) plus the animated static-noise `::before` overlay.
- **`.cyber`** — the vector segment is hidden (`visibility: hidden`) and
  `.glitch-word__alt` is shown:
  - Font: **Press Start 2P** (re-added to the Google Fonts `<link>`).
  - Spray-paint reveal: old `sprayIn` keyframes + the hidden `#spraypaint`
    feTurbulence/feDisplacementMap filter, re-added to the page's existing
    hidden SVG `<defs>` block.
  - Marker highlight: old black box `::before`, rotated −2°.
  - Stroke/glow recolored from `#00ff3c` to **brand lime `#B7D32D`**; white
    fill and black outline ring kept, so the state reads on both the light and
    purple themes without theme-specific overrides.
  - Sizing: `.glitch-word` is a size container (`container-type: size`) and
    the alt text uses container-query units (`font-size` in `cqh`, tuned so
    "cyber" fills the "Cyborg" slot), which tracks every rendered size of the
    wordmark automatically.
- **`.fade-back`** — old 2s blur-in restore.

### 3. Behavior (JS)

New module `animations/cyborg-glitch.js`, exporting `initCyborgGlitch()`,
wired into the existing `DOMContentLoaded` init in `script.js`. The scheduler
is a port of the old `cyborg-toggle.js`:

- **Sequence:** static blink 0.5s → swap to "cyber" with spray-in 0.6s →
  hold 10s with 2–5 random 150ms static blinks at random times → static blink
  0.5s → restore vector → fade-back 0.4s → reschedule.
- **Auto trigger:** every 5–20s (uniform random) per instance.
- **Interactive trigger:** `mouseenter` / `touchstart` on the wordmark fires
  the sequence immediately; ignored while a sequence is running (re-entrancy
  guard, as before).
- **Header guard:** the header instance only fires while the hero title is
  scrolled out of view, tracked with an IntersectionObserver on the hero `h1`
  (replaces the old scroll listener). The hero instance is always eligible.
  Result: the two instances never glitch in view at the same time.
- **Reduced motion:** if `prefers-reduced-motion: reduce`, `initCyborgGlitch()`
  returns without scheduling anything; the wordmark stays static.
- **Robustness:** no-ops if the expected elements are absent. The header
  logotype is `display: none` at ≤520px; state classes applied there are
  harmless.

### 4. Files touched

| File | Change |
|---|---|
| `index.html` | Split markup for hero + header logotypes; re-add `#spraypaint` filter to defs; add Press Start 2P to the fonts link |
| `styles.css` | `.logotype-split` / segment crops / `--cyborg-frac`; `.glitch`, `.cyber`, `.fade-back` states and keyframes |
| `animations/cyborg-glitch.js` | New module (scheduler port) |
| `script.js` | Import + init call |

### 5. Testing

Serve locally (`python3 -m http.server`) and screenshot with headless Chrome:

1. **Idle fidelity:** split wordmark vs. current single-mask rendering —
   pixel-identical in hero and header, light and purple themes, desktop and
   390px mobile (via the iframe technique, since headless Chrome clamps
   windows to 500px).
2. **Forced states:** add `.glitch` and `.cyber` classes manually and
   screenshot each, both themes — "cyber" sits in the "Cyborg" slot, marker
   box and lime stroke render, second segment unaffected.
3. **Manual check:** hover the hero wordmark in a real browser; confirm the
   full sequence and the header guard (header only glitches after scrolling
   past the hero).

## Out of scope

- Glitching the ZH logotype or footer lockup.
- Any change to the marquee, metadata, or the old navbar-reveal behavior
  (the new header is always sticky).
