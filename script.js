import { items } from './news/index.js';
import { initSurveillanceHUD } from './animations/surveillance-hud.js';
import { openNewsModal, initNewsModal } from './animations/news-modal.js';
import { initCyborgGlitch } from './animations/cyborg-glitch.js';

function loadNews(){
  const container = document.getElementById('news-list');
  if(!container) return;

  container.innerHTML = items.map((item, i) => `
    <article class="crc-news"${item.detail ? ' data-has-detail data-index="'+i+'" tabindex="0" role="button"' : ''}>
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
    </article>
  `).join('');

  // Bind click / keyboard → modal
  container.querySelectorAll('[data-has-detail]').forEach(card => {
    const open = () => openNewsModal(items[card.dataset.index]);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); }
    });
  });
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
  initNewsModal();
  initThemeToggle();
  initCyborgGlitch();
});
