/* WaziHub issue report form (client-side demo) */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('#report form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = 'WH-' + Date.now().toString(36).toUpperCase();
      var pending = JSON.parse(localStorage.getItem('wazi-reports') || '[]');
      var fd = new FormData(form);
      pending.push({
        id: id,
        project: fd.get('project'),
        location: fd.get('location'),
        issue: fd.get('issue'),
        details: fd.get('details'),
        phone: fd.get('phone'),
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('wazi-reports', JSON.stringify(pending));
      alert('Report saved locally. Tracking ID: ' + id + '\n(Will sync when server is connected.)');
      form.reset();
    });
  });
})();
