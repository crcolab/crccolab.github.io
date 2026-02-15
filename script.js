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
});

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
