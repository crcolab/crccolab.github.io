# Heading Scale Readability Design

Date: 2026-07-16

## Goal

Raise the remaining undersized homepage headings so the visual hierarchy is comfortable for elderly and low-vision readers. Main section headings should render between 40px and 64px. Homepage news subsection headings should render between 24px and 28px.

## Scope

This change applies to the shared homepage stylesheet and both static locale homepages through their existing classes:

- `.crc-heading__en`
- `.crc-heading__zh`
- `.crc-heading__title`
- `.news__section-title`

The change does not alter body, supporting, or label typography. It does not modify any file or behavior under `events/hackathon-2026/`.

## Typography Tokens

Add two purpose-specific responsive tokens to `:root` in `styles.css`:

```css
--fs-section-heading:clamp(2.5rem,5vw,4rem);
--fs-subsection-heading:clamp(1.5rem,2vw,1.75rem);
```

The section-heading token produces a 40–64px range. The subsection-heading token produces a 24–28px range. Responsive `clamp()` values preserve hierarchy without requiring mobile rules that shrink text below the approved minimum.

## Selector Behavior

All three `.crc-heading__*` locale/title variants consume `--fs-section-heading`. Chinese and English remain visually equal; neither locale is styled as secondary.

`.news__section-title` consumes `--fs-subsection-heading`. Its optional nested metadata span remains a label-sized supporting element because it is not the subsection heading itself.

The existing body, supporting, and label tokens remain unchanged:

- body: 18px
- supporting: 16px
- labels: 14px

## Testing

Extend the readable typography source test to assert:

- both new tokens have the approved `clamp()` values;
- the `.crc-heading__en`, `.crc-heading__zh`, and `.crc-heading__title` selector group consumes `--fs-section-heading`;
- `.news__section-title` consumes `--fs-subsection-heading`;
- no mobile media query overrides either selector below its token.

Extend generated-site coverage to confirm the built shared CSS contains the same tokens and selector contracts for both locale homepages.

Run the focused typography and homepage tests, build the Jekyll site, run generated-site tests, and run the complete Node suite.

## Acceptance Criteria

- Main shared section headings scale from 40px to 64px.
- Homepage news subsection headings scale from 24px to 28px.
- Chinese and English use the same heading hierarchy.
- Body, supporting, and label copy retain the existing 18/16/14px hierarchy.
- Mobile CSS does not reduce these headings below their approved minimum.
- Hackathon 2026 remains unchanged.
