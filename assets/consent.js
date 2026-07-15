(function () {
  var copy = document.currentScript.dataset;
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
      'background:#161618;color:#ededf0;',
      'padding:14px 24px;',
      'display:flex;align-items:center;gap:18px;flex-wrap:wrap;',
      'font-family:"Noto Sans TC","Funnel Display",sans-serif;font-size:16px;',
      'border-top:3px solid #46288B;',
    '}',
    '#crc-consent-banner .crc-cb-text{flex:1;min-width:220px;line-height:1.65;}',
    '#crc-consent-banner .crc-cb-btns{display:flex;gap:10px;flex-shrink:0;}',
    '#crc-consent-banner .crc-btn-accept{',
      'background:#B7D32D;color:#46288B;border:2px solid #B7D32D;',
      'padding:8px 16px;border-radius:10px;cursor:pointer;min-height:44px;line-height:1.65;',
      'font-family:"Funnel Display","Noto Sans TC",sans-serif;font-weight:600;font-size:16px;',
    '}',
    '#crc-consent-banner .crc-btn-decline{',
      'background:transparent;color:#ededf0;border:1.5px solid #6c6c74;',
      'padding:9px 16px;border-radius:10px;cursor:pointer;min-height:44px;line-height:1.65;',
      'font-family:"Funnel Display","Noto Sans TC",sans-serif;font-weight:600;font-size:16px;',
    '}',
    '#crc-consent-banner .crc-btn-accept:hover{background:#9BB61E;border-color:#9BB61E;}',
    '#crc-consent-banner .crc-btn-decline:hover{border-color:#ededf0;}'
  ].join('');
  document.head.appendChild(style);

  // Build banner
  var banner = document.createElement('div');
  banner.id = 'crc-consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', copy.message);
  var message = document.createElement('div');
  message.className = 'crc-cb-text';
  message.textContent = copy.message;

  var buttons = document.createElement('div');
  buttons.className = 'crc-cb-btns';
  var accept = document.createElement('button');
  accept.className = 'crc-btn-accept';
  accept.type = 'button';
  accept.textContent = copy.accept;
  var reject = document.createElement('button');
  reject.className = 'crc-btn-decline';
  reject.type = 'button';
  reject.textContent = copy.reject;
  buttons.appendChild(accept);
  buttons.appendChild(reject);
  banner.appendChild(message);
  banner.appendChild(buttons);

  function dismiss(value) {
    localStorage.setItem(STORAGE_KEY, value);
    update(value);
    banner.remove();
  }

  accept.addEventListener('click', function () { dismiss('granted'); });
  reject.addEventListener('click', function () { dismiss('denied'); });

  document.body.appendChild(banner);
})();
