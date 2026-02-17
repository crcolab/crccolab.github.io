import { escapeHtml } from '../script.js';

function formatDetail(text){
  // Escape HTML first, then apply formatting
  let safe = escapeHtml(text);
  // Newlines → line break
  safe = safe.split('\n').join('<br>');
  // URLs → clickable links
  safe = safe.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return safe;
}

export function openNewsModal(item){
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

export function initNewsModal(){
  const overlay = document.getElementById('news-modal');
  if(!overlay) return;
  overlay.querySelector('.modal__close').addEventListener('click', closeNewsModal);
  overlay.addEventListener('click', e => { if(e.target === overlay) closeNewsModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !overlay.hidden) closeNewsModal(); });
}
