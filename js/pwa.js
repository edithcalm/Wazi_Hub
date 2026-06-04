/* WaziHub PWA: service worker + install prompt */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function (err) {
        console.warn('WaziHub SW registration failed:', err);
      });
    });
  }

  var deferredPrompt = null;
  var banner = document.getElementById('pwa-install');
  var installBtn = document.getElementById('pwa-install-btn');
  var dismissBtn = document.getElementById('pwa-dismiss');

  function showBanner() {
    if (!banner || localStorage.getItem('wazi-pwa-dismissed') === '1') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    banner.hidden = false;
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
  });

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) {
        alert('To install: use your browser menu → "Add to Home screen" or "Install app".');
        return;
      }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
        if (banner) banner.hidden = true;
      });
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', function () {
      localStorage.setItem('wazi-pwa-dismissed', '1');
      if (banner) banner.hidden = true;
    });
  }

  window.addEventListener('appinstalled', function () {
    if (banner) banner.hidden = true;
    deferredPrompt = null;
  });
})();
