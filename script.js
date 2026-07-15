import { initSurveillanceHUD } from './animations/surveillance-hud.js';

export function readHomeConfig(container) {
  const apiUrl = container?.dataset.apiUrl || '/api/latest.json';
  let sections = [];
  try { sections = JSON.parse(container?.dataset.sections || '[]'); } catch { sections = []; }
  return { apiUrl, sections };
}

export async function loadNews(){
  const container = document.getElementById('news-list');
  if(!container) return;
  const { apiUrl, sections } = readHomeConfig(container);

  let data;
  try {
    const response = await fetch(apiUrl);
    if(!response.ok) throw new Error(String(response.status));
    data = await response.json();
  } catch {
    container.innerHTML = sections.map(section =>
      `<p class="news__fallback"><a href="${section.href}">${escapeHtml(section.label)} →</a></p>`
    ).join('');
    return;
  }

  container.innerHTML = sections.map(section => {
    const items = (data[section.key] || []).map(item => `<a class="crc-news crc-news--link" href="${escapeHtml(item.url)}"><div class="crc-news__meta"><span class="crc-news__date">${escapeHtml(item.date)}</span><span class="crc-news__cat">${escapeHtml(item.category)}</span></div><div class="crc-news__row"><div><h4 class="crc-news__title">${escapeHtml(item.title)}</h4><p class="crc-news__excerpt">${escapeHtml(item.summary)}</p></div><span class="crc-news__arrow" aria-hidden="true">↗</span></div></a>`).join('');
    return `<section class="news__section"><div class="news__section-head"><h3 class="news__section-title">${escapeHtml(section.label)}</h3><a class="news__section-more" href="${section.href}">${escapeHtml(section.viewAll)} →</a></div>${items}</section>`;
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

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    initSurveillanceHUD();
    initThemeToggle();
    import('./animations/cyborg-glitch.js').then(({ initCyborgGlitch }) => initCyborgGlitch());
  });
}
