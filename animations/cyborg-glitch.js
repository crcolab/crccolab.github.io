// Cyborg ↔ cyber TV-static glitch on the wordmark.
// Port of the pre-redesign animations/cyborg-toggle.js (see git 7647d38).
// Applied to every .glitch-word instance in the page; header instance is
// guarded by an IntersectionObserver on the hero title so the two
// wordmarks never glitch on-screen at the same time.

export function initCyborgGlitch(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = document.querySelectorAll('.glitch-word');
  if (!words.length) return;

  // Header guard: header .glitch-word only starts a new sequence while the
  // hero title is scrolled out of view. A running sequence is never cut off.
  const heroTitle = document.querySelector('.hero__title');
  let heroInView = true;
  if (heroTitle && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) heroInView = e.isIntersecting;
    }, { threshold: 0 });
    io.observe(heroTitle);
  }

  words.forEach((el) => {
    const isHeader = !!el.closest('.site-header');
    const canStart = isHeader ? () => !heroInView : () => true;
    scheduleOn(el, canStart);
  });
}

function scheduleOn(el, canStart){
  let timer = null;
  let running = false;

  function schedule(){
    const delay = (Math.random() * 15 + 5) * 1000; // 5–20 s
    timer = setTimeout(run, delay);
  }

  function run(){
    if (running) return;
    if (!canStart()){ schedule(); return; }
    running = true;

    // Phase 1: TV-static blink 0.5 s
    el.classList.add('glitch');
    setTimeout(() => {
      el.classList.remove('glitch');

      // Phase 2: enter cyber (sprayIn 0.6 s) → mark as settled to freeze the alt
      el.classList.add('cyber');
      setTimeout(() => {
        el.classList.add('settled');

        // Random 150 ms static blinks during the 10 s hold
        const blinkCount = Math.floor(Math.random() * 4) + 2; // 2–5
        const blinkTimers = [];
        for (let i = 0; i < blinkCount; i++){
          const t = Math.random() * 9500 + 200;
          blinkTimers.push(setTimeout(() => {
            el.classList.add('glitch');
            setTimeout(() => el.classList.remove('glitch'), 150);
          }, t));
        }

        // Phase 3 (after 10 s hold): blink → restore
        setTimeout(() => {
          blinkTimers.forEach(clearTimeout);
          el.classList.add('glitch');
          setTimeout(() => {
            el.classList.remove('glitch', 'cyber', 'settled');
            el.classList.add('fade-back');
            setTimeout(() => {
              el.classList.remove('fade-back');
              running = false;
              schedule();
            }, 400);
          }, 500);
        }, 10000);
      }, 600);
    }, 500);
  }

  schedule();

  const trigger = () => {
    if (running || !canStart()) return;
    clearTimeout(timer);
    run();
  };
  el.addEventListener('mouseenter', trigger);
  el.addEventListener('touchstart', trigger, { passive: true });
}
