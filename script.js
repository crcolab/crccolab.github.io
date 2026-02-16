import { items } from './news/index.js';

function loadNews(){
  const container = document.getElementById('news');
  if(!container) return;

  container.innerHTML = items.map((item, i) => `
    <article class="card"${item.detail ? ' data-has-detail data-index="'+i+'"' : ''}>
      <div class="meta">${escapeHtml(item.date)} · ${escapeHtml(item.category)}</div>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.summary)}</p>
    </article>
  `).join('');

  // Bind click → modal
  container.querySelectorAll('[data-has-detail]').forEach(card => {
    card.addEventListener('click', () => {
      const item = items[card.dataset.index];
      openNewsModal(item);
    });
  });
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

    // Hover trigger (disabled after sequence completes)
    el.addEventListener('mouseenter', () => {
      if(done || !canStart() || running) return;
      clearTimeout(timer);
      run();
    });
  }

  // Hero element — always active
  setupGlitch(heroEl, { guardStart: () => true });

  // Navbar element — only starts when scrolled past hero, but never interrupts mid-sequence
  if(navEl){
    setupGlitch(navEl, { guardStart: () => isScrolled });
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

/* ── News detail modal ── */
function formatDetail(text){
  // Escape HTML first, then apply formatting
  let safe = escapeHtml(text);
  // Newlines → line break
  safe = safe.split('\n').join('<br>');
  // URLs → clickable links
  safe = safe.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return safe;
}

function openNewsModal(item){
  const overlay = document.getElementById('news-modal');
  const img     = overlay.querySelector('.modal__img');
  const meta    = overlay.querySelector('.modal__meta');
  const title   = overlay.querySelector('.modal__title');
  const body    = overlay.querySelector('.modal__body');

  meta.textContent  = item.date + ' · ' + item.category;
  title.textContent = item.title;
  body.innerHTML = formatDetail(item.detail || item.summary);

  if(item.image){
    img.src = item.image;
    img.alt = item.title;
    img.hidden = false;
  } else {
    img.hidden = true;
  }

  overlay.removeAttribute('hidden');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeNewsModal(){
  const overlay = document.getElementById('news-modal');
  overlay.classList.remove('open');
  overlay.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('news-modal');
  if(!overlay) return;
  overlay.querySelector('.modal__close').addEventListener('click', closeNewsModal);
  overlay.addEventListener('click', e => { if(e.target === overlay) closeNewsModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !overlay.hidden) closeNewsModal(); });
});
