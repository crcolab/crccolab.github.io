(function () {
  var STORAGE_KEY = 'crc-consent';

  function update(value) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: value,
        ad_storage: value,
        ad_user_data: value,
        ad_personalization: value
      });
    }
  }

  var stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'granted') { update('granted'); return; }
  if (stored === 'denied') { return; }

  // Inject banner styles
  var style = document.createElement('style');
  style.textContent = [
    '#crc-consent-banner{',
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;',
      'background:#1a2123;color:#fff;',
      'padding:16px 24px;',
      'display:flex;align-items:center;gap:16px;flex-wrap:wrap;',
      'font-family:"Space Grotesk","Noto Sans TC",sans-serif;font-size:14px;',
      'border-top:2px solid #5e17eb;',
    '}',
    '#crc-consent-banner .crc-cb-text{flex:1;min-width:220px;line-height:1.5;}',
    '#crc-consent-banner .crc-cb-text .en{display:block;font-family:monospace;font-size:12px;opacity:.65;margin-top:3px;}',
    '#crc-consent-banner .crc-cb-btns{display:flex;gap:10px;flex-shrink:0;}',
    '#crc-consent-banner .crc-btn-accept{',
      'background:#c1ff72;color:#1a2123;border:none;',
      'padding:8px 20px;border-radius:6px;cursor:pointer;',
      'font-weight:700;font-size:13px;font-family:inherit;',
    '}',
    '#crc-consent-banner .crc-btn-decline{',
      'background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.45);',
      'padding:8px 16px;border-radius:6px;cursor:pointer;',
      'font-size:13px;font-family:inherit;',
    '}',
    '#crc-consent-banner .crc-btn-accept:hover{background:#b0f050;}',
    '#crc-consent-banner .crc-btn-decline:hover{border-color:#fff;}'
  ].join('');
  document.head.appendChild(style);

  // Build banner
  var banner = document.createElement('div');
  banner.id = 'crc-consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = [
    '<div class="crc-cb-text">',
      '本站使用 Cookie 進行匿名流量分析（Google Analytics）。',
      '<span class="en">This site uses cookies for anonymous traffic analytics (Google Analytics).</span>',
    '</div>',
    '<div class="crc-cb-btns">',
      '<button class="crc-btn-accept">接受 Accept</button>',
      '<button class="crc-btn-decline">拒絕 Decline</button>',
    '</div>'
  ].join('');

  function dismiss(value) {
    localStorage.setItem(STORAGE_KEY, value);
    update(value);
    banner.remove();
  }

  banner.querySelector('.crc-btn-accept').addEventListener('click', function () { dismiss('granted'); });
  banner.querySelector('.crc-btn-decline').addEventListener('click', function () { dismiss('denied'); });

  document.body.appendChild(banner);
})();
