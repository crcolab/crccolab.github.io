import { initSurveillanceHUD } from './animations/surveillance-hud.js';
import { initCyborgGlitch } from './animations/cyborg-glitch.js';

const HOME_SECTIONS = [
  { key: 'news',   zh: '最新訊息', en: 'Latest News',      href: '/news/'   },
  { key: 'events', zh: '活動',     en: 'Events',           href: '/events/' },
  { key: 'records', zh: '記錄/報導', en: 'As Seen on Media', href: '/records/'  },
];

async function loadNews(){
  const container = document.getElementById('news-list');
  if(!container) return;

  let data;
  try {
    const res = await fetch('/api/latest.json');
    if(!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch(e){
    container.innerHTML = HOME_SECTIONS.map(s =>
      `<p class="news__fallback"><a href="${s.href}">${escapeHtml(s.zh)} ${escapeHtml(s.en)} →</a></p>`
    ).join('');
    return;
  }

  container.innerHTML = HOME_SECTIONS.map(s => {
    const items = (data[s.key] || []).map(item => `
      <a class="crc-news crc-news--link" href="${escapeHtml(item.url)}">
        <div class="crc-news__meta">
          <span class="crc-news__date">${escapeHtml(item.date)}</span>
          <span class="crc-news__cat">${escapeHtml(item.category)}</span>
        </div>
        <div class="crc-news__row">
          <div>
            <h4 class="crc-news__title">${escapeHtml(item.title)}</h4>
            <p class="crc-news__excerpt">${escapeHtml(item.summary)}</p>
          </div>
          <span class="crc-news__arrow" aria-hidden="true">↗</span>
        </div>
      </a>`).join('');
    return `
      <div class="news__section">
        <div class="news__section-head">
          <h3 class="news__section-title">${escapeHtml(s.zh)} <span lang="en">${escapeHtml(s.en)}</span></h3>
          <a class="news__section-more" href="${s.href}">全部 View all →</a>
        </div>
        ${items}
      </div>`;
  }).join('');
}

export function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function initThemeToggle(){
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  const root = document.documentElement;
  const paint = () => { btn.textContent = root.classList.contains('theme-purple') ? '☀' : '◐'; };
  paint();
  btn.addEventListener('click', () => {
    root.classList.toggle('theme-purple');
    try { localStorage.setItem('crc-theme', root.classList.contains('theme-purple') ? 'purple' : 'light'); } catch(e){}
    paint();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  initSurveillanceHUD();
  initThemeToggle();
  initCyborgGlitch();
});
