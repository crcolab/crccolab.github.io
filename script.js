import { items } from './news/index.js';
import { initCyborgToggle } from './animations/cyborg-toggle.js';
import { initSurveillanceHUD } from './animations/surveillance-hud.js';
import { openNewsModal, initNewsModal } from './animations/news-modal.js';

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
export function escapeHtml(str){
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
  initNewsModal();
});
