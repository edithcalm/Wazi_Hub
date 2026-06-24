/* WaziHub i18n */
(function () {
  'use strict';
  const STR = window.WaziData.STR;
  function translateContent(lang) {
    const dict = STR[lang] || STR.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    localStorage.setItem('wazi-lang', lang);
  }
  window.WaziHub = window.WaziHub || {};
  window.WaziHub.translateContent = translateContent;
  window.WaziHub.initI18n = function () {
    const storedLang = localStorage.getItem('wazi-lang') || 'en';
    const sel = document.getElementById('language-select');
    if (sel) sel.value = storedLang;
    translateContent(storedLang);
    document.getElementById('apply-lang')?.addEventListener('click', () => {
      translateContent(document.getElementById('language-select').value);
    });
  };
})();
