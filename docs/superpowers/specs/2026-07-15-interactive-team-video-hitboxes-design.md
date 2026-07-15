# Interactive Member Hitboxes on the Team Video — Design

**Date:** 2026-07-15
**Status:** Approved for planning

## Purpose

The landing page team section contains a 10.4-second looping drone video of
CRC's five members inside the existing surveillance HUD. Five decorative
face-target brackets are currently positioned over the video, but they do not
identify members or respond to visitors.

This feature turns that layer into a time-synchronized, progressively enhanced
member interaction. Moving a pointer over a member, focusing the member with a
keyboard, or tapping the member pauses the video and reveals the existing
bilingual name and role. Short random bracket flashes make the otherwise
invisible targets discoverable without interrupting playback.

## Confirmed decisions

| Decision | Approved behavior |
|---|---|
| Member content | Existing bilingual name and role only |
| Profile imagery | No profile photos |
| Member mapping | The group-shot left-to-right order matches the existing team-card order |
| Default target appearance | Invisible |
| Direct activation | Reveal a lime bracket and text panel, then pause the video |
| Pointer dismissal | Hide on pointer leave and resume when appropriate |
| Touch dismissal | Tap the active target again or tap outside |
| Tracking | Timestamped hitboxes follow members throughout the video |
| Discovery cue | One currently visible lime bracket flashes for 700 ms |
| Discovery timing | Uniformly randomized interval from 2.5 through 5 seconds |
| Discovery order | Shuffled order; every member is teased before anyone repeats |
| Discovery playback | No pause and no text panel |
| Reduced motion | Disable automated teaser flashes |

## Scope

- Replace the five decorative face targets inside the existing team video with
  five interactive, time-synchronized hitboxes.
- Keep the video, sources, poster, HUD frame, scan lines, REC treatment, and
  existing team cards.
- Reuse the current team-card text as the single authoring source for member
  names and roles.
- Support pointer, keyboard, and touch input.
- Preserve the existing no-build, plain HTML/CSS/JavaScript architecture.

## Member mapping and content

The user confirmed that the five people in the reference group shot, ordered
from left to right, match the current team-card order:

| Track ID | Chinese name | English name | Chinese role | English role |
|---|---|---|---|---|
| lulu | 耿璐 | Lulu | 數位人權工作者 | Digital Rights Activist |
| meichun | 李梅君 | Meichun Lee | 數位人類學家 | Digital Anthropologist |
| cheng | 彭宬 | CHENG PENG | 韌性松共同創辦人 | Co-founder, g0v Resilience Hackathon |
| tzu-tung | 李紫彤 | Tzu Tung | 藝術家與策展人 | Curator & Queer-Feminist Artist |
| sean | 荊輔翔 | Sean | 工程師 | Meshtastic & Drone Engineer |

Stable IDs will be added to the existing name and role nodes. Each overlay
button will reference those nodes for its accessible name, and the shared
visual panel will read from those same nodes when activated. The implementation
therefore does not create a second independently maintained copy of member
content.

## Interaction model

### Idle

- The video plays exactly as it does now: muted, looping, inline, and
  autoplaying when the browser permits it.
- All member buttons occupy their tracked positions but have no visible
  bracket or label.
- Buttons are enabled only while their corresponding member is visible at the
  current video time.

### Random teaser

- Once playback begins, the teaser scheduler waits a random 2.5–5 seconds.
- It selects one currently visible member from a shuffled bag and shows only
  that member's lime bracket for 700 ms.
- A member is removed from the bag only when its teaser is actually shown.
  When the bag is empty, all five IDs are reshuffled. This guarantees that
  every member is teased before a repeat while allowing temporarily invisible
  members to wait for a later scene or loop.
- If no member is visible, the scheduler leaves the bag unchanged and tries
  again after a new random interval.
- If the teased member leaves its visible tracking segment before 700 ms, the
  bracket disappears immediately.
- A teaser never shows a name or role, never pauses playback, and never
  produces a screen-reader announcement.
- Entering or focusing a teased target promotes it directly into the active
  state.
- Teasers are suspended while a member is active, while the video is paused,
  while the document is hidden, and whenever reduced motion is requested.
  Scheduling resumes from a fresh random interval when the blocking condition
  clears.

### Active member

- Pointer entry, keyboard focus, or touch activation records whether the video
  was playing and then pauses it immediately.
- Tracking renders the current rectangle once more after the pause and holds
  that frozen position.
- The selected hitbox shows a brand-lime HUD bracket.
- One shared, text-only panel appears next to the bracket. It uses Chinese as
  the primary line and English in the site's secondary mono treatment.
- The visual panel ignores pointer events, so moving from the member toward the
  panel does not create a second interactive surface.
- Opening another member while the overlay is already active switches the
  bracket and panel without briefly resuming the video.

### Dismissal and resume

- Pointer interaction dismisses when the pointer leaves the active member
  hitbox.
- Keyboard interaction dismisses on Escape or when focus leaves the member
  overlay. Moving focus directly to another member switches the active member
  without resuming between targets.
- Touch interaction dismisses when the active member is tapped again or a
  pointer event occurs anywhere outside the active target. Because the visual
  panel ignores pointer events, tapping the panel also counts as an outside
  dismissal.
- Dismissal hides the bracket and panel, clears active state, and schedules the
  next teaser interval.
- The controller resumes playback only when it paused a video that had been
  playing at activation time. It does not override a pre-existing pause,
  failed autoplay, or document-level suspension.

## Visual behavior

- Direct targets and teaser targets reuse the existing corner-bracket HUD
  vocabulary in brand lime.
- Targets have no idle opacity, border, marker, label, or cursor decoration.
- The active panel uses a dark ink surface, a lime keyline or edge, and the
  site's existing type hierarchy. It contains no image.
- The panel first attempts placement to the right of the active rectangle,
  then left, below, and above. A final eight-pixel clamp keeps it inside the
  video frame; the gap from the bracket is twelve pixels.
- Touch hit areas expand around the tracked rectangle center to a minimum of
  44 by 44 CSS pixels without changing the visual bracket size.
- On coarse-pointer devices, touch selection is delegated through the overlay.
  If expanded touch areas overlap, the eligible member whose tracked center is
  nearest the touch point wins. This keeps selection deterministic without
  changing keyboard tab order.
- Reduced-motion mode keeps direct interaction functional but removes teaser
  scheduling, bracket pop animation, and nonessential transitions.

## Tracking data

### Coordinate system

Both existing video encodings are 1920 by 1044 pixels and contain the same
10.4-second sequence. Tracking rectangles are stored as normalized source-video
coordinates, where x, y, width, and height are values from zero through one.
They are independent of the rendered element size.

Each member may have more than one disjoint visible segment. A segment contains
its start time, end time, and ordered keyframes. Each keyframe contains a video
timestamp and a normalized rectangle. A member has no interactive target when
the current time falls outside all of that member's segments.

The tracking dataset is calibrated against the source video at every scene
boundary and at least every 0.5 seconds within a visible segment. Extra
keyframes are added wherever the member's center or box size does not follow a
linear path between samples. Rectangles include the visible body with modest
padding but must not include another member's center.

### Interpolation

At a given video time, the tracker:

1. Finds the member segment containing that time.
2. Returns the exact rectangle at a matching keyframe.
3. Otherwise linearly interpolates x, y, width, and height between the nearest
   earlier and later keyframes in that same segment.
4. Returns no rectangle outside a visible segment; it never interpolates
   across a cut, reset, or loop boundary.

### Responsive mapping

The current HUD uses object-fit cover and changes from a 21:9 desktop frame to
16:9 on narrow screens. A normalized source rectangle therefore cannot be
applied directly as a CSS percentage.

The renderer computes the cover scale from the video's intrinsic dimensions
and the HUD's current content box. It derives the rendered video size and its
centered crop offsets, then maps each source rectangle through that transform.
A mapped member is eligible for interaction and teasers only when its center
is inside the HUD and at least half of its rectangle intersects the visible
HUD area. This prevents cropped-off members from exposing false targets.
A ResizeObserver refreshes the transform when the HUD changes size, and
loadedmetadata, seeked, and orientation changes each force an immediate
render.

During playback, requestVideoFrameCallback is used when available. Browsers
without it use requestAnimationFrame while playing plus video events for
paused and seeked updates. Only five rectangles are calculated per frame, and
layout dimensions are cached between resize events.

## Components and file boundaries

| File | Responsibility |
|---|---|
| index.html | Add stable IDs to existing member text; replace decorative targets with an initially hidden overlay containing five semantic buttons and one shared visual panel |
| styles.css | Remove obsolete decorative-target rules; add hidden, teaser, active, panel-placement, touch-target, focus, and reduced-motion styles |
| animations/team-member-tracks.js | Export member IDs, disjoint visibility segments, and normalized tracking keyframes only |
| animations/surveillance-hud.js | Interpolation, responsive mapping, rendering loop, input controller, playback ownership, panel placement, and teaser scheduler |
| tests/surveillance-hud.test.mjs | Dependency-free tests for the pure tracking, mapping, visibility, and shuffled-order logic |

The existing script.js import and init call remain unchanged because
initSurveillanceHUD continues to be the public entry point. No framework,
package manager, backend, or new media asset is introduced.

## Accessibility

- Every hitbox is a semantic button with type button.
- Each button's accessible name references the existing Chinese and English
  name and role nodes through aria-labelledby.
- Invisible buttons become visibly bracketed when keyboard-focused.
- A focused target pauses the moving background before the visitor reads or
  changes targets.
- The teaser bracket is decorative, and teaser state is not announced.
- The shared visual panel does not duplicate announcements already provided by
  the focused button.
- Escape dismisses active state, and focus is never trapped.
- Minimum touch target size is 44 by 44 CSS pixels.
- Team cards remain the complete noninteractive fallback.

## Progressive enhancement and failure handling

- The overlay root starts hidden. Initialization reveals it only after video
  metadata and the core overlay are valid and at least one member has valid
  roster references and tracking data.
- If the video or overlay root is absent, initialization returns without
  affecting the rest of the page.
- If one member's roster nodes or tracking data are invalid, only that member
  remains disabled; valid members continue to work.
- If metadata never loads or JavaScript fails, the video and existing team
  cards remain unchanged and no empty controls appear.
- Autoplay failure does not start teasers. Direct interaction at a valid
  paused frame may still show member information, and dismissal does not force
  playback.
- Looping and seeking use video.currentTime, so a loop reset cannot
  interpolate across the end and beginning of the clip.
- Resize and orientation changes cancel stale placement work and render from
  the current media time.
- All timers and frame callbacks are canceled when their owning state ends.

## Verification

### Automated tests

Use the built-in Node test runner without adding a package.json or dependency:

    node --experimental-default-type=module --test tests/surveillance-hud.test.mjs

Tests cover:

- exact-keyframe and between-keyframe rectangle lookup;
- no rectangle outside visible segments;
- no interpolation across disjoint segments or the loop boundary;
- cover transforms for the existing 21:9 desktop and 16:9 mobile HUDs;
- minimum touch-area expansion without changing the visual rectangle;
- deterministic nearest-center selection for overlapping touch areas;
- shuffled-bag ordering with no repeat before all five shown;
- invisible-member skipping without consuming its place in the bag; and
- resume ownership for playing, already-paused, and autoplay-blocked cases.

### Browser QA

Serve the site locally and inspect both existing source encodings where the
browser permits source selection.

1. Audit each visible member every 0.25 seconds through the full loop. The
   target center must remain on the correct person's visible body, and its
   bracket must not contain another member's center.
2. Repeat alignment checks at a desktop 21:9 HUD and a 390-pixel-wide 16:9
   HUD to verify cover-crop mapping.
3. Verify all five names and roles against the team cards and confirmed
   left-to-right mapping.
4. Verify pointer entry pauses, shows the correct bracket and panel, and
   resumes from the same time on leave.
5. Verify keyboard focus, target-to-target focus movement, Escape, and visible
   focus treatment.
6. Verify touch open, switch, same-target dismissal, outside dismissal, and
   44-pixel targets.
7. Observe at least two complete shuffle cycles: teaser duration is 700 ms,
   intervals stay between 2.5 and 5 seconds, only visible members are teased,
   no member repeats before all five are shown, and playback never pauses.
8. Verify loop reset, resize, orientation change, document visibility changes,
   autoplay blocking, and an already-paused video.
9. Verify reduced-motion mode has no automated teasers or pop animation while
   direct pointer, keyboard, and touch interaction still works.
10. Verify the browser console has no errors and the existing team cards,
    theme toggle, news modal, and cyborg glitch behavior are unaffected.

## Acceptance criteria

- The idle team video has no visible member overlay.
- All five hitboxes follow the correct people throughout every active segment
  at both responsive HUD aspect ratios.
- A direct activation pauses the video and shows only the correct member's
  existing bilingual name and role, with no profile photo.
- Dismissal resumes only playback owned by the interaction.
- Random lime brackets follow the approved 700 ms, 2.5–5 second, shuffled,
  visible-member-only behavior without labels or pauses.
- Pointer, keyboard, and touch interactions all meet the specified dismissal
  behavior.
- The panel remains fully inside the HUD.
- Reduced-motion and failure fallbacks behave as specified.
- Automated tests pass and browser QA finds no regression outside the team
  video.

## Out of scope

- Runtime computer vision, face recognition, or automatic identity detection.
- Editing or re-encoding the existing video and its baked-in detection
  graphics.
- New biographies, profile photographs, member pages, or changes to the team
  cards' wording.
- Video controls, audio, analytics, or interaction tracking.
- Changes to sections outside the team video except stable IDs on the existing
  team-card text.
