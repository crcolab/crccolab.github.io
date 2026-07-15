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
  initSurveillanceHUD,
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

test('frame-aware touch rectangles keep 44px in frame and preserve tracked centers', () => {
  const frame = { width: 100, height: 100 };
  const edgeRects = [
    { x: 0, y: 45, width: 10, height: 10 },
    { x: 90, y: 45, width: 10, height: 10 },
    { x: 45, y: 0, width: 10, height: 10 },
    { x: 45, y: 90, width: 10, height: 10 },
  ];

  for (const rect of edgeRects) {
    const expanded = expandTouchRect(rect, 44, frame);
    const inFrameWidth = Math.max(
      0,
      Math.min(expanded.x + expanded.width, frame.width)
        - Math.max(expanded.x, 0),
    );
    const inFrameHeight = Math.max(
      0,
      Math.min(expanded.y + expanded.height, frame.height)
        - Math.max(expanded.y, 0),
    );

    assert.equal(expanded.x + expanded.width / 2, rect.x + rect.width / 2);
    assert.equal(expanded.y + expanded.height / 2, rect.y + rect.height / 2);
    assert.ok(inFrameWidth >= 44);
    assert.ok(inFrameHeight >= 44);
  }
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

test('reduced-motion direct brackets remain visibly drawn without animation', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(
    css,
    /@media \(prefers-reduced-motion:reduce\)\{[\s\S]*?\.team-member-target\.is-active \.team-member-target__bracket path,\s*\.team-member-target:focus-visible \.team-member-target__bracket path\{stroke-dashoffset:0\}/,
  );
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

test('HUD source wires a bounded reduced-motion-aware teaser lifecycle', async () => {
  const source = await readFile(
    new URL('../animations/surveillance-hud.js', import.meta.url),
    'utf8',
  );

  assert.match(
    source,
    /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/,
  );
  assert.match(
    source,
    /setTimeout\(showNextTeaser, getTeaserDelay\(\)\)/,
  );
  assert.match(
    source,
    /teaserHideTimer = setTimeout\(\(\) => \{[\s\S]*?\}, 700\)/,
  );
  assert.match(
    source,
    /takeNextVisibleMember\(teaserBag, new Set\(layouts\.keys\(\)\)\)/,
  );
  assert.match(source, /classList\.add\('is-teasing'\)/);
  assert.match(
    source,
    /motionQuery\.addEventListener\('change', handleMotionPreferenceChange\)/,
  );
});

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
    this.parentNode = null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, init = {}) {
    const event = {
      ...init,
      type,
      bubbles: Boolean(init.bubbles),
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
    this.dispatchEvent(event);
    return event;
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    event.currentTarget = this;

    for (const listener of this.listeners.get(event.type) || []) {
      listener.call(this, event);
    }

    if (event.bubbles && this.parentNode) {
      this.parentNode.dispatchEvent(event);
    }
    return !event.defaultPrevented;
  }
}

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }

  contains(value) {
    return this.values.has(value);
  }
}

class FakeHTMLElement extends FakeEventTarget {
  constructor(ownerDocument) {
    super();
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.dataset = {};
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.clientWidth = 0;
    this.clientHeight = 0;
    this.offsetWidth = 0;
    this.offsetHeight = 0;
    this.queryResults = new Map();
    this.queryAllResults = new Map();
    this.closestResults = new Map();
  }

  querySelector(selector) {
    return this.queryResults.get(selector) || null;
  }

  querySelectorAll(selector) {
    return this.queryAllResults.get(selector) || [];
  }

  closest(selector) {
    return this.closestResults.get(selector) || null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'disabled') this.disabled = true;
  }

  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      width: this.clientWidth,
      height: this.clientHeight,
    };
  }

  contains(node) {
    for (let current = node; current; current = current.parentNode) {
      if (current === this) return true;
    }
    return false;
  }

  focus() {
    const previous = this.ownerDocument.activeElement;
    if (previous === this) return;
    if (previous?.dispatch) {
      previous.dispatch('focusout', { bubbles: true, relatedTarget: this });
    }
    this.ownerDocument.activeElement = this;
    this.dispatch('focus');
  }

  blur() {
    if (this.ownerDocument.activeElement !== this) return;
    this.ownerDocument.activeElement = null;
    this.dispatch('focusout', { bubbles: true, relatedTarget: null });
  }
}

class FakeDocument extends FakeEventTarget {
  constructor() {
    super();
    this.activeElement = null;
    this.hidden = false;
    this.ids = new Map();
    this.queryResults = new Map();
  }

  querySelector(selector) {
    return this.queryResults.get(selector) || null;
  }

  getElementById(id) {
    return this.ids.get(id) || null;
  }
}

class FakeVideo extends FakeHTMLElement {
  constructor(ownerDocument, paused) {
    super(ownerDocument);
    this.paused = paused;
    this.ended = false;
    this.seeking = false;
    this.readyState = 1;
    this.videoWidth = 1920;
    this.videoHeight = 1044;
    this.currentTime = 3;
    this.pauseCalls = 0;
    this.playCalls = 0;
    this.frameCallbacks = new Map();
    this.nextFrameHandle = 1;
  }

  pause() {
    this.pauseCalls += 1;
    this.paused = true;
  }

  async play() {
    this.playCalls += 1;
    this.paused = false;
  }

  requestVideoFrameCallback(callback) {
    const handle = this.nextFrameHandle;
    this.nextFrameHandle += 1;
    this.frameCallbacks.set(handle, callback);
    return handle;
  }

  cancelVideoFrameCallback(handle) {
    this.frameCallbacks.delete(handle);
  }
}

const installControllerHarness = ({
  paused = false,
  ended = false,
  seeking = false,
  readyState = 1,
  dispatchPlaying = !paused,
  reducedMotion = false,
  randomValues = [0],
  frameWidth = 1176,
  frameHeight = 504,
  currentTime = 3,
} = {}) => {
  const document = new FakeDocument();
  const window = new FakeEventTarget();
  const motionQuery = new FakeEventTarget();
  const hud = new FakeHTMLElement(document);
  const overlay = new FakeHTMLElement(document);
  const panel = new FakeHTMLElement(document);
  const video = new FakeVideo(document, paused);
  const outside = new FakeHTMLElement(document);
  const targets = new Map();
  const panelFields = new Map();
  let nextAnimationFrame = 1;
  let nextTimer = 1;
  let randomIndex = 0;
  const animationFrames = new Map();
  const timers = new Map();
  const fakeMath = Object.create(globalThis.Math);

  fakeMath.random = () => {
    const fallback = randomValues.at(-1) ?? 0;
    const value = randomValues[randomIndex] ?? fallback;
    randomIndex += 1;
    return value;
  };
  motionQuery.matches = reducedMotion;
  window.matchMedia = (query) => {
    motionQuery.media = query;
    return motionQuery;
  };

  hud.clientWidth = frameWidth;
  hud.clientHeight = frameHeight;
  overlay.hidden = true;
  overlay.parentNode = hud;
  panel.hidden = true;
  panel.offsetWidth = 220;
  panel.offsetHeight = 110;
  panel.parentNode = overlay;
  video.parentNode = hud;
  video.currentTime = currentTime;
  video.ended = ended;
  video.seeking = seeking;
  video.readyState = readyState;
  video.closestResults.set('.crc-hud', hud);

  for (const field of ['name-zh', 'name-en', 'role-zh', 'role-en']) {
    const element = new FakeHTMLElement(document);
    element.parentNode = panel;
    panelFields.set(field, element);
    panel.queryResults.set('[data-panel-field="' + field + '"]', element);
  }

  for (const id of MEMBER_IDS) {
    const target = new FakeHTMLElement(document);
    target.dataset.memberId = id;
    target.disabled = true;
    target.parentNode = overlay;
    targets.set(id, target);

    for (const [key, suffix] of [
      ['nameZh', 'name-zh'],
      ['nameEn', 'name-en'],
      ['roleZh', 'role-zh'],
      ['roleEn', 'role-en'],
    ]) {
      const rosterField = new FakeHTMLElement(document);
      rosterField.textContent = '  ' + id + '-' + key + '  ';
      document.ids.set('team-member-' + id + '-' + suffix, rosterField);
    }
  }

  overlay.queryResults.set('[data-team-member-panel]', panel);
  overlay.queryAllResults.set('.team-member-target', [...targets.values()]);
  hud.queryResults.set('[data-team-member-overlay]', overlay);
  document.queryResults.set('.team__video', video);

  const replacements = {
    document,
    window,
    HTMLElement: FakeHTMLElement,
    Math: fakeMath,
    ResizeObserver: class {
      observe() {}
    },
    setTimeout(callback, delay) {
      const handle = nextTimer;
      nextTimer += 1;
      timers.set(handle, { callback, delay });
      return handle;
    },
    clearTimeout(handle) {
      timers.delete(handle);
    },
    requestAnimationFrame(callback) {
      const handle = nextAnimationFrame;
      nextAnimationFrame += 1;
      animationFrames.set(handle, callback);
      return handle;
    },
    cancelAnimationFrame(handle) {
      animationFrames.delete(handle);
    },
  };
  const originals = new Map();

  for (const [name, value] of Object.entries(replacements)) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value,
    });
  }

  const restore = () => {
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  };

  try {
    initSurveillanceHUD();
    if (dispatchPlaying) video.dispatch('playing');
  } catch (error) {
    restore();
    throw error;
  }

  return {
    document,
    outside,
    overlay,
    panel,
    panelFields,
    targets,
    video,
    restore,
    setReducedMotion(matches) {
      motionQuery.matches = matches;
      motionQuery.dispatch('change', { matches });
    },
    runTimer(delay) {
      const timerEntry = [...timers]
        .find(([, timer]) => timer.delay === delay);
      assert.ok(timerEntry, 'missing timer with delay ' + delay);
      const [handle, timer] = timerEntry;
      timers.delete(handle);
      timer.callback();
    },
    timerDelays() {
      return [...timers.values()]
        .map((timer) => timer.delay)
        .sort((left, right) => left - right);
    },
    teasingIds() {
      return MEMBER_IDS.filter(
        (id) => targets.get(id).classList.contains('is-teasing'),
      );
    },
    activeId() {
      return MEMBER_IDS.find(
        (id) => targets.get(id).classList.contains('is-active'),
      ) || null;
    },
  };
};

const targetCenter = (target) => ({
  x: Number.parseFloat(target.style.left)
    + Number.parseFloat(target.style.width) / 2,
  y: Number.parseFloat(target.style.top)
    + Number.parseFloat(target.style.height) / 2,
});

test('teasers use fresh endpoint delays and stay visible for 700ms without opening or pausing', () => {
  const harness = installControllerHarness({
    randomValues: [0, 0, 0, 0, 0, 0.999999],
  });

  try {
    assert.deepEqual(harness.timerDelays(), [2500]);

    harness.runTimer(2500);
    assert.equal(harness.teasingIds().length, 1);
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.paused, false);
    assert.equal(harness.video.pauseCalls, 0);
    assert.deepEqual(harness.timerDelays(), [700, 5000]);

    harness.runTimer(700);
    assert.deepEqual(harness.teasingIds(), []);
    assert.deepEqual(harness.timerDelays(), [5000]);
  } finally {
    harness.restore();
  }
});

test('teaser bag skips target-free frames without consuming a member', () => {
  const harness = installControllerHarness();

  try {
    harness.video.currentTime = 8;
    harness.video.dispatch('seeked');
    harness.runTimer(2500);

    assert.deepEqual(harness.teasingIds(), []);
    assert.deepEqual(harness.timerDelays(), [2500]);

    harness.video.currentTime = 3;
    harness.video.dispatch('seeked');
    const shown = [];

    for (let index = 0; index < MEMBER_IDS.length; index += 1) {
      harness.runTimer(2500);
      shown.push(harness.teasingIds()[0]);
      harness.runTimer(700);
    }

    assert.deepEqual(shown, [
      'meichun',
      'cheng',
      'tzu-tung',
      'sean',
      'lulu',
    ]);
    assert.equal(new Set(shown).size, MEMBER_IDS.length);
  } finally {
    harness.restore();
  }
});

test('reduced motion blocks teasers and preference changes cancel or restart them', async () => {
  const harness = installControllerHarness({ reducedMotion: true });

  try {
    assert.deepEqual(harness.timerDelays(), []);

    harness.setReducedMotion(false);
    assert.deepEqual(harness.timerDelays(), [2500]);
    harness.runTimer(2500);
    assert.equal(harness.teasingIds().length, 1);

    harness.setReducedMotion(true);
    assert.deepEqual(harness.teasingIds(), []);
    assert.deepEqual(harness.timerDelays(), []);

    harness.targets.get('lulu').dispatch('pointerenter', {
      pointerType: 'mouse',
    });
    assert.equal(harness.activeId(), 'lulu');
    assert.equal(harness.panel.hidden, false);

    harness.targets.get('lulu').dispatch('pointerleave', {
      pointerType: 'mouse',
    });
    await Promise.resolve();
    harness.setReducedMotion(false);
    assert.deepEqual(harness.timerDelays(), []);
    harness.video.dispatch('playing');
    assert.deepEqual(harness.timerDelays(), [2500]);
  } finally {
    harness.restore();
  }
});

test('pause cancels a visible teaser and playing starts a fresh wait', () => {
  const harness = installControllerHarness();

  try {
    harness.runTimer(2500);
    assert.equal(harness.teasingIds().length, 1);

    harness.video.paused = true;
    harness.video.dispatch('pause');
    assert.deepEqual(harness.teasingIds(), []);
    assert.deepEqual(harness.timerDelays(), []);

    harness.video.paused = false;
    harness.video.dispatch('playing');
    assert.deepEqual(harness.timerDelays(), [2500]);
  } finally {
    harness.restore();
  }
});

test('presentation snapshot bootstraps cached autoplay after a missed playing event', () => {
  const harness = installControllerHarness({
    readyState: 3,
    dispatchPlaying: false,
  });

  try {
    assert.equal(harness.overlay.hidden, false);
    assert.deepEqual(harness.timerDelays(), [2500]);
    assert.equal(harness.video.frameCallbacks.size, 1);
  } finally {
    harness.restore();
  }
});

test('presentation snapshot resumes a fully buffered seek without playing', () => {
  const harness = installControllerHarness({ readyState: 4 });

  try {
    harness.video.seeking = true;
    harness.video.dispatch('seeking');
    assert.deepEqual(harness.timerDelays(), []);
    assert.equal(harness.video.frameCallbacks.size, 0);

    harness.video.seeking = false;
    harness.video.dispatch('seeked');
    assert.deepEqual(harness.timerDelays(), [2500]);
    assert.equal(harness.video.frameCallbacks.size, 1);
  } finally {
    harness.restore();
  }
});

test('presentation snapshot rejects incomplete bootstrap media states', () => {
  const states = [
    { paused: true, readyState: 4 },
    { ended: true, readyState: 4 },
    { seeking: true, readyState: 4 },
    { readyState: 2 },
  ];

  for (const state of states) {
    const harness = installControllerHarness({
      ...state,
      dispatchPlaying: false,
    });

    try {
      assert.deepEqual(harness.timerDelays(), [], JSON.stringify(state));
      assert.equal(
        harness.video.frameCallbacks.size,
        0,
        JSON.stringify(state),
      );
    } finally {
      harness.restore();
    }
  }
});

test('presentation suspension cancels teasers and frames until playing', () => {
  for (const eventName of ['waiting', 'stalled', 'pause', 'ended']) {
    const harness = installControllerHarness();

    try {
      harness.runTimer(2500);
      assert.equal(harness.teasingIds().length, 1, eventName);
      assert.equal(harness.video.frameCallbacks.size, 1, eventName);

      if (eventName === 'pause') harness.video.paused = true;
      if (eventName === 'ended') harness.video.ended = true;
      harness.video.dispatch(eventName);

      assert.deepEqual(harness.teasingIds(), [], eventName);
      assert.deepEqual(harness.timerDelays(), [], eventName);
      assert.equal(harness.video.frameCallbacks.size, 0, eventName);

      harness.video.paused = false;
      harness.video.ended = false;
      harness.video.dispatch('seeked');
      assert.deepEqual(harness.timerDelays(), [], eventName);
      assert.equal(harness.video.frameCallbacks.size, 0, eventName);

      harness.video.dispatch('playing');
      assert.deepEqual(harness.timerDelays(), [2500], eventName);
      assert.equal(harness.video.frameCallbacks.size, 1, eventName);
    } finally {
      harness.restore();
    }
  }
});

test('presentation suspension keeps target-free seeks idle until playing', () => {
  const harness = installControllerHarness();

  try {
    harness.video.currentTime = 8;
    harness.video.dispatch('seeking');

    assert.equal(harness.targets.get('lulu').disabled, false);
    assert.deepEqual(harness.timerDelays(), []);
    assert.equal(harness.video.frameCallbacks.size, 0);

    harness.video.dispatch('seeked');
    assert.equal(
      MEMBER_IDS.every((id) => harness.targets.get(id).disabled),
      true,
    );
    assert.deepEqual(harness.timerDelays(), []);
    assert.equal(harness.video.frameCallbacks.size, 0);

    harness.video.dispatch('playing');
    assert.deepEqual(harness.timerDelays(), [2500]);
    assert.equal(harness.video.frameCallbacks.size, 1);

    harness.runTimer(2500);
    assert.deepEqual(harness.teasingIds(), []);
    assert.deepEqual(harness.timerDelays(), [2500]);
  } finally {
    harness.restore();
  }
});

test('presentation suspension ignores stale callbacks after playing restarts', () => {
  const harness = installControllerHarness();

  try {
    const staleCallback = [...harness.video.frameCallbacks.values()][0];
    assert.equal(typeof staleCallback, 'function');

    harness.video.dispatch('waiting');
    harness.video.currentTime = 8;
    staleCallback();
    assert.equal(harness.targets.get('lulu').disabled, false);
    assert.equal(harness.video.frameCallbacks.size, 0);

    harness.video.dispatch('playing');
    assert.equal(harness.video.frameCallbacks.size, 1);
    staleCallback();

    assert.equal(harness.targets.get('lulu').disabled, false);
    assert.equal(harness.video.frameCallbacks.size, 1);
    assert.deepEqual(harness.timerDelays(), [2500]);
  } finally {
    harness.restore();
  }
});

test('direct activation cancels teasers and dismissal starts a fresh wait', async () => {
  const harness = installControllerHarness();
  const target = harness.targets.get('lulu');

  try {
    harness.runTimer(2500);
    assert.equal(harness.teasingIds().length, 1);

    target.dispatch('pointerenter', { pointerType: 'mouse' });
    assert.deepEqual(harness.teasingIds(), []);
    assert.deepEqual(harness.timerDelays(), []);
    assert.equal(harness.activeId(), 'lulu');
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.paused, true);

    target.dispatch('pointerleave', { pointerType: 'mouse' });
    await Promise.resolve();
    assert.equal(harness.activeId(), null);
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.paused, false);
    assert.deepEqual(harness.timerDelays(), []);
    harness.video.dispatch('playing');
    assert.deepEqual(harness.timerDelays(), [2500]);
  } finally {
    harness.restore();
  }
});

test('hiding cancels a visible teaser and visible playback starts a fresh wait', () => {
  const harness = installControllerHarness();

  try {
    harness.runTimer(2500);
    assert.equal(harness.teasingIds().length, 1);

    harness.document.hidden = true;
    harness.document.dispatch('visibilitychange');
    assert.deepEqual(harness.teasingIds(), []);
    assert.deepEqual(harness.timerDelays(), []);

    harness.document.hidden = false;
    harness.document.dispatch('visibilitychange');
    assert.deepEqual(harness.timerDelays(), [2500]);
  } finally {
    harness.restore();
  }
});

test('hidden interaction clears UI then resumes its owned pause when visible', () => {
  const harness = installControllerHarness();

  try {
    harness.targets.get('lulu').dispatch('pointerenter', {
      pointerType: 'mouse',
    });
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.paused, true);

    harness.document.hidden = true;
    harness.document.dispatch('visibilitychange');
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.playCalls, 0);

    harness.document.hidden = false;
    harness.document.dispatch('visibilitychange');
    assert.equal(harness.video.playCalls, 1);
  } finally {
    harness.restore();
  }
});

test('hidden owned pause re-pauses unexpected playback and synchronizes after restore', () => {
  const harness = installControllerHarness();

  try {
    harness.targets.get('lulu').dispatch('pointerenter', {
      pointerType: 'mouse',
    });
    harness.document.hidden = true;
    harness.document.dispatch('visibilitychange');

    harness.video.paused = false;
    harness.video.dispatch('playing');
    assert.equal(harness.video.paused, true);
    assert.equal(harness.video.pauseCalls, 2);
    assert.deepEqual(harness.timerDelays(), []);

    harness.document.hidden = false;
    harness.document.dispatch('visibilitychange');
    assert.equal(harness.video.playCalls, 1);
    assert.equal(harness.video.paused, false);

    harness.video.dispatch('playing');
    assert.deepEqual(harness.timerDelays(), [2500]);
  } finally {
    harness.restore();
  }
});

test('click activation focuses a detail-zero target without prior focus', () => {
  const harness = installControllerHarness();
  const target = harness.targets.get('lulu');

  try {
    target.dispatch('click', { detail: 0 });

    assert.equal(harness.activeId(), 'lulu');
    assert.equal(harness.document.activeElement, target);
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.pauseCalls, 1);
    assert.equal(harness.video.playCalls, 0);
  } finally {
    harness.restore();
  }
});

test('click activation leaves an already focused target open', () => {
  const harness = installControllerHarness();
  const target = harness.targets.get('lulu');

  try {
    target.focus();
    target.dispatch('click', { detail: 0 });

    assert.equal(harness.activeId(), 'lulu');
    assert.equal(harness.document.activeElement, target);
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.pauseCalls, 1);
    assert.equal(harness.video.playCalls, 0);
  } finally {
    harness.restore();
  }
});

test('same-target touch blurs the focused team target while dismissing', () => {
  const harness = installControllerHarness();
  const target = harness.targets.get('lulu');

  try {
    target.focus();
    const point = targetCenter(target);
    const event = harness.document.dispatch('pointerdown', {
      pointerType: 'touch',
      clientX: point.x,
      clientY: point.y,
    });

    assert.equal(event.defaultPrevented, true);
    assert.equal(harness.activeId(), null);
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.document.activeElement, null);
  } finally {
    harness.restore();
  }
});

test('hiding blurs the focused team target before restoration', () => {
  const harness = installControllerHarness();
  const target = harness.targets.get('lulu');

  try {
    target.focus();
    harness.document.hidden = true;
    harness.document.dispatch('visibilitychange');

    assert.equal(harness.document.activeElement, null);
    assert.equal(harness.activeId(), null);
    assert.equal(harness.panel.hidden, true);

    harness.document.hidden = false;
    harness.document.dispatch('visibilitychange');
    assert.equal(harness.activeId(), null);
  } finally {
    harness.restore();
  }
});

test('visible eligibility invalidation resumes an interaction-owned pause', () => {
  const harness = installControllerHarness();

  try {
    harness.targets.get('lulu').dispatch('pointerenter', {
      pointerType: 'mouse',
    });
    harness.video.currentTime = 8;
    harness.video.dispatch('seeked');

    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.playCalls, 1);
  } finally {
    harness.restore();
  }
});

test('same target modalities keep the panel open until pointer and focus both leave', async () => {
  const harness = installControllerHarness();
  const target = harness.targets.get('lulu');

  try {
    target.dispatch('pointerenter', { pointerType: 'mouse' });
    target.focus();
    target.dispatch('pointerleave', { pointerType: 'mouse' });

    assert.equal(harness.activeId(), 'lulu');
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.playCalls, 0);

    target.dispatch('pointerenter', { pointerType: 'mouse' });
    target.blur();
    await Promise.resolve();

    assert.equal(harness.activeId(), 'lulu');
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.playCalls, 0);

    target.dispatch('pointerleave', { pointerType: 'mouse' });
    await Promise.resolve();
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.playCalls, 1);
  } finally {
    harness.restore();
  }
});

test('different target modalities prefer focus then return to the hovered target without resuming', async () => {
  const harness = installControllerHarness();
  const hovered = harness.targets.get('lulu');
  const focused = harness.targets.get('meichun');

  try {
    hovered.dispatch('pointerenter', { pointerType: 'mouse' });
    focused.focus();

    assert.equal(harness.activeId(), 'meichun');
    assert.equal(harness.video.playCalls, 0);

    focused.blur();
    await Promise.resolve();

    assert.equal(harness.activeId(), 'lulu');
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.playCalls, 0);

    hovered.dispatch('pointerleave', { pointerType: 'mouse' });
    await Promise.resolve();
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.playCalls, 1);
  } finally {
    harness.restore();
  }
});

test('overlapping pointer transition switches directly without releasing playback', async () => {
  const harness = installControllerHarness();
  const first = harness.targets.get('lulu');
  const second = harness.targets.get('meichun');

  try {
    first.dispatch('pointerenter', { pointerType: 'mouse' });
    first.dispatch('pointerleave', { pointerType: 'mouse' });
    second.dispatch('pointerenter', { pointerType: 'mouse' });
    await Promise.resolve();

    assert.equal(harness.activeId(), 'meichun');
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.playCalls, 0);
    assert.equal(harness.video.pauseCalls, 1);
  } finally {
    harness.restore();
  }
});

test('global Escape dismisses an active panel while focus is outside the overlay', () => {
  const harness = installControllerHarness();

  try {
    harness.targets.get('lulu').dispatch('pointerenter', {
      pointerType: 'mouse',
    });
    harness.outside.focus();

    const event = harness.document.dispatch('keydown', { key: 'Escape' });

    assert.equal(event.defaultPrevented, true);
    assert.equal(harness.activeId(), null);
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.playCalls, 1);
    assert.equal(harness.document.activeElement, harness.outside);
  } finally {
    harness.restore();
  }
});

test('outside touch dismisses an active panel regardless of opening modality', () => {
  const harness = installControllerHarness();

  try {
    harness.targets.get('lulu').dispatch('pointerenter', {
      pointerType: 'mouse',
    });
    harness.document.dispatch('pointerdown', {
      pointerType: 'touch',
      clientX: -1,
      clientY: -1,
    });

    assert.equal(harness.activeId(), null);
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.playCalls, 1);
  } finally {
    harness.restore();
  }
});

test('touching the visible panel dismisses before target hit-testing', () => {
  const harness = installControllerHarness();
  const coveredTarget = harness.targets.get('meichun');

  try {
    harness.targets.get('lulu').dispatch('pointerenter', {
      pointerType: 'mouse',
    });
    const point = targetCenter(coveredTarget);
    harness.panel.getBoundingClientRect = () => ({
      left: point.x - 10,
      top: point.y - 10,
      width: 20,
      height: 20,
      right: point.x + 10,
      bottom: point.y + 10,
    });

    const event = harness.document.dispatch('pointerdown', {
      pointerType: 'touch',
      clientX: point.x,
      clientY: point.y,
    });

    assert.equal(event.defaultPrevented, true);
    assert.equal(harness.activeId(), null);
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.playCalls, 1);
  } finally {
    harness.restore();
  }
});

test('frame-aware touch acquisition reaches an edge-cropped mobile target', () => {
  const frameHeight = 219.375;
  const harness = installControllerHarness({
    frameWidth: 390,
    frameHeight,
    currentTime: 6,
  });
  const target = harness.targets.get('tzu-tung');

  try {
    assert.equal(target.disabled, false);
    const point = targetCenter(target);
    const event = harness.document.dispatch('pointerdown', {
      pointerType: 'touch',
      clientX: point.x,
      clientY: frameHeight - 43.9,
    });

    assert.equal(event.defaultPrevented, true);
    assert.equal(harness.activeId(), 'tzu-tung');
    assert.equal(harness.panel.hidden, false);
  } finally {
    harness.restore();
  }
});

test('already-paused video is not resumed by interaction dismissal', async () => {
  const harness = installControllerHarness({ paused: true });
  const target = harness.targets.get('lulu');

  try {
    target.dispatch('pointerenter', { pointerType: 'mouse' });
    assert.equal(harness.panel.hidden, false);
    assert.equal(harness.video.pauseCalls, 0);

    target.dispatch('pointerleave', { pointerType: 'mouse' });
    await Promise.resolve();
    assert.equal(harness.panel.hidden, true);
    assert.equal(harness.video.playCalls, 0);
    assert.equal(harness.video.paused, true);
  } finally {
    harness.restore();
  }
});

test('unexpected playback is re-paused under an existing owned lease', async () => {
  const harness = installControllerHarness();
  const target = harness.targets.get('lulu');

  try {
    target.dispatch('pointerenter', { pointerType: 'mouse' });
    assert.equal(harness.video.pauseCalls, 1);

    harness.video.paused = false;
    harness.video.dispatch('playing');
    assert.equal(harness.video.paused, true);
    assert.equal(harness.video.pauseCalls, 2);

    target.dispatch('pointerleave', { pointerType: 'mouse' });
    await Promise.resolve();
    assert.equal(harness.video.playCalls, 1);
  } finally {
    harness.restore();
  }
});

test('unexpected playback after pre-paused activation acquires an owned lease', async () => {
  const harness = installControllerHarness({ paused: true });
  const target = harness.targets.get('lulu');

  try {
    target.dispatch('pointerenter', { pointerType: 'mouse' });
    assert.equal(harness.video.pauseCalls, 0);

    harness.video.paused = false;
    harness.video.dispatch('playing');
    assert.equal(harness.video.paused, true);
    assert.equal(harness.video.pauseCalls, 1);

    target.dispatch('pointerleave', { pointerType: 'mouse' });
    await Promise.resolve();
    assert.equal(harness.video.playCalls, 1);
  } finally {
    harness.restore();
  }
});
