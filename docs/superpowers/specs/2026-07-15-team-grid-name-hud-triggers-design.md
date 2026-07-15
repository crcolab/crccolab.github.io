# Team Grid Name-to-HUD Triggers Design

## Goal

Replace the homepage team photo-card grid with a compact names-and-roles grid,
add Rosa Kuo as a sixth member, and let the five members already tracked in the
team video activate their existing HUD effects from their names. All markup and
styling inside `.team__feature` remain unchanged.

## Scope

The change applies only to the homepage team grid and its connection to the
existing surveillance HUD controller.

- Remove every `.team-card__photo` and `.team-card__ph` element from
  `.team__grid`.
- Preserve the existing five members and their bilingual text.
- Add a sixth member with these exact visible lines:
  - `郭景晏 Rosa Kuo`
  - `CRC Coordinator`
  - `Digital Rights Activist`
- Make the existing five members' `.team-card__names` controls activate their
  matching video targets.
- Keep Rosa's name visually consistent but non-interactive because the current
  video has no Rosa target or tracking data.
- Do not change markup or styling within `.team__feature`.
- Do not add or recalibrate video tracking data.

## Chosen approach

Extend the existing surveillance HUD controller to bind external name controls
directly. The external controls feed the same active-member state used by the
tracked video hitboxes. This preserves the existing bracket animation, member
panel, teaser suspension, playback lease, panel placement, touch behavior, and
reduced-motion handling without duplicating them.

Custom document events were rejected as unnecessary indirection for one page.
Synthetic pointer or focus events were rejected because they would couple the
grid to internal browser-event behavior and be harder to test reliably.

## Team grid structure and layout

Each member remains a `.team-card`, but the cards contain only the name control
and role lines. With no media, the cards use appropriate content semantics
rather than retaining an empty figure/photo structure.

The five tracked members use a semantic button for `.team-card__names`. Each
button carries its existing member ID and contains the existing Chinese and
English name spans, so the roster IDs used by the HUD remain stable. Rosa uses
the same visual name wrapper without a member ID or button behavior.

The desktop grid displays three columns by two rows. Narrow layouts use two
columns. Existing bilingual hierarchy remains: Chinese name first, English name
in the secondary display treatment, followed by the current role typography.
Button chrome is reset so interactive names look like the other team content,
while hover and visible keyboard focus communicate interactivity.

## Interaction model

### Hover

Pointer entry on one of the five interactive names activates its matching HUD
member. Pointer exit dismisses a hover-only activation unless that member was
also pinned by click or keyboard activation.

### Pinned activation

Click, tap, Enter, or Space pins the selected member. The effect stays active
after pointer exit and closes when:

- another interactive team name is activated;
- the visitor activates the same pinned name again;
- the visitor clicks or taps outside the active name and HUD target; or
- the visitor presses Escape.

Keyboard focus is not trapped. A visible focus indicator remains on the name
button. Dismissal does not move focus unless the existing Escape behavior needs
to blur the active control to prevent immediate reactivation.

### Member unavailable at the current video time

The external name controls must work even when their member is not tracked in
the current video frame. On activation, the controller:

1. suspends random teasers;
2. acquires the existing playback lease and pauses playback if necessary;
3. seeks to the first keyframe of that member's first valid tracking segment;
4. waits for the seeked frame to render; and
5. activates the existing bracket and information panel through the normal HUD
   state path.

If the selected member is already eligible in the current frame, activation
does not seek. Switching directly between active names keeps the video paused
and avoids an intermediate resume.

On dismissal, playback resumes only when the interaction paused a previously
playing video. After a seek, playback continues from the selected member's
frame; it does not restore the earlier playback time.

## State and data flow

The controller adds external hover and pinned member IDs alongside its existing
pointer, focus, and touch IDs. Reconciliation chooses the active member from
the combined sources, with pinned external activation taking precedence over
external hover so pointer exit cannot close a pinned selection.

External controls are discovered by their member IDs and bound only when the
same ID has:

- a valid roster entry;
- an existing tracked HUD target; and
- valid member tracking data.

Activation still routes through the existing `activateMember`, panel-content,
rendering, and playback-lease functions. The team grid does not manipulate HUD
classes or panel content directly.

Async seeking records the requested member ID. A newer activation or dismissal
invalidates the older request, so a late `seeked` event cannot open a stale
member. Rendering after the seek confirms the selected layout is eligible
before activation.

## File boundaries

| File | Responsibility |
|---|---|
| `index.html` | Replace only `.team__grid` markup, preserve existing roster IDs, add external member IDs, and add Rosa |
| `styles.css` | Remove obsolete team photo/placeholder styles and add compact grid, button reset, hover, and focus styles |
| `animations/surveillance-hud.js` | Bind external name controls, reconcile hover/pinned state, coordinate safe seeking, and reuse existing activation/dismissal behavior |
| `animations/team-member-tracks.js` | No changes; supplies each tracked member's first valid keyframe |
| `tests/surveillance-hud.test.mjs` | Cover markup/style contracts and external-trigger state and seek behavior |

No framework, dependency, media asset, or backend change is introduced.

## Accessibility

- The five interactive name wrappers are native buttons with `type="button"`.
- Enter and Space receive native button activation behavior.
- Each button's visible bilingual name is its accessible name.
- Focus-visible styling clearly identifies the active control.
- Escape dismisses an active HUD state, and focus is never trapped.
- Rosa remains ordinary text and does not imply unavailable functionality.
- Reduced-motion mode continues to disable nonessential animation while direct
  activation remains functional.

## Failure handling

- Missing or invalid external controls are skipped independently; valid member
  controls continue to work.
- Rosa has no member ID and is never bound by the controller.
- If video metadata or a tracked layout is unavailable, the controller does
  not expose an incorrect bracket or panel.
- A failed, superseded, or stale seek clears its pending activation without
  forcing playback.
- The existing progressive-enhancement behavior remains: the names and roles
  are readable even if JavaScript or video initialization fails.

## Verification

Automated checks will verify:

- six team members render in the grid;
- neither `.team-card__photo` nor `.team-card__ph` remains in `index.html`;
- the five tracked names map to their current IDs and Rosa is non-interactive;
- the grid uses the approved three-column desktop and two-column narrow layout;
- pointer entry activates and pointer exit dismisses hover-only state;
- click, tap, Enter, and Space pin and toggle state;
- another name, outside activation, and Escape dismiss or switch correctly;
- activation seeks to the first tracked keyframe only when the member is not
  eligible at the current time;
- stale seek completion cannot activate an obsolete selection;
- switching members retains the playback lease;
- dismissal resumes only playback paused by the interaction; and
- existing HUD tracking, teaser, mapping, panel, and reduced-motion tests still
  pass.

Browser verification will check all five interactive names plus Rosa at desktop
and narrow viewport sizes. It will confirm hover, pinned mouse activation,
keyboard activation and Escape, touch toggling, outside dismissal, seek-to-member
behavior, focus visibility, and that `.team__feature` is visually and
structurally unchanged.
