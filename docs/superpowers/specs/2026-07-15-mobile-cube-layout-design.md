# Mobile Cube Layout Design

## Goal

Improve the homepage cube compositions on phone-sized screens without changing the current tablet or desktop presentation.

## Responsive Scope

The changes apply at the existing `max-width: 520px` breakpoint.

## Hero Cubes

- Keep all three `.hero__cubes` SVGs in one horizontal row.
- Reduce each cube to 72 pixels wide and use a 12-pixel gap so the full row fits a 320-pixel viewport without horizontal overflow.
- Preserve the existing float animation and theme-dependent cube colors.

## About Cubes

- Add an `.about__content` wrapper around `.about__cubes` and `.about__body` so the decoration can be positioned relative to the text area.
- Preserve the current above-text cube row on tablet and desktop.
- On phone-sized screens, position `.about__cubes` as a centered horizontal band behind `.about__body`.
- Make each background cube 80 pixels wide with a 12-pixel gap.
- Reduce the cube band's opacity to 15 percent so both language paragraphs remain legible.
- Keep `.about__body` above the decoration and prevent the decorative layer from intercepting pointer input.
- Preserve the existing light and purple theme cube colors.

## Verification

- A source-level regression check confirms the wrapper and phone breakpoint rules exist.
- At a 320-pixel-wide viewport, the hero shows three cubes on one row with no horizontal page overflow.
- At a typical phone viewport, the about cube band is behind both text blocks and the copy remains readable.
- At a viewport wider than 520 pixels, the existing layouts remain unchanged.
