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
});
