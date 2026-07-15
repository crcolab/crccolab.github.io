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
