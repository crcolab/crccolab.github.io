import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  MEMBER_IDS,
  MEMBER_TRACKS,
} from '../animations/team-member-tracks.js';
import {
  shuffleMemberIds,
  takeNextVisibleMember,
  getTeaserDelay,
  createPlaybackLease,
  expandTouchRect,
  pickNearestTarget,
  computePanelPlacement,
  computeCoverTransform,
  getTrackedRectAtTime,
  isMappedRectEligible,
  isValidMemberTrack,
  mapNormalizedRect,
} from '../animations/surveillance-hud.js';

const approx = (actual, expected, epsilon = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    'expected ' + actual + ' to be within ' + epsilon + ' of ' + expected,
  );
};

test('calibrated tracks are normalized, ordered, and sampled at most 0.5s apart', () => {
  assert.deepEqual(MEMBER_IDS, ['lulu', 'meichun', 'cheng', 'tzu-tung', 'sean']);

  for (const id of MEMBER_IDS) {
    const track = MEMBER_TRACKS[id];
    assert.equal(track.id, id);
    assert.equal(isValidMemberTrack(track), true);

    for (const segment of track.segments) {
      assert.ok(segment.start < segment.end);
      assert.equal(segment.keyframes[0].time, segment.start);
      assert.ok(segment.keyframes.at(-1).time < segment.end);

      for (let index = 0; index < segment.keyframes.length; index += 1) {
        const frame = segment.keyframes[index];
        const rect = frame.rect;
        assert.ok(rect.x >= 0 && rect.y >= 0);
        assert.ok(rect.width > 0 && rect.height > 0);
        assert.ok(rect.x + rect.width <= 1);
        assert.ok(rect.y + rect.height <= 1);

        if (index > 0) {
          const gap = frame.time - segment.keyframes[index - 1].time;
          assert.ok(gap > 0 && gap <= 0.500001, id + ' gap was ' + gap);
        }
      }
    }
  }
});

test('tracked rectangles return exact frames and interpolate within one segment', () => {
  const track = {
    id: 'sample',
    segments: [{
      start: 1,
      end: 2,
      keyframes: [
        { time: 1, rect: { x: 0.1, y: 0.2, width: 0.2, height: 0.3 } },
        { time: 1.5, rect: { x: 0.3, y: 0.4, width: 0.4, height: 0.5 } },
      ],
    }],
  };

  assert.deepEqual(getTrackedRectAtTime(track, 1), track.segments[0].keyframes[0].rect);

  const midpoint = getTrackedRectAtTime(track, 1.25);
  approx(midpoint.x, 0.2);
  approx(midpoint.y, 0.3);
  approx(midpoint.width, 0.3);
  approx(midpoint.height, 0.4);

  assert.deepEqual(
    getTrackedRectAtTime(track, 1.9),
    track.segments[0].keyframes[1].rect,
  );
});

test('tracking returns null outside segments and never crosses a cut or loop', () => {
  const track = MEMBER_TRACKS.lulu;
  assert.equal(getTrackedRectAtTime(track, 0), null);
  assert.equal(getTrackedRectAtTime(track, 8), null);
  assert.equal(getTrackedRectAtTime(track, 10.408333), null);
  assert.deepEqual(
    getTrackedRectAtTime(track, 1.136667),
    track.segments[0].keyframes[0].rect,
  );
});

test('cover transforms center-crop 1920x1044 into desktop and mobile HUDs', () => {
  const desktop = computeCoverTransform(
    { width: 1920, height: 1044 },
    { width: 1176, height: 504 },
  );
  approx(desktop.renderedWidth, 1176);
  approx(desktop.offsetX, 0);
  assert.ok(desktop.offsetY < 0);

  const mobile = computeCoverTransform(
    { width: 1920, height: 1044 },
    { width: 390, height: 219.375 },
  );
  approx(mobile.renderedHeight, 219.375);
  approx(mobile.offsetY, 0);
  assert.ok(mobile.offsetX < 0);
});

test('normalized rectangles map through the cover transform', () => {
  const transform = computeCoverTransform(
    { width: 100, height: 100 },
    { width: 200, height: 100 },
  );
  const mapped = mapNormalizedRect(
    { x: .25, y: .25, width: .5, height: .5 },
    transform,
  );

  assert.deepEqual(mapped, { x: 50, y: 0, width: 100, height: 100 });
});

test('mapped eligibility requires center in frame and at least half visible area', () => {
  const frame = { width: 100, height: 100 };
  assert.equal(
    isMappedRectEligible({ x: 10, y: 10, width: 40, height: 40 }, frame),
    true,
  );
  assert.equal(
    isMappedRectEligible({ x: -10, y: 10, width: 30, height: 30 }, frame),
    true,
  );
  assert.equal(
    isMappedRectEligible({ x: -30, y: 10, width: 40, height: 40 }, frame),
    false,
  );
  assert.equal(
    isMappedRectEligible({ x: 110, y: 10, width: 20, height: 20 }, frame),
    false,
  );
});

test('touch rectangles expand to 44px without moving the center', () => {
  assert.deepEqual(
    expandTouchRect({ x: 20, y: 30, width: 20, height: 30 }),
    { x: 8, y: 23, width: 44, height: 44 },
  );
});

test('overlapping touch targets choose the nearest visual center with stable ties', () => {
  const candidates = [
    {
      id: 'lulu',
      visualRect: { x: 10, y: 10, width: 10, height: 10 },
      touchRect: { x: 0, y: 0, width: 44, height: 44 },
    },
    {
      id: 'meichun',
      visualRect: { x: 25, y: 10, width: 10, height: 10 },
      touchRect: { x: 5, y: 0, width: 44, height: 44 },
    },
  ];

  assert.equal(pickNearestTarget({ x: 29, y: 15 }, candidates), 'meichun');
  assert.equal(pickNearestTarget({ x: 22.5, y: 15 }, candidates), 'lulu');
  assert.equal(pickNearestTarget({ x: 90, y: 90 }, candidates), null);
});

test('panel placement prefers right, then left, and clamps with an 8px inset', () => {
  assert.deepEqual(
    computePanelPlacement(
      { x: 20, y: 20, width: 20, height: 20 },
      { width: 30, height: 20 },
      { width: 100, height: 100 },
    ),
    { left: 52, top: 20, side: 'right' },
  );

  assert.deepEqual(
    computePanelPlacement(
      { x: 70, y: 20, width: 20, height: 20 },
      { width: 30, height: 20 },
      { width: 100, height: 100 },
    ),
    { left: 28, top: 20, side: 'left' },
  );

  const clamped = computePanelPlacement(
    { x: 45, y: 45, width: 10, height: 10 },
    { width: 95, height: 95 },
    { width: 100, height: 100 },
  );
  assert.deepEqual(clamped, { left: 8, top: 8, side: 'right' });
});

test('shuffle bags do not mutate input and visible selection consumes only a shown ID', () => {
  const source = ['lulu', 'meichun', 'cheng'];
  assert.deepEqual(shuffleMemberIds(source, () => 0), ['meichun', 'cheng', 'lulu']);
  assert.deepEqual(source, ['lulu', 'meichun', 'cheng']);

  const selected = takeNextVisibleMember(
    ['lulu', 'meichun', 'cheng'],
    new Set(['cheng']),
  );
  assert.deepEqual(selected, {
    memberId: 'cheng',
    remaining: ['lulu', 'meichun'],
  });

  assert.deepEqual(
    takeNextVisibleMember(['lulu', 'meichun'], new Set()),
    { memberId: null, remaining: ['lulu', 'meichun'] },
  );
});

test('teaser delay is an inclusive integer from 2500 through 5000ms', () => {
  assert.equal(getTeaserDelay(() => 0), 2500);
  assert.equal(getTeaserDelay(() => 0.5), 3750);
  assert.equal(getTeaserDelay(() => 0.999999), 5000);
});

test('playback lease resumes only a pause it owns and catches play rejection', async () => {
  const playingVideo = {
    paused: false,
    ended: false,
    pauseCalls: 0,
    playCalls: 0,
    pause() {
      this.pauseCalls += 1;
      this.paused = true;
    },
    async play() {
      this.playCalls += 1;
      this.paused = false;
    },
  };
  const lease = createPlaybackLease(playingVideo);

  assert.equal(lease.pauseForInteraction(), true);
  assert.equal(lease.pauseForInteraction(), true);
  assert.equal(lease.ownsPause(), true);
  assert.equal(playingVideo.pauseCalls, 1);
  assert.equal(await lease.resumeIfOwned(), true);
  assert.equal(playingVideo.playCalls, 1);
  assert.equal(lease.ownsPause(), false);

  const pausedVideo = {
    paused: true,
    ended: false,
    pause() {
      throw new Error('must not pause');
    },
    async play() {
      throw new Error('must not play');
    },
  };
  const pausedLease = createPlaybackLease(pausedVideo);
  assert.equal(pausedLease.pauseForInteraction(), false);
  assert.equal(await pausedLease.resumeIfOwned(), false);

  const blockedVideo = {
    paused: false,
    ended: false,
    pause() {
      this.paused = true;
    },
    async play() {
      throw new Error('autoplay blocked');
    },
  };
  const blockedLease = createPlaybackLease(blockedVideo);
  blockedLease.pauseForInteraction();
  assert.equal(await blockedLease.resumeIfOwned(), false);
  assert.equal(blockedLease.ownsPause(), false);
});

test('playback lease can release ownership without resuming while hidden', async () => {
  const video = {
    paused: false,
    ended: false,
    pause() {
      this.paused = true;
    },
    async play() {
      throw new Error('must not play');
    },
  };
  const lease = createPlaybackLease(video);
  lease.pauseForInteraction();
  assert.equal(await lease.resumeIfOwned(false), false);
  assert.equal(lease.ownsPause(), false);
});

test('team markup has five semantic targets linked to the existing roster copy', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const ids = ['lulu', 'meichun', 'cheng', 'tzu-tung', 'sean'];

  assert.equal((html.match(/class="team-member-target"/g) || []).length, 5);
  assert.doesNotMatch(html, /class="face-target"/);
  assert.match(html, /data-team-member-overlay[^>]*hidden/);
  assert.match(html, /data-team-member-panel[^>]*hidden[^>]*aria-hidden="true"/);

  for (const id of ids) {
    const labelIds = [
      'team-member-' + id + '-name-zh',
      'team-member-' + id + '-name-en',
      'team-member-' + id + '-role-zh',
      'team-member-' + id + '-role-en',
    ];
    for (const labelId of labelIds) {
      assert.match(html, new RegExp('id="' + labelId + '"'));
    }

    const openingTag = html.match(
      new RegExp('<button[^>]*data-member-id="' + id + '"[^>]*>'),
    )?.[0];
    assert.ok(openingTag, 'missing target for ' + id);
    assert.match(openingTag, /type="button"/);
    assert.match(openingTag, /disabled/);
    assert.match(
      openingTag,
      new RegExp('aria-labelledby="' + labelIds.join(' ') + '"'),
    );
  }

  for (const field of ['name-zh', 'name-en', 'role-zh', 'role-en']) {
    assert.match(html, new RegExp('data-panel-field="' + field + '"'));
  }
});

test('team target CSS is invisible by default and exposes teaser, active, focus, and reduced-motion states', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.team-member-overlay\{[^}]*pointer-events:none/s);
  assert.match(css, /\.team-member-target\[disabled\]\{display:none\}/);
  assert.match(css, /\.team-member-target\.is-teasing/);
  assert.match(css, /\.team-member-target\.is-active/);
  assert.match(css, /\.team-member-target:focus-visible/);
  assert.match(css, /\.team-member-panel\{[^}]*pointer-events:none/s);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /\.face-target/);
});

test('HUD initializer uses media-frame sync, resize invalidation, and no legacy fallback', async () => {
  const source = await readFile(
    new URL('../animations/surveillance-hud.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /requestVideoFrameCallback/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /new ResizeObserver/);
  assert.match(source, /loadedmetadata/);
  assert.match(source, /seeked/);
  assert.doesNotMatch(source, /querySelectorAll\('\.face-target'\)/);
  assert.doesNotMatch(source, /}, 2000\)/);
});

test('HUD controller wires direct input without duplicating roster HTML', async () => {
  const source = await readFile(
    new URL('../animations/surveillance-hud.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /const playback = createPlaybackLease\(video\)/);
  assert.match(source, /addEventListener\('pointerenter'/);
  assert.match(source, /addEventListener\('pointerleave'/);
  assert.match(source, /addEventListener\('focus'/);
  assert.match(source, /addEventListener\('focusout'/);
  assert.match(source, /addEventListener\('pointerdown'/);
  assert.match(source, /addEventListener\('keydown'/);
  assert.match(source, /computePanelPlacement\(/);
  assert.match(source, /\.textContent = rosterEntry\./);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
});
