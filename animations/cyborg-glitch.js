// Cyborg↔cyber glitch scheduler. Port of the pre-redesign cyborg-toggle.js
// (git 7647d38) adapted to the split-mask wordmark.

const MOTION_QUERY = matchMedia('(prefers-reduced-motion: reduce)');

// Timeline (all in ms). Total sequence = PHASE_1 + SPRAY_IN + HOLD + PHASE_3_STATIC + PHASE_3_FADE = 12000.
const PHASE_1        = 500;    // opening static blink
const SPRAY_IN       = 600;    // .cyber spray-in animation (matches sprayIn keyframe)
const HOLD           = 10000;  // .cyber hold, begins AFTER spray-in completes
const PHASE_3_STATIC = 500;    // final static blink
const PHASE_3_FADE   = 400;    // fade-back cleanup (matches cyborgFadeBack keyframe)
const BLINK_LEN      = 150;    // duration of each random glitch blink during hold
const BLINK_BUFFER   = 200;    // guard around blink window edges to avoid abutting phase boundaries
const AUTO_MIN       = 5000;   // auto-fire minimum delay
const AUTO_MAX       = 20000;  // auto-fire maximum delay

// Every scheduleGlitch() instance registers its abort() here so the module-level
// motion-query listener can cancel all in-flight sequences at once.
const abortHandles = new Set();

function scheduleGlitch(container, guard){
  let running = false;
  let autoTimer = null;
  const timers = new Set();

  function later(fn, ms){
    const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
    timers.add(t);
    return t;
  }

  function clearAll(){
    if(autoTimer !== null){ clearTimeout(autoTimer); autoTimer = null; }
    for(const t of timers) clearTimeout(t);
    timers.clear();
  }

  function abort(){
    if(!running) return;
    clearAll();
    container.classList.remove('glitch', 'cyber', 'fade-back');
    running = false;
    schedule();
  }
  abortHandles.add(abort);

  function schedule(){
    if(MOTION_QUERY.matches) return;
    const delay = Math.random() * (AUTO_MAX - AUTO_MIN) + AUTO_MIN;
    autoTimer = setTimeout(() => { autoTimer = null; run(); }, delay);
  }

  function run(){
    if(running){ schedule(); return; }
    if(!guard() || MOTION_QUERY.matches){ schedule(); return; }
    running = true;

    // Phase 1: opening static blink
    container.classList.add('glitch');
    later(() => {
      container.classList.remove('glitch');

      // Phase 2: swap to .cyber (CSS runs the 0.6s spray-in animation)
      container.classList.add('cyber');

      // 2–5 random 150ms static blinks, scheduled within the HOLD window
      // (i.e. AFTER the spray-in completes), leaving a small buffer at each edge.
      const blinkCount = Math.floor(Math.random() * 4) + 2;
      const blinkSpan = HOLD - BLINK_LEN - 2 * BLINK_BUFFER;
      for(let i = 0; i < blinkCount; i++){
        const at = SPRAY_IN + BLINK_BUFFER + Math.random() * blinkSpan;
        later(() => {
          container.classList.add('glitch');
          later(() => container.classList.remove('glitch'), BLINK_LEN);
        }, at);
      }

      // Phase 3: fires HOLD ms after spray-in completes
      later(() => {
        // Belt-and-braces: any in-flight blink whose remove-timer was cancelled
        // by clearAll() (unreachable in normal flow, but survives abort/re-run
        // races) would leave .glitch stuck. Force a clean baseline first.
        container.classList.remove('glitch');
        container.classList.add('glitch');
        later(() => {
          container.classList.remove('glitch', 'cyber');
          container.classList.add('fade-back');
          later(() => {
            container.classList.remove('fade-back');
            running = false;
            schedule();
          }, PHASE_3_FADE);
        }, PHASE_3_STATIC);
      }, SPRAY_IN + HOLD);
    }, PHASE_1);
  }

  const trigger = () => {
    if(running || !guard() || MOTION_QUERY.matches) return;
    if(autoTimer !== null){ clearTimeout(autoTimer); autoTimer = null; }
    run();
  };
  container.addEventListener('mouseenter', trigger);
  container.addEventListener('touchstart', trigger, {passive: true});

  schedule();
  return abort;
}

export function initCyborgGlitch(){
  if(MOTION_QUERY.matches) return;

  const heroWord   = document.querySelector('.hero__logotypes .glitch-word');
  const headerWord = document.querySelector('.site-header__brand .glitch-word');
  const heroTitle  = document.querySelector('.hero__title');
  if(!heroWord) return;

  // Header may only glitch while the hero title is out of view. Hero is always eligible;
  // this pairing guarantees the two instances never glitch in view simultaneously.
  let heroInView = true;
  scheduleGlitch(heroWord, () => true);
  const headerAbort = headerWord ? scheduleGlitch(headerWord, () => !heroInView) : null;

  if(heroTitle && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      for(const e of entries){
        const wasInView = heroInView;
        heroInView = e.isIntersecting;
        // Level-triggered guard: cancel a header sequence the moment the hero re-enters view.
        if(!wasInView && heroInView && headerAbort) headerAbort();
      }
    }, { threshold: 0.01 });
    io.observe(heroTitle);
  }

  // React to prefers-reduced-motion flipping mid-session by aborting everything.
  MOTION_QUERY.addEventListener?.('change', () => {
    if(MOTION_QUERY.matches) for(const abort of abortHandles) abort();
  });
}
