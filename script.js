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

  const allEls = navEl ? [heroEl, navEl] : [heroEl];
  let isScrolled = false;

  window.addEventListener('scroll', () => {
    const rect = heroEl.getBoundingClientRect();
    if(rect.bottom < 0){
      isScrolled = true;
      navbar.classList.add('visible');
      allEls.forEach(el => el.textContent = el.dataset.alt);
    } else {
      isScrolled = false;
      navbar.classList.remove('visible');
      allEls.forEach(el => el.textContent = el.dataset.original);
    }
  });

  allEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.textContent = el.dataset.alt;
    });
    el.addEventListener('mouseleave', () => {
      if(!isScrolled) el.textContent = el.dataset.original;
    });
  });

  // Random spray-paint glitch effect on navbar text
  if(navEl){
    let glitchTimer = null;
    let isGlitching = false;

    function scheduleGlitch(){
      const delay = (Math.random() * 15 + 5) * 1000; // 5–20 seconds
      glitchTimer = setTimeout(runGlitch, delay);
    }

    function runGlitch(){
      if(!isScrolled || isGlitching){ scheduleGlitch(); return; }
      isGlitching = true;

      // Phase 1: static blink (~0.5s)
      navEl.classList.add('glitch');
      setTimeout(() => {
        navEl.classList.remove('glitch');

        // Phase 2: spray-paint "Cyborg" (~0.6s)
        navEl.textContent = navEl.dataset.original;
        navEl.classList.add('spray');

        setTimeout(() => {
          navEl.classList.remove('spray');
          // Reset inline styles that background-clip may leave
          navEl.style.backgroundClip = '';
          navEl.style.webkitBackgroundClip = '';
          navEl.style.webkitTextFillColor = '';
          navEl.style.filter = '';
          navEl.style.background = '';

          // Hold "Cyborg" for a beat
          setTimeout(() => {
            // Phase 3: blink back to "Cyber"
            navEl.classList.add('glitch');
            setTimeout(() => {
              navEl.classList.remove('glitch');
              navEl.textContent = navEl.dataset.alt;
              navEl.classList.add('fade-back');
              setTimeout(() => {
                navEl.classList.remove('fade-back');
                isGlitching = false;
                scheduleGlitch();
              }, 400);
            }, 500);
          }, 800);
        }, 600);
      }, 500);
    }

    scheduleGlitch();
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
