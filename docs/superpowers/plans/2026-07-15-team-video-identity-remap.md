# Team Video Identity Remap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the three mislabeled team-video trajectories so Lulu, Meichun, and Cheng targets follow the right people.

**Architecture:** Preserve the existing semantic ID flow from `MEMBER_IDS` through roster, target, renderer, panel, and teaser logic. Fix the identity error at its source by relabeling three `MEMBER_TRACKS` object keys and nested IDs, with visually confirmed segment-start landmarks preventing regression.

**Tech Stack:** Plain JavaScript ES modules and Node 20's built-in `node:test` runner.

## Global Constraints

- New Lulu must use the current `meichun` trajectory.
- New Meichun must use the current `cheng` trajectory.
- New Cheng must use the current `lulu` trajectory.
- Do not change any calibrated coordinate, time, segment boundary, or `MEMBER_IDS` order.
- Do not change HTML, roster text, renderer logic, interaction behavior, teaser behavior, CSS, `script.js`, or dependencies.
- Production changes are limited to `animations/team-member-tracks.js`; regression changes are limited to `tests/surveillance-hud.test.mjs`.
- Add the regression test and verify its expected failure before editing production data.
- Preserve the existing draft PR and unrelated worktree state.

## File Structure

| File | Responsibility |
|---|---|
| `animations/team-member-tracks.js` | Relabel the three existing calibrated trajectory blocks with their correct semantic keys and nested IDs. |
| `tests/surveillance-hud.test.mjs` | Lock visually confirmed identity rectangles at both calibrated segment starts. |

---

### Task 1: Correct the first three calibrated track identities

**Files:**
- Modify: `tests/surveillance-hud.test.mjs:62`
- Modify: `animations/team-member-tracks.js:10-89`

**Interfaces:**
- Consumes: `MEMBER_TRACKS: Record<string, MemberTrack>` and `getTrackedRectAtTime(track, time): NormalizedRect | null`.
- Produces: truthful `MEMBER_TRACKS.lulu`, `MEMBER_TRACKS.meichun`, and `MEMBER_TRACKS.cheng` records with unchanged geometry.

- [ ] **Step 1: Add the failing identity-landmark regression test**

Insert this test after the existing calibrated-track validation test:

```js
test('calibrated tracks preserve verified member identities at both segment starts', () => {
  const landmarks = [
    {
      time: 1.136667,
      expected: {
        lulu: { x: .386, y: .319, width: .047, height: .172 },
        meichun: { x: .541, y: .319, width: .050, height: .202 },
        cheng: { x: .292, y: .452, width: .064, height: .218 },
      },
    },
    {
      time: 9.166667,
      expected: {
        lulu: { x: .386, y: .316, width: .046, height: .180 },
        meichun: { x: .535, y: .321, width: .053, height: .199 },
        cheng: { x: .292, y: .452, width: .062, height: .215 },
      },
    },
  ];

  for (const { time, expected } of landmarks) {
    for (const [id, rect] of Object.entries(expected)) {
      assert.deepEqual(
        getTrackedRectAtTime(MEMBER_TRACKS[id], time),
        rect,
        id + ' identity mismatch at ' + time,
      );
    }
  }
});
```

- [ ] **Step 2: Run the focused test and verify the identity mismatch**

Run:

```bash
/Users/cheng/.nvm/versions/node/v20.17.0/bin/node --experimental-default-type=module --test --test-name-pattern="verified member identities" tests/surveillance-hud.test.mjs
```

Expected: exit 1 with the new test failing because `MEMBER_TRACKS.lulu` returns the current Cheng rectangle instead of Lulu's expected rectangle. Existing nonmatching tests are skipped.

- [ ] **Step 3: Relabel the three source trajectory records**

Apply exactly these identifier edits without moving or changing any `segments` data:

```diff
 export const MEMBER_TRACKS = Object.freeze({
-  lulu: {
-    id: 'lulu',
+  cheng: {
+    id: 'cheng',
     segments: [

@@
-  meichun: {
-    id: 'meichun',
+  lulu: {
+    id: 'lulu',
     segments: [

@@
-  cheng: {
-    id: 'cheng',
+  meichun: {
+    id: 'meichun',
     segments: [
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
/Users/cheng/.nvm/versions/node/v20.17.0/bin/node --experimental-default-type=module --test --test-name-pattern="verified member identities" tests/surveillance-hud.test.mjs
```

Expected: exit 0 with 1 selected test passing and 0 failures.

- [ ] **Step 5: Run the complete automated verification**

Run:

```bash
/Users/cheng/.nvm/versions/node/v20.17.0/bin/node --experimental-default-type=module --test tests/surveillance-hud.test.mjs
/Users/cheng/.nvm/versions/node/v20.17.0/bin/node --experimental-default-type=module --check animations/team-member-tracks.js
/Users/cheng/.nvm/versions/node/v20.17.0/bin/node --experimental-default-type=module --check animations/surveillance-hud.js
git diff --check
```

Expected: 42 tests pass with 0 failures, both syntax checks exit 0 without diagnostics, and `git diff --check` exits 0.

- [ ] **Step 6: Inspect the focused scope**

Run:

```bash
git diff -- animations/team-member-tracks.js tests/surveillance-hud.test.mjs
git status --short
```

Expected: production/test changes are limited to the six track identifiers and the single landmark test. The already committed design and plan documentation may appear only in branch history, not as unstaged changes.

- [ ] **Step 7: Commit the correction**

```bash
git add animations/team-member-tracks.js tests/surveillance-hud.test.mjs
git commit -m "fix: correct team video member identities"
```

Expected: one focused commit containing exactly the track relabel and regression test.

- [ ] **Step 8: Complete independent review and publish**

Have a fresh reviewer inspect the Task 1 base-to-head diff against this plan and the approved design. Resolve any Critical or Important findings and rerun the complete verification.

After approval, run:

```bash
git push origin feat/interactive-team-video-hitboxes
gh pr view 5 --repo crcolab/crccolab.github.io --json isDraft,state,baseRefName,headRefName,headRefOid,url
```

Expected: the push exits 0, and draft PR #5 remains open from `feat/interactive-team-video-hitboxes` into `main` with its head SHA equal to the reviewed local `HEAD`.
