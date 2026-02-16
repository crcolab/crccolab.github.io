async function loadNews(){
  const container = document.getElementById('news');
  if(!container) return;
  try{
    const res = await fetch('news.json', {cache:'no-store'});
    const data = await res.json();
    container.innerHTML = data.items.map(item => `
      <article class="card">
        <div class="meta">${escapeHtml(item.date)} · ${escapeHtml(item.category)}</div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.summary)}</p>
      </article>
    `).join('');
  }catch(e){
    container.innerHTML = `<div class="card"><h4>News</h4><p>Could not load news.json. If you're testing locally, use a simple server (see README).</p></div>`;
  }
}
function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  initSurveillanceHUD();
  initCyborgToggle();
});

function initCyborgToggle(){
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
      if(navEl) navEl.textContent = navEl.dataset.original;
    } else {
      isScrolled = false;
      navbar.classList.remove('visible');
      if(navEl) navEl.textContent = navEl.dataset.original;
    }
  });

  // Glitch effect helper — works on any element
  function setupGlitch(el, opts){
    let timer = null;
    let running = false;
    const shouldRun = opts.guard || (() => true);

    function schedule(){
      const delay = (Math.random() * 15 + 5) * 1000; // 5–20s
      timer = setTimeout(run, delay);
    }

    function run(){
      if(!shouldRun() || running){ schedule(); return; }
      running = true;

      // Phase 1: static blink
      el.classList.add('glitch');
      setTimeout(() => {
        el.classList.remove('glitch');

        // Phase 2: spray-paint "Cyber" with marker highlight
        el.textContent = el.dataset.alt;
        el.classList.add('spray', 'cyber-highlight');

        setTimeout(() => {
          el.classList.remove('spray');
          el.style.backgroundClip = '';
          el.style.webkitBackgroundClip = '';
          el.style.webkitTextFillColor = '';
          el.style.filter = '';
          el.style.background = '';
          // Re-add highlight since spray removal cleared inline styles
          el.classList.add('cyber-highlight');

          // Hold "Cyber" for a beat
          setTimeout(() => {
            // Phase 3: blink back to "Cyborg"
            el.classList.add('glitch');
            el.classList.remove('cyber-highlight');
            setTimeout(() => {
              el.classList.remove('glitch');
              el.textContent = el.dataset.original;
              el.classList.add('fade-back');
              setTimeout(() => {
                el.classList.remove('fade-back');
                running = false;
                schedule();
              }, 400);
            }, 500);
          }, 800);
        }, 600);
      }, 500);
    }

    schedule();

    // Hover trigger
    el.addEventListener('mouseenter', () => {
      if(!shouldRun() || running) return;
      clearTimeout(timer);
      run();
    });
  }

  // Hero element — always active (no guard)
  setupGlitch(heroEl, { guard: () => true });

  // Navbar element — only when scrolled past hero
  if(navEl){
    setupGlitch(navEl, { guard: () => isScrolled });
  }
}

function initSurveillanceHUD(){
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
