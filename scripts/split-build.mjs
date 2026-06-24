import fs from 'fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..');
const lines = fs.readFileSync(path.join(root, '_script_fragment.js'), 'utf8').split(/\r?\n/);
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let bodyHtml = '';
const bodyMatch = index.match(/<a href="#main" class="skip">[\s\S]*<\/main>/);
if (bodyMatch) {
  bodyHtml = bodyMatch[0];
} else {
  const legacy = index.match(/<body>([\s\S]*)<script>/);
  bodyHtml = legacy ? legacy[1].trim() : '';
  bodyHtml = bodyHtml.replace(/<div id="pwa-install"[\s\S]*?<\/nav>\s*/g, '');
}
bodyHtml = bodyHtml.replace(/<span id="year">/, '<span id="copyright-year">');

const slice = (from, to) => lines.slice(from, to + 1).join('\n');

const strBody = slice(12, 76).replace(/^\s*const STR = /, '').replace(/;\s*$/, '');
const sectorPalette = slice(97, 102).replace(/^\s*const sectorPalette = /, '').replace(/;\s*$/, '');
const baseData = slice(104, 119).replace(/^\s*const baseData = /, '').replace(/;\s*$/, '');
const yearMul = slice(122, 124).replace(/^\s*const yearMul = /, '').replace(/;\s*$/, '');
const countyScale = slice(127, 129).replace(/^\s*const countyScale = /, '').replace(/;\s*$/, '');
const projects = slice(273, 283).replace(/^\s*const projects = /, '').replace(/;\s*$/, '');
const topicLoc = slice(328, 345).replace(/^\s*const TOPIC_LOCATION = /, '').replace(/;\s*$/, '');

const demoBarazas = `[
  { id:1, title:"Community Sanitation Forum", county:"Nakuru", datetime:new Date(Date.now()+3600*1000).toISOString(), meeting_link:"https://meet.jit.si/WaziHub-demo-1", recording_link:"", upvotes:12, downvotes:3, host:"Public Health Dept.", participants:42, tags:["Health","Sanitation"], highlights: [] },
  { id:2, title:"Ward Education Baraza", county:"Kiambu", datetime:new Date(Date.now()+48*3600*1000).toISOString(), meeting_link:"https://meet.jit.si/WaziHub-demo-2", recording_link:"https://example.com/recording.mp4", upvotes:8, downvotes:1, host:"Ward Office", participants:18, tags:["Education","Budget"], highlights: [] },
  { id:3, title:"Kisumu Water Update", county:"Kisumu", datetime:new Date(Date.now()-26*3600*1000).toISOString(), meeting_link:"https://example.com/live-not-embed", recording_link:"https://example.com/water.mp4", upvotes:25, downvotes:2, host:"Water Board", participants:120, tags:["Water","Projects"], highlights: [
    { id:"h1", text:"Contractor committed to clear drainage by next week.", up:15, down:2 },
    { id:"h2", text:"Budget reallocation of KSh 10M to flood-prone wards.", up:22, down:1 },
    { id:"h3", text:"Community to share geotagged photos via WhatsApp line.", up:8, down:0 }
  ] }
]`;

const wrap = (name, expr) =>
  `/* WaziHub ${name} */\n(function (g) {\n  g.WaziData = g.WaziData || {};\n  g.WaziData.${name} = ${expr};\n})(typeof window !== 'undefined' ? window : globalThis);\n`;

fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/i18n.js'), wrap('STR', strBody));
fs.writeFileSync(
  path.join(root, 'data/budget.js'),
  wrap('sectorPalette', sectorPalette) +
    `(function (g) {\n  g.WaziData.baseData = ${baseData};\n  g.WaziData.yearMul = ${yearMul};\n  g.WaziData.countyScale = ${countyScale};\n})(typeof window !== 'undefined' ? window : globalThis);\n`
);
fs.writeFileSync(path.join(root, 'data/projects.js'), wrap('projects', projects));
fs.writeFileSync(
  path.join(root, 'data/barazas-demo.js'),
  wrap('TOPIC_LOCATION', topicLoc) +
    `(function (g) {\n  g.WaziData.getDemoBarazas = function () { return ${demoBarazas}; };\n})(typeof window !== 'undefined' ? window : globalThis);\n`
);

let main = slice(131, lines.length - 1);
main = main
  .replace(/  const projects = \[[\s\S]*?\];\n\n/, '')
  .replace(/  const TOPIC_LOCATION = \{[\s\S]*?\};\n\n/, '')
  .replace(/\n\s*function escapeHtml\(str\)\{[\s\S]*?\n\s*\}\s*$/, '\n')
  .replace(/\bfmt\(/g, 'WaziHub.fmt(')
  .replace(/(?<!function )escapeHtml\(/g, 'WaziHub.escapeHtml(')
  .replace(/getElementById\('year'\)\.value/g, "getElementById('budget-year').value")
  .replace(/\bTOPIC_LOCATION\b/g, 'WaziData.TOPIC_LOCATION')
  .replace(
    /catch \{\s*\/\/ Fallback demo data[\s\S]*?renderBarazas\(applyBarazaFilters\(\)\);\s*\}/,
    'catch {\n      barazaList = enrichBarazas(WaziData.getDemoBarazas());\n      renderBarazas(applyBarazaFilters());\n    }'
  );

main = `/* WaziHub application logic */\n(function () {\n  'use strict';\n  const WaziData = window.WaziData;\n  const WaziHub = window.WaziHub;\n  const sectorPalette = WaziData.sectorPalette;\n  const baseData = WaziData.baseData;\n  const yearMul = WaziData.yearMul;\n  const countyScale = WaziData.countyScale;\n  const projects = WaziData.projects;\n\n${main}\n})();\n`;

fs.writeFileSync(path.join(root, 'js/main.js'), main);

const pwaBanner = `
<div id="pwa-install" class="pwa-install" hidden role="region" aria-label="Install app">
  <div class="pwa-install-inner">
    <span class="pwa-install-text">Install WaziHub on your phone for quick access.</span>
    <button type="button" class="btn pwa-install-btn" id="pwa-install-btn">Install</button>
    <button type="button" class="pwa-dismiss" id="pwa-dismiss" aria-label="Dismiss">✕</button>
  </div>
</div>
<nav class="mobile-nav" aria-label="Mobile shortcuts">
  <a href="#home"><span aria-hidden="true">🏠</span><small>Home</small></a>
  <a href="#budget-tracker"><span aria-hidden="true">📊</span><small>Budgets</small></a>
  <a href="#projects"><span aria-hidden="true">🏗</span><small>Projects</small></a>
  <a href="#barazas-section"><span aria-hidden="true">🗣</span><small>Barazas</small></a>
  <a href="#report"><span aria-hidden="true">🚨</span><small>Report</small></a>
</nav>
`;

const newIndex = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Wazi Hub — See More. Know More. Do More.</title>
<meta name="description" content="Wazi Hub: Kenya Public Finance & Projects Dashboard — budget transparency, contracting openness, project tracking, and citizen feedback." />
<meta name="author" content="Wazi Hub" />
<meta name="theme-color" content="#00853F" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="WaziHub" />
<link rel="manifest" href="manifest.json" />
<link rel="icon" href="icons/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="icons/icon.svg" />
<link rel="stylesheet" href="css/styles.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js" defer></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" defer crossorigin=""></script>
</head>
<body>
${pwaBanner}
${bodyHtml}
<script src="data/i18n.js"></script>
<script src="data/budget.js"></script>
<script src="data/projects.js"></script>
<script src="data/barazas-demo.js"></script>
<script src="js/utils.js"></script>
<script src="js/i18n.js"></script>
<script src="js/report.js"></script>
<script src="js/main.js" defer></script>
<script src="js/pwa.js" defer></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
  var y = document.getElementById('copyright-year');
  if (y) y.textContent = new Date().getFullYear();
  if (window.WaziHub && WaziHub.initI18n) WaziHub.initI18n();
});
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), newIndex);
console.log('Split complete.');
