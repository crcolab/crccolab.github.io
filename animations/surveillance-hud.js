import { MEMBER_IDS, MEMBER_TRACKS } from './team-member-tracks.js';

const rectIsNormalized = (rect) => (
  rect
  && Number.isFinite(rect.x)
  && Number.isFinite(rect.y)
  && Number.isFinite(rect.width)
  && Number.isFinite(rect.height)
  && rect.x >= 0
  && rect.y >= 0
  && rect.width > 0
  && rect.height > 0
  && rect.x + rect.width <= 1
  && rect.y + rect.height <= 1
);

export function isValidMemberTrack(value) {
  if (!value || typeof value.id !== 'string' || !Array.isArray(value.segments)) return false;
  if (!value.segments.length) return false;

  return value.segments.every((segment) => {
    if (!Number.isFinite(segment.start) || !Number.isFinite(segment.end)) return false;
    if (segment.start >= segment.end || !Array.isArray(segment.keyframes)) return false;
    if (segment.keyframes.length < 2) return false;

    return segment.keyframes.every((frame, index) => {
      if (!Number.isFinite(frame.time) || !rectIsNormalized(frame.rect)) return false;
      if (frame.time < segment.start || frame.time >= segment.end) return false;
      if (index === 0) return frame.time === segment.start;

      const gap = frame.time - segment.keyframes[index - 1].time;
      return gap > 0 && gap <= 0.500001;
    });
  });
}

export function getTrackedRectAtTime(track, time) {
  if (!isValidMemberTrack(track) || !Number.isFinite(time)) return null;

  const segment = track.segments.find(
    (candidate) => time >= candidate.start && time < candidate.end,
  );
  if (!segment) return null;

  const frames = segment.keyframes;
  if (time <= frames[0].time) return { ...frames[0].rect };
  if (time >= frames.at(-1).time) return { ...frames.at(-1).rect };

  const rightIndex = frames.findIndex((frame) => frame.time >= time);
  const left = frames[rightIndex - 1];
  const right = frames[rightIndex];
  const progress = (time - left.time) / (right.time - left.time);

  return {
    x: left.rect.x + (right.rect.x - left.rect.x) * progress,
    y: left.rect.y + (right.rect.y - left.rect.y) * progress,
    width: left.rect.width + (right.rect.width - left.rect.width) * progress,
    height: left.rect.height + (right.rect.height - left.rect.height) * progress,
  };
}

export function computeCoverTransform(source, frame) {
  if (
    !source
    || !frame
    || source.width <= 0
    || source.height <= 0
    || frame.width <= 0
    || frame.height <= 0
  ) return null;

  const scale = Math.max(frame.width / source.width, frame.height / source.height);
  const renderedWidth = source.width * scale;
  const renderedHeight = source.height * scale;

  return {
    scale,
    renderedWidth,
    renderedHeight,
    offsetX: (frame.width - renderedWidth) / 2,
    offsetY: (frame.height - renderedHeight) / 2,
    frameWidth: frame.width,
    frameHeight: frame.height,
  };
}

export function mapNormalizedRect(rect, transform) {
  return {
    x: transform.offsetX + rect.x * transform.renderedWidth,
    y: transform.offsetY + rect.y * transform.renderedHeight,
    width: rect.width * transform.renderedWidth,
    height: rect.height * transform.renderedHeight,
  };
}

export function isMappedRectEligible(rect, frame) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return false;

  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const centerInside = (
    centerX >= 0
    && centerX <= frame.width
    && centerY >= 0
    && centerY <= frame.height
  );
  if (!centerInside) return false;

  const intersectionWidth = Math.max(
    0,
    Math.min(rect.x + rect.width, frame.width) - Math.max(rect.x, 0),
  );
  const intersectionHeight = Math.max(
    0,
    Math.min(rect.y + rect.height, frame.height) - Math.max(rect.y, 0),
  );
  const visibleArea = intersectionWidth * intersectionHeight;
  return visibleArea / (rect.width * rect.height) >= 0.5;
}

export function expandTouchRect(rect, minimumSize = 44) {
  const width = Math.max(rect.width, minimumSize);
  const height = Math.max(rect.height, minimumSize);
  return {
    x: rect.x - (width - rect.width) / 2,
    y: rect.y - (height - rect.height) / 2,
    width,
    height,
  };
}

const pointInRect = (point, rect) => (
  point.x >= rect.x
  && point.x <= rect.x + rect.width
  && point.y >= rect.y
  && point.y <= rect.y + rect.height
);

export function pickNearestTarget(point, candidates) {
  let winner = null;
  let winnerDistance = Infinity;

  for (const candidate of candidates) {
    if (!pointInRect(point, candidate.touchRect)) continue;

    const centerX = candidate.visualRect.x + candidate.visualRect.width / 2;
    const centerY = candidate.visualRect.y + candidate.visualRect.height / 2;
    const distance = (point.x - centerX) ** 2 + (point.y - centerY) ** 2;

    if (distance < winnerDistance) {
      winner = candidate.id;
      winnerDistance = distance;
    }
  }

  return winner;
}

const clamp = (value, minimum, maximum) => (
  Math.min(Math.max(value, minimum), maximum)
);

export function computePanelPlacement(
  anchor,
  panelSize,
  frameSize,
  gap = 12,
  inset = 8,
) {
  const verticalCenter = anchor.y + (anchor.height - panelSize.height) / 2;
  const horizontalCenter = anchor.x + (anchor.width - panelSize.width) / 2;
  const candidates = [
    {
      side: 'right',
      left: anchor.x + anchor.width + gap,
      top: verticalCenter,
    },
    {
      side: 'left',
      left: anchor.x - panelSize.width - gap,
      top: verticalCenter,
    },
    {
      side: 'below',
      left: horizontalCenter,
      top: anchor.y + anchor.height + gap,
    },
    {
      side: 'above',
      left: horizontalCenter,
      top: anchor.y - panelSize.height - gap,
    },
  ];

  const fits = (candidate) => (
    candidate.left >= inset
    && candidate.top >= inset
    && candidate.left + panelSize.width <= frameSize.width - inset
    && candidate.top + panelSize.height <= frameSize.height - inset
  );
  const selected = candidates.find(fits) || candidates[0];

  return {
    left: clamp(
      selected.left,
      inset,
      Math.max(inset, frameSize.width - panelSize.width - inset),
    ),
    top: clamp(
      selected.top,
      inset,
      Math.max(inset, frameSize.height - panelSize.height - inset),
    ),
    side: selected.side,
  };
}

export function shuffleMemberIds(ids, random = Math.random) {
  const shuffled = [...ids];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function takeNextVisibleMember(bag, visibleIds) {
  const remaining = [...bag];
  const index = remaining.findIndex((id) => visibleIds.has(id));
  if (index === -1) return { memberId: null, remaining };

  const [memberId] = remaining.splice(index, 1);
  return { memberId, remaining };
}

export function getTeaserDelay(random = Math.random) {
  return Math.min(5000, Math.floor(2500 + random() * 2501));
}

export function createPlaybackLease(video) {
  let ownsPause = false;

  return {
    pauseForInteraction() {
      if (ownsPause) {
        if (!video.paused && !video.ended) video.pause();
        return true;
      }
      ownsPause = !video.paused && !video.ended;
      if (ownsPause) video.pause();
      return ownsPause;
    },

    async resumeIfOwned(allowResume = true) {
      if (!ownsPause) return false;
      ownsPause = false;
      if (!allowResume) return false;

      try {
        await video.play();
        return true;
      } catch {
        return false;
      }
    },

    ownsPause() {
      return ownsPause;
    },
  };
}

export function initSurveillanceHUD() {
  const video = document.querySelector('.team__video');
  const hud = video?.closest('.crc-hud');
  const overlay = hud?.querySelector('[data-team-member-overlay]');
  const panel = overlay?.querySelector('[data-team-member-panel]');
  if (!video || !hud || !overlay || !panel) return;

  const panelFields = {
    nameZh: panel.querySelector('[data-panel-field="name-zh"]'),
    nameEn: panel.querySelector('[data-panel-field="name-en"]'),
    roleZh: panel.querySelector('[data-panel-field="role-zh"]'),
    roleEn: panel.querySelector('[data-panel-field="role-en"]'),
  };
  if (Object.values(panelFields).some((field) => !field)) return;

  const targets = new Map(
    [...overlay.querySelectorAll('.team-member-target')]
      .map((target) => [target.dataset.memberId, target]),
  );
  const roster = new Map();

  for (const id of MEMBER_IDS) {
    const entry = {
      nameZh: document.getElementById('team-member-' + id + '-name-zh'),
      nameEn: document.getElementById('team-member-' + id + '-name-en'),
      roleZh: document.getElementById('team-member-' + id + '-role-zh'),
      roleEn: document.getElementById('team-member-' + id + '-role-en'),
    };
    if (
      targets.has(id)
      && Object.values(entry).every(Boolean)
      && isValidMemberTrack(MEMBER_TRACKS[id])
    ) {
      roster.set(id, entry);
    } else {
      targets.get(id)?.setAttribute('disabled', '');
    }
  }

  const validIds = MEMBER_IDS.filter((id) => roster.has(id));
  if (!validIds.length) return;

  const layouts = new Map();
  const playback = createPlaybackLease(video);
  let transform = null;
  let frameHandle = null;
  let frameKind = null;
  let panelPlacementFrame = null;
  let activeId = null;
  let pointerId = null;
  let focusedId = null;
  let touchId = null;
  let started = false;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let teaserBag = [];
  let teaserWaitTimer = null;
  let teaserHideTimer = null;
  let teaserId = null;

  function rebuildTransform() {
    transform = computeCoverTransform(
      { width: video.videoWidth, height: video.videoHeight },
      { width: hud.clientWidth, height: hud.clientHeight },
    );
    return transform;
  }

  function disableTarget(id) {
    const target = targets.get(id);
    target.disabled = true;
    target.classList.remove('is-active');
    layouts.delete(id);
    if (pointerId === id) pointerId = null;
    if (focusedId === id) focusedId = null;
    if (touchId === id) touchId = null;
  }

  function setPanelContent(id) {
    const rosterEntry = roster.get(id);
    panelFields.nameZh.textContent = rosterEntry.nameZh.textContent.trim();
    panelFields.nameEn.textContent = rosterEntry.nameEn.textContent.trim();
    panelFields.roleZh.textContent = rosterEntry.roleZh.textContent.trim();
    panelFields.roleEn.textContent = rosterEntry.roleEn.textContent.trim();
  }

  function positionActivePanel() {
    if (!activeId || !layouts.has(activeId) || panel.hidden) return;
    if (panelPlacementFrame !== null) cancelAnimationFrame(panelPlacementFrame);

    panelPlacementFrame = requestAnimationFrame(() => {
      panelPlacementFrame = null;
      const layout = layouts.get(activeId);
      if (!layout || panel.hidden) return;

      const placement = computePanelPlacement(
        layout.visualRect,
        { width: panel.offsetWidth, height: panel.offsetHeight },
        { width: hud.clientWidth, height: hud.clientHeight },
      );
      panel.style.left = placement.left + 'px';
      panel.style.top = placement.top + 'px';
      panel.dataset.side = placement.side;
    });
  }

  function clearVisibleTeaser() {
    if (teaserHideTimer !== null) {
      clearTimeout(teaserHideTimer);
      teaserHideTimer = null;
    }
    if (teaserId) targets.get(teaserId)?.classList.remove('is-teasing');
    teaserId = null;
  }

  function cancelTeaserWait() {
    if (teaserWaitTimer === null) return;
    clearTimeout(teaserWaitTimer);
    teaserWaitTimer = null;
  }

  function suspendTeasers() {
    cancelTeaserWait();
    clearVisibleTeaser();
  }

  function teasersBlocked() {
    return (
      !started
      || motionQuery.matches
      || document.hidden
      || video.paused
      || video.ended
      || activeId !== null
    );
  }

  function scheduleTeaser() {
    cancelTeaserWait();
    if (teasersBlocked()) return;
    teaserWaitTimer = setTimeout(showNextTeaser, getTeaserDelay());
  }

  function showNextTeaser() {
    teaserWaitTimer = null;
    if (teasersBlocked()) return;

    if (!teaserBag.length) teaserBag = shuffleMemberIds(validIds);
    const selection = takeNextVisibleMember(teaserBag, new Set(layouts.keys()));
    teaserBag = selection.remaining;

    if (!selection.memberId) {
      scheduleTeaser();
      return;
    }

    clearVisibleTeaser();
    teaserId = selection.memberId;
    targets.get(teaserId).classList.add('is-teasing');
    teaserHideTimer = setTimeout(() => {
      teaserHideTimer = null;
      if (teaserId) targets.get(teaserId)?.classList.remove('is-teasing');
      teaserId = null;
    }, 700);
    scheduleTeaser();
  }

  function handleMotionPreferenceChange() {
    if (motionQuery.matches) {
      suspendTeasers();
    } else if (!video.paused && !activeId) {
      scheduleTeaser();
    }
  }

  function activateMember(id) {
    if (!layouts.has(id) || activeId === id) return;

    suspendTeasers();
    const switching = activeId !== null;
    if (!switching) playback.pauseForInteraction();

    if (activeId) targets.get(activeId).classList.remove('is-active');
    activeId = id;

    targets.get(id).classList.add('is-active');
    setPanelContent(id);
    panel.hidden = false;
    positionActivePanel();
  }

  function clearActiveMember() {
    if (!activeId) return false;

    targets.get(activeId)?.classList.remove('is-active');
    activeId = null;
    panel.hidden = true;
    delete panel.dataset.side;

    if (panelPlacementFrame !== null) {
      cancelAnimationFrame(panelPlacementFrame);
      panelPlacementFrame = null;
    }

    return true;
  }

  function dismissMember() {
    if (!clearActiveMember()) return;
    void playback.resumeIfOwned(!document.hidden);
    scheduleTeaser();
  }

  function clearInteractionState() {
    pointerId = null;
    focusedId = null;
    touchId = null;
  }

  function reconcileActiveMember() {
    const nextId = [touchId, focusedId, pointerId]
      .find((id) => id && layouts.has(id)) || null;

    if (!nextId) {
      dismissMember();
    } else if (nextId === activeId) {
      positionActivePanel();
    } else {
      activateMember(nextId);
    }
  }

  function renderAt(time = video.currentTime) {
    const currentTransform = transform || rebuildTransform();
    if (!currentTransform) return;

    const frameSize = {
      width: currentTransform.frameWidth,
      height: currentTransform.frameHeight,
    };

    for (const id of validIds) {
      const normalized = getTrackedRectAtTime(MEMBER_TRACKS[id], time);
      if (!normalized) {
        disableTarget(id);
        continue;
      }

      const visualRect = mapNormalizedRect(normalized, currentTransform);
      if (!isMappedRectEligible(visualRect, frameSize)) {
        disableTarget(id);
        continue;
      }

      const target = targets.get(id);
      target.disabled = false;
      target.style.left = visualRect.x + 'px';
      target.style.top = visualRect.y + 'px';
      target.style.width = visualRect.width + 'px';
      target.style.height = visualRect.height + 'px';
      layouts.set(id, {
        id,
        visualRect,
        touchRect: expandTouchRect(visualRect),
      });
    }

    reconcileActiveMember();
    if (teaserId && !layouts.has(teaserId)) clearVisibleTeaser();
  }

  function stopFrameLoop() {
    if (frameHandle === null) return;

    if (
      frameKind === 'video'
      && typeof video.cancelVideoFrameCallback === 'function'
    ) {
      video.cancelVideoFrameCallback(frameHandle);
    } else if (frameKind === 'raf') {
      cancelAnimationFrame(frameHandle);
    }

    frameHandle = null;
    frameKind = null;
  }

  function requestNextFrame() {
    if (frameHandle !== null || video.paused || document.hidden) return;

    if (typeof video.requestVideoFrameCallback === 'function') {
      frameKind = 'video';
      frameHandle = video.requestVideoFrameCallback(() => {
        frameHandle = null;
        frameKind = null;
        renderAt();
        requestNextFrame();
      });
    } else {
      frameKind = 'raf';
      frameHandle = requestAnimationFrame(() => {
        frameHandle = null;
        frameKind = null;
        renderAt();
        requestNextFrame();
      });
    }
  }

  function invalidateGeometry() {
    transform = null;
    renderAt();
  }

  function handlePlaying() {
    if (activeId) {
      suspendTeasers();
      playback.pauseForInteraction();
      return;
    }
    requestNextFrame();
    scheduleTeaser();
  }

  function handlePause() {
    suspendTeasers();
    stopFrameLoop();
    renderAt();
  }

  function handleSeeked() {
    renderAt();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      clearInteractionState();
      clearActiveMember();
      suspendTeasers();
      stopFrameLoop();
    } else {
      renderAt();
      if (playback.ownsPause()) {
        void playback.resumeIfOwned();
      } else if (!video.paused) {
        requestNextFrame();
        scheduleTeaser();
      }
    }
  }

  function handleDocumentKeydown(event) {
    if (event.key !== 'Escape' || !activeId) return;
    event.preventDefault();
    clearInteractionState();
    dismissMember();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function handleTouchPointerDown(event) {
    if (event.pointerType !== 'touch') return;

    const bounds = hud.getBoundingClientRect();
    const point = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
    const insideHud = (
      point.x >= 0
      && point.x <= bounds.width
      && point.y >= 0
      && point.y <= bounds.height
    );
    const selectedId = insideHud
      ? pickNearestTarget(point, [...layouts.values()])
      : null;

    if (selectedId) {
      event.preventDefault();
      if (activeId === selectedId) {
        clearInteractionState();
        dismissMember();
      } else {
        clearInteractionState();
        touchId = selectedId;
        reconcileActiveMember();
      }
    } else if (activeId) {
      clearInteractionState();
      dismissMember();
    }
  }

  for (const [id, target] of targets) {
    target.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return;
      touchId = null;
      pointerId = id;
      reconcileActiveMember();
    });
    target.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'touch' || pointerId !== id) return;
      pointerId = null;
      reconcileActiveMember();
    });
    target.addEventListener('focus', () => {
      touchId = null;
      focusedId = id;
      reconcileActiveMember();
    });
    target.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (focusedId !== id || document.activeElement === target) return;
        focusedId = null;
        reconcileActiveMember();
      });
    });
  }

  function start() {
    if (started || !video.videoWidth || !video.videoHeight) return;
    started = true;
    rebuildTransform();
    renderAt();
    overlay.hidden = false;
    if (!video.paused) {
      requestNextFrame();
      scheduleTeaser();
    }
  }

  const resizeObserver = new ResizeObserver(invalidateGeometry);
  resizeObserver.observe(hud);
  document.addEventListener('keydown', handleDocumentKeydown);
  document.addEventListener('pointerdown', handleTouchPointerDown, true);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('orientationchange', invalidateGeometry);
  motionQuery.addEventListener('change', handleMotionPreferenceChange);
  video.addEventListener('loadedmetadata', start);
  video.addEventListener('playing', handlePlaying);
  video.addEventListener('pause', handlePause);
  video.addEventListener('seeked', handleSeeked);

  if (video.readyState >= 1) start();
}
