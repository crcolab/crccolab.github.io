import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MEMBER_IDS,
  MEMBER_TRACKS,
} from '../animations/team-member-tracks.js';
import {
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
