import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MEMBER_IDS,
  MEMBER_TRACKS,
} from '../animations/team-member-tracks.js';
import {
  getTrackedRectAtTime,
  isValidMemberTrack,
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
