/* WaziHub shared utilities */
(function (g) {
  'use strict';
  g.WaziHub = g.WaziHub || {};

  g.WaziHub.fmt = function (n) {
    if (n >= 1e12) return 'KSh ' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return 'KSh ' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return 'KSh ' + (n / 1e6).toFixed(2) + 'M';
    return 'KSh ' + n.toLocaleString();
  };

  g.WaziHub.escapeHtml = function (str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
