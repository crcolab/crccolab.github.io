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
      if (ownsPause) return true;
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

export function initSurveillanceHUD(){
  const video = document.querySelector('.team__video');
  const targets = document.querySelectorAll('.face-target');
  if(!video || !targets.length) return;

  // Set CSS --delay from data-delay attribute
  targets.forEach(t => {
    t.style.setProperty('--delay', t.dataset.delay + 's');
  });

  function activateTargets(){
    targets.forEach(t => t.classList.add('pop-in'));
    // After all pop-ins finish, switch to idle pulse
    const maxDelay = Math.max(...[...targets].map(t => parseFloat(t.dataset.delay)));
    setTimeout(() => {
      targets.forEach(t => {
        t.classList.remove('pop-in');
        t.classList.add('active');
      });
    }, (maxDelay + 0.6) * 1000);
  }

  // Sync to video playback; fallback if autoplay blocked
  let activated = false;
  video.addEventListener('playing', () => {
    if(!activated){ activated = true; activateTargets(); }
  });
  setTimeout(() => {
    if(!activated){ activated = true; activateTargets(); }
  }, 2000);
}
