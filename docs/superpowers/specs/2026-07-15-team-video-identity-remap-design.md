# Team Video Identity Remap Design

**Date:** 2026-07-15

**Status:** Approved in conversation

## Problem

The interactive team-video targets render and display roster content correctly, but the first three calibrated trajectories are attached to the wrong semantic member IDs:

| Current track key | Person actually tracked |
|---|---|
| `lulu` | Cheng |
| `meichun` | Lulu |
| `cheng` | Meichun |

The live video therefore shows a Lulu panel over Cheng, a Meichun panel over Lulu, and a Cheng panel over Meichun. Tzu Tung and Sean are correct.

## Root Cause

The error is confined to the keys and nested `id` fields in `MEMBER_TRACKS`. The DOM target IDs, roster text IDs, renderer lookup, panel copy, teaser selection, and interaction controller consistently carry the same semantic ID end to end.

Existing tests validate track shape and internal key/ID consistency, but they do not contain a visually confirmed identity landmark. A consistently mislabeled track therefore passes.

## Design

Correct the source data rather than adding runtime indirection:

| Correct semantic member | Existing trajectory to retain |
|---|---|
| Lulu | current `meichun` trajectory |
| Meichun | current `cheng` trajectory |
| Cheng | current `lulu` trajectory |

Relabel only the three object keys and their nested `id` fields. Do not change any coordinates, segment boundaries, member order, HTML, roster text, renderer logic, interaction state, teaser behavior, or CSS.

This is preferred over a renderer lookup map because the exported track record should be truthful at its source. Swapping DOM or roster IDs is rejected because it would corrupt semantic labeling outside the geometry layer.

## Regression Coverage

Add one deterministic Node test that calls `getTrackedRectAtTime` for the three corrected IDs at the start of both calibrated segments.

| Time | Lulu | Meichun | Cheng |
|---|---|---|---|
| 1.136667 | `{ x: .386, y: .319, width: .047, height: .172 }` | `{ x: .541, y: .319, width: .050, height: .202 }` | `{ x: .292, y: .452, width: .064, height: .218 }` |
| 9.166667 | `{ x: .386, y: .316, width: .046, height: .180 }` | `{ x: .535, y: .321, width: .053, height: .199 }` | `{ x: .292, y: .452, width: .062, height: .215 }` |

The test must fail against the current branch for identity mismatches before the source keys are changed. After the six identifier edits, the focused test and the complete existing suite must pass.

## Scope and Verification

Production scope is limited to `animations/team-member-tracks.js`; regression scope is limited to `tests/surveillance-hud.test.mjs`.

Verification consists of:

- focused RED/GREEN identity-landmark test evidence;
- the complete Node test suite;
- JavaScript syntax checks for both HUD modules;
- `git diff --check`;
- an independent code review of the focused diff;
- confirmation that the existing draft PR receives the correction commit.

No track recalibration, renderer refactor, DOM change, new UI, or new dependency is included.
