export function initSurveillanceHUD(){
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
