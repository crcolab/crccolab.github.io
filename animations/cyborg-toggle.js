export function initCyborgToggle(){
  const heroEl = document.querySelector('.cyborg-text');
  const navEl = document.querySelector('.cyborg-text-nav');
  const hero = document.querySelector('.hero');
  const navbar = document.querySelector('.navbar');
  if(!heroEl || !hero || !navbar) return;

  let isScrolled = false;

  window.addEventListener('scroll', () => {
    const rect = heroEl.getBoundingClientRect();
    if(rect.bottom < 0){
      isScrolled = true;
      navbar.classList.add('visible');
    } else {
      isScrolled = false;
      navbar.classList.remove('visible');
    }
  });

  // Glitch effect helper — works on any element
  function setupGlitch(el, opts){
    let timer = null;
    let running = false;
    let done = false;
    const canStart = opts.guardStart || (() => true);

    function schedule(){
      if(done) return;
      const delay = (Math.random() * 15 + 5) * 1000; // 5–20s
      timer = setTimeout(run, delay);
    }

    function run(){
      if(done) return;
      if(running) return;
      if(!canStart()){ schedule(); return; }
      running = true;

      // Phase 1: static blink
      el.classList.add('glitch');
      setTimeout(() => {
        el.classList.remove('glitch');

        // Phase 2: spray-paint "Cyber" with marker highlight
        el.textContent = el.dataset.alt;
        el.classList.add('spray', 'cyber-font', 'cyber-highlight');

        setTimeout(() => {
          el.classList.remove('spray');
          el.style.backgroundClip = '';
          el.style.webkitBackgroundClip = '';
          el.style.webkitTextFillColor = '';
          el.style.filter = '';
          el.style.background = '';
          // Re-add highlight since spray removal cleared inline styles
          el.classList.add('cyber-highlight');

          // Hold "Cyber" for 10 seconds
          setTimeout(() => {
            // Phase 3: blink back to "Cyborg"
            el.classList.add('glitch');
            el.classList.remove('cyber-highlight');
            setTimeout(() => {
              el.classList.remove('glitch', 'cyber-font');
              el.textContent = el.dataset.original;
              el.classList.add('fade-back');
              setTimeout(() => {
                el.classList.remove('fade-back');
                running = false;
                done = false;
                schedule();
              }, 400);
            }, 500);
          }, 10000);
        }, 600);
      }, 500);
    }

    schedule();

    // Hover / touch trigger (disabled after sequence completes)
    const trigger = () => {
      if(done || !canStart() || running) return;
      clearTimeout(timer);
      run();
    };
    el.addEventListener('mouseenter', trigger);
    el.addEventListener('touchstart', trigger, {passive: true});
  }

  // Hero element — always active
  setupGlitch(heroEl, { guardStart: () => true });

  // Navbar element — only starts when scrolled past hero, but never interrupts mid-sequence
  if(navEl){
    setupGlitch(navEl, { guardStart: () => isScrolled });
  }
}
