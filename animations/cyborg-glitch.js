// Cyborg↔cyber glitch scheduler. Port of the pre-redesign cyborg-toggle.js
// (git 7647d38) adapted to the split-mask wordmark.

const MOTION_QUERY = matchMedia('(prefers-reduced-motion: reduce)');

function scheduleGlitch(container, guard){
  let running = false;
  let autoTimer = null;
  const blinkTimers = [];

  function clearBlinks(){
    while(blinkTimers.length) clearTimeout(blinkTimers.pop());
  }

  function schedule(){
    const delay = (Math.random() * 15 + 5) * 1000; // 5–20s
    autoTimer = setTimeout(run, delay);
  }

  function run(){
    if(running){ schedule(); return; }
    if(!guard()){ schedule(); return; }
    running = true;

    // Phase 1: 0.5s static blink
    container.classList.add('glitch');
    setTimeout(() => {
      container.classList.remove('glitch');

      // Phase 2: swap to "cyber" with spray-in
      container.classList.add('cyber');

      // 2–5 random 150ms static blinks over the first ~9.5s of the hold
      const blinkCount = Math.floor(Math.random() * 4) + 2;
      for(let i = 0; i < blinkCount; i++){
        const at = Math.random() * 9500 + 200;
        blinkTimers.push(setTimeout(() => {
          container.classList.add('glitch');
          blinkTimers.push(setTimeout(() => container.classList.remove('glitch'), 150));
        }, at));
      }

      // Hold "cyber" for 10s
      setTimeout(() => {
        clearBlinks();
        // Phase 3: final 0.5s static blink → restore vector → 0.4s fade-back
        container.classList.add('glitch');
        setTimeout(() => {
          container.classList.remove('glitch', 'cyber');
          container.classList.add('fade-back');
          setTimeout(() => {
            container.classList.remove('fade-back');
            running = false;
            schedule();
          }, 400);
        }, 500);
      }, 10000);
    }, 500);
  }

  const trigger = () => {
    if(running || !guard()) return;
    clearTimeout(autoTimer);
    run();
  };
  container.addEventListener('mouseenter', trigger);
  container.addEventListener('touchstart', trigger, {passive: true});

  schedule();
}

export function initCyborgGlitch(){
  if(MOTION_QUERY.matches) return;

  const heroWord   = document.querySelector('.hero__logotypes .glitch-word');
  const headerWord = document.querySelector('.site-header__brand .glitch-word');
  const heroTitle  = document.querySelector('.hero__title');
  if(!heroWord) return; // no-op if the expected structure is absent

  // Header may only glitch while the hero title is out of view. Hero is always eligible;
  // this pairing guarantees the two instances never glitch in view simultaneously.
  let heroInView = true;
  if(heroTitle && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      for(const e of entries) heroInView = e.isIntersecting;
    }, { threshold: 0.01 });
    io.observe(heroTitle);
  }

  scheduleGlitch(heroWord, () => true);
  if(headerWord) scheduleGlitch(headerWord, () => !heroInView);
}
