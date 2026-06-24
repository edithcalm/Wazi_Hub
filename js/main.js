/* WaziHub application logic */
(function () {
  'use strict';
  const WaziData = window.WaziData;
  const WaziHub = window.WaziHub;
  const projects = WaziData.projects;

  // Budget charts: see js/budget-intelligence.js

  // ===== MAP: INTERACTIVE PROJECT PINS =====
  const mapEl = document.getElementById('map');
  if (mapEl && typeof L !== 'undefined') {

  const sectorColors = {
    'Ministry of Interior and National Administration': '#073b4c',
    'Ministry of National Treasury and Economic Planning': '#6b7280',
    'Ministry of Foreign and Diaspora Affairs': '#3a86c8',
    'Ministry of Defence': '#991b1b',
    'Ministry of Health': '#ff6b35',
    'Ministry of Education': '#f7931e',
    'Ministry of Energy and Petroleum': '#d97706',
    'Ministry of Agriculture and Livestock Development': '#16a34a',
    'Ministry of Information, Communication and the Digital Economy': '#0891b2',
    'Ministry of Lands, Public Works, Housing and Urban Development': '#7209b7',
    'Ministry of Roads and Transport': '#2b6cb0',
    'Ministry of Co-operatives and Micro, Small and Medium Enterprises (MSMEs)': '#f59e0b',
    'Ministry of Tourism and Wildlife': '#a16207',
    'Ministry of Mining, Blue Economy and Maritime Affairs': '#0f766e',
    'Ministry of Youth Affairs, Creative Economy and Sports': '#ec4899',
    'Ministry of Water, Sanitation and Irrigation': '#06b6d4',
    'Ministry of Investments, Trade and Industry': '#dc2626',
    'Ministry of Labour and Social Protection': '#d946ef',
    'Ministry of Public Service and Human Capital Development': '#4b5563',
    'Ministry of Environment, Climate Change and Forestry': '#15803d',
    'Ministry of Gender, Culture, the Arts and Heritage': '#be185d',
    'Ministry of East African Community (EAC), Arid and Semi-Arid Lands (ASALs) and Regional Development': '#4338ca',
    // Fallbacks
    'Health':            '#ff6b35',
    'Transport':         '#2b6cb0',
    'Roads':             '#2b6cb0',
    'Water & Sanitation':'#06b6d4',
    'Energy':            '#d97706',
    'Agriculture':       '#16a34a',
    'Education':         '#f7931e',
    'Governance':        '#4b5563',
    'default':           '#00853F'
  };

  function makeMarkerIcon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="#fff"/>
    </svg>`;
    return L.divIcon({
      html: svg,
      className: '',
      iconSize: [28, 36],
      iconAnchor: [14, 36],
      popupAnchor: [0, -36]
    });
  }

  // Map centered on Kenya
  const map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([0.5, 37.5], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  projects.forEach(p => {
    const color = sectorColors[p.sector] || sectorColors.default;
    const pct = p.progress;
    const statusColor = p.status === 'Awarded' ? '#9c1c1c' : '#0c7a43';
    const popup = `
      <div style="min-width:190px;font-family:system-ui,sans-serif;">
        <div style="font-weight:800;font-size:1rem;margin-bottom:2px;">${p.name}</div>
        <div style="color:#555;font-size:.85rem;margin-bottom:6px;">${p.sector} &bull; ${p.county}</div>
        <div style="font-size:.85rem;margin-bottom:4px;">
          <strong>Budget:</strong> ${WaziHub.fmt(p.budget)}<br/>
          <strong>Spent:</strong> ${WaziHub.fmt(p.spent)}
        </div>
        <div style="margin-bottom:6px;">
          <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:.75rem;font-weight:700;background:${statusColor}1a;color:${statusColor};">${p.status}</span>
        </div>
        <div style="font-size:.82rem;margin-bottom:3px;"><strong>Completion: ${pct}%</strong></div>
        <div style="background:#e5e7eb;border-radius:999px;height:8px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:999px;"></div>
        </div>
      </div>
    `;
    L.marker([p.lat, p.lng], { icon: makeMarkerIcon(color) })
      .addTo(map)
      .bindPopup(popup, { maxWidth: 240 });
  });

  // Scroll-wheel zoom only when focused on the map
  mapEl.addEventListener('mouseenter', () => map.scrollWheelZoom.enable());
  mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

  } // end map block

  // ===== BARAZA LIST & MODAL =====
  const API_BASE = '/api';
  const BARAZAS_ENDPOINT = `${API_BASE}/barazas`;
  const VOTE_ENDPOINT = (id) => `${API_BASE}/barazas/${id}/vote`;

  const barazaContainer = document.getElementById('baraza-container');
  const overlay = document.getElementById('baraza-overlay');
  const modalIframe = document.getElementById('modal-iframe');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const copyLinkBtn = document.getElementById('copy-link');
  const modalClose = document.getElementById('modal-close');
  const bzSearch = document.getElementById('bz-search');
  const bzCounty = document.getElementById('bz-county');
  const bzFrom = document.getElementById('bz-from');
  const bzTo = document.getElementById('bz-to');
  const bzSort = document.getElementById('bz-sort');
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  let activeTab = 'upcoming';
  let barazaList = [];

  // Topic -> recognizable venue mapping (expanded as needed)
  function pickLocation(county, tags){
    const tagList = Array.isArray(tags) ? tags : [];
    for(const t of tagList){
      const key = String(t||'').trim();
      if(WaziData.TOPIC_LOCATION[key]) return `${county} ${WaziData.TOPIC_LOCATION[key]}`;
    }
    return `${county} ${WaziData.TOPIC_LOCATION.default}`;
  }

  async function loadBarazas(){
    try {
      const res = await fetch(BARAZAS_ENDPOINT);
      if(!res.ok) throw new Error();
      const data = await res.json();
      renderBarazas(data);
      barazaList = enrichBarazas(data);
      renderBarazas(applyBarazaFilters());
    } catch {
      barazaList = enrichBarazas(WaziData.getDemoBarazas());
      renderBarazas(applyBarazaFilters());
    }
  }

  function enrichBarazas(data){
    return data.map((b)=>{
      const tags = Array.isArray(b.tags) ? b.tags : [];
      const county = b.county || '';
      const location = b.location || pickLocation(county, tags);
      return {
        ...b,
        tz: b.tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
        popularity: (b.upvotes||0) - (b.downvotes||0) + (b.participants||0)/50,
        tags,
        host: b.host || 'Organizer',
        participants: Number.isFinite(b.participants) ? b.participants : Math.floor(20+Math.random()*80),
        location
      };
    });
  }

  function applyBarazaFilters(){
    const q = (bzSearch?.value||'').trim().toLowerCase();
    const c = (bzCounty?.value||'').trim().toLowerCase();
    const from = bzFrom?.value ? new Date(bzFrom.value).getTime() : -Infinity;
    const to = bzTo?.value ? new Date(bzTo.value).getTime()+24*3600*1000-1 : Infinity;
    const now = Date.now();
    let list = barazaList.filter(b=>{
      const t = new Date(b.datetime).getTime();
      if(activeTab==='upcoming' && t < now) return false;
      if(activeTab==='past' && t >= now) return false;
      if(c && (b.county||'').toLowerCase() !== c) return false;
      if(!(t>=from && t<=to)) return false;
      if(q){
        const hay = [b.title,b.host,b.county,(b.tags||[]).join(' ')].join(' ').toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });
    const sortBy = bzSort?.value || 'time';
    list.sort((a,b)=>{
      if(sortBy==='popularity') return (b.popularity||0) - (a.popularity||0);
      return new Date(a.datetime) - new Date(b.datetime);
    });
    return list;
  }

  function formatRelative(dt){
    const d = new Date(dt).getTime();
    const now = Date.now();
    const diff = d - now;
    const abs = Math.abs(diff);
    const rtf = new Intl.RelativeTimeFormat(undefined,{numeric:'auto'});
    const units = [
      ['day', 86400000],
      ['hour', 3600000],
      ['minute', 60000]
    ];
    for(const [unit, ms] of units){
      if(abs >= ms || unit==='minute'){
        return rtf.format(Math.round(diff/ms), unit);
      }
    }
  }

  // Live countdown update every 30s
  setInterval(()=>{
    document.querySelectorAll('#baraza-container .baraza-item').forEach(item=>{
      const id = item.dataset.id;
      const b = barazaList.find(x=>String(x.id)===String(id));
      if(!b) return;
      const line = item.querySelector('.baraza-datetime span');
      if(line) line.textContent = formatRelative(b.datetime);
      const meta = item.querySelector('.baraza-datetime');
      if(meta){
        const badges = getBadges(b.datetime);
        meta.innerHTML = meta.innerHTML.replace(/<(span class=\"badge-(live|soon)\")[\s\S]*?span>/g,'');
        meta.insertAdjacentHTML('beforeend', ' ' + badges);
      }
    });
  }, 30000);

  function getBadges(dt){
    const start = new Date(dt).getTime();
    const now = Date.now();
    const diff = start - now;
    if(diff <= 0 && diff > -2*3600*1000){
      return '<span class="badge-live">LIVE</span>';
    }
    if(diff > 0 && diff < 30*60*1000){
      return '<span class="badge-soon">Starting soon</span>';
    }
    return '';
  }

  function renderBarazas(list){
    barazaContainer.innerHTML = '';
    list.forEach(b => {
      const item = document.createElement('div');
      item.className = 'baraza-item card';
      const when = new Date(b.datetime).toLocaleString();
      const rel = formatRelative(b.datetime);
      const badges = getBadges(b.datetime);
      const tags = (b.tags||[]).map(t=>`<span class="chip">#${t}</span>`).join(' ');
      const isPast = new Date(b.datetime).getTime() < Date.now();
       const rec = '';
      const upcomingCtas = `
            <button class="small-btn primary" data-action="join" data-id="${b.id}">Join</button>
            ${rec}
            <button class="small-btn" data-action="rsvp" data-id="${b.id}">RSVP</button>
            <button class="small-btn" data-action="calendar" data-id="${b.id}">Add to Calendar</button>
            <button class="small-btn" data-action="remind" data-id="${b.id}">Remind Me</button>`;
       const pastCtas = ``;
      const highlights = isPast ? renderHighlights(b) : '';
      item.innerHTML = `
        <div class="baraza-meta">
          <div class="baraza-info">
            <div class="baraza-title">${WaziHub.escapeHtml(b.title)}</div>
            <div class="baraza-datetime">${when} • ${WaziHub.escapeHtml(b.county)} • <span>${rel}</span> ${badges}</div>
            <div class="baraza-line2">
              <span class="chip">Host: ${WaziHub.escapeHtml(b.host)}</span>
              <span class="chip">👥 ${b.participants}</span>
              <span class="chip">Location: ${WaziHub.escapeHtml(b.location||'Venue TBC')}</span>
              ${tags}
            </div>
          </div>
          <div class="baraza-cta">
            ${isPast ? pastCtas : upcomingCtas}
            <button class="vote-btn" data-action="vote-up" data-id="${b.id}">▲</button>
            <span data-role="up">${b.upvotes||0}</span>
            <button class="vote-btn" data-action="vote-down" data-id="${b.id}">▼</button>
            <span data-role="down">${b.downvotes||0}</span>
          </div>
        </div>
        <div class="baraza-highlights">${highlights}</div>`;
      item.dataset.id = String(b.id);
      barazaContainer.appendChild(item);
    });
    if(list.length===0){
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = '<div class="small-muted">No barazas match your filters.</div>';
      barazaContainer.appendChild(card);
    }
  }

  function renderHighlights(b){
    const hls = Array.isArray(b.highlights) ? b.highlights : [];
    if(hls.length===0) return '<div class="hl-wrap small-muted">No highlights added yet.</div>';
    return `<div class="hl-wrap">${hls.map(h=>`
      <div class="hl" data-hid="${h.id}">
        <div class="hl-text">${WaziHub.escapeHtml(h.text)}</div>
        <div class="hl-votes">
          <button class="vote-btn" data-action="hl-up" data-id="${b.id}" data-hid="${h.id}">▲</button>
          <span data-role="hl-up">${h.up||0}</span>
          <button class="vote-btn" data-action="hl-down" data-id="${b.id}" data-hid="${h.id}">▼</button>
          <span data-role="hl-down">${h.down||0}</span>
        </div>
      </div>`).join('')}</div>`;
  }

  function voteBaraza(id, value, el){
    // For demo: update locally
    const span = el.nextElementSibling;
    span.textContent = Number(span.textContent) + 1;
    const parent = el.closest('.baraza-cta');
    if(!parent) return;
    const up = parent.querySelector('span[data-role="up"]');
    const down = parent.querySelector('span[data-role="down"]');
    const item = barazaList.find(x=>String(x.id)===String(id));
    if(!item) return;
    if(value>0){ item.upvotes = (item.upvotes||0)+1; if(up) up.textContent = String(item.upvotes); }
    else { item.downvotes = (item.downvotes||0)+1; if(down) down.textContent = String(item.downvotes); }
    // TODO: POST to backend when available
    // fetch(VOTE_ENDPOINT(id), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({vote:value}) })
  }

  function voteHighlight(b, hid, value, el){
    const list = Array.isArray(b.highlights) ? b.highlights : [];
    const h = list.find(x=>String(x.id)===String(hid));
    if(!h) return;
    if(value>0){ h.up = (h.up||0)+1; }
    else { h.down = (h.down||0)+1; }
    const wrap = el.closest('.hl');
    if(wrap){
      const up = wrap.querySelector('span[data-role="hl-up"]');
      const down = wrap.querySelector('span[data-role="hl-down"]');
      if(up) up.textContent = String(h.up||0);
      if(down) down.textContent = String(h.down||0);
    }
    // TODO: POST to backend
  }

  function openMeeting(baraza){
    modalTitle.textContent = baraza.title;
    modalMeta.textContent = new Date(baraza.datetime).toLocaleString() + " • " + baraza.county;
    modalIframe.innerHTML = `<iframe src="${baraza.meeting_link}" style="width:100%;height:100%;border:0" allow="camera; microphone; fullscreen"></iframe>`;
    overlay.classList.add('open');
  }

  modalClose.addEventListener('click', ()=>{ overlay.classList.remove('open'); modalIframe.innerHTML=''; });
  copyLinkBtn.addEventListener('click', ()=>{
    const iframe = modalIframe.querySelector('iframe');
    if(!iframe) return;
    navigator.clipboard.writeText(iframe.src);
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(()=> copyLinkBtn.textContent = 'Copy Link', 1200);
  });

  document.addEventListener('DOMContentLoaded', loadBarazas);

  // ===== Delegated events & filters =====
  barazaContainer.addEventListener('click', (e)=>{
    const target = e.target;
    if(!(target instanceof Element)) return;
    const action = target.getAttribute('data-action');
    if(!action) return;
    const id = target.getAttribute('data-id');
    const baraza = barazaList.find(x=>String(x.id)===String(id));
    if(!baraza) return;
    if(action==='join'){
      openMeeting(baraza);
    } else if(action==='vote-up'){
      voteBaraza(id, 1, target);
    } else if(action==='vote-down'){
      voteBaraza(id, -1, target);
    } else if(action==='hl-up'){
      voteHighlight(baraza, target.getAttribute('data-hid'), 1, target);
    } else if(action==='hl-down'){
      voteHighlight(baraza, target.getAttribute('data-hid'), -1, target);
    } else if(action==='calendar'){
      addToCalendar(baraza);
    } else if(action==='rsvp'){
      toggleRsvp(baraza, target);
    } else if(action==='remind'){
      scheduleReminder(baraza, target);
    }
  });

  [bzSearch,bzCounty,bzFrom,bzTo,bzSort].forEach(el=>{
    if(!el) return;
    el.addEventListener('input', ()=> renderBarazas(applyBarazaFilters()));
    el.addEventListener('change', ()=> renderBarazas(applyBarazaFilters()));
  });

  tabButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab')||'upcoming';
      renderBarazas(applyBarazaFilters());
    });
  });

  // ===== RSVP / Calendar / Reminder =====
  const rsvpSet = new Set(JSON.parse(localStorage.getItem('wazi-bz-rsvp')||'[]'));
  function persistRsvp(){ localStorage.setItem('wazi-bz-rsvp', JSON.stringify(Array.from(rsvpSet))); }

  function toggleRsvp(b, btn){
    const key = String(b.id);
    if(rsvpSet.has(key)) { rsvpSet.delete(key); btn.textContent='RSVP'; }
    else { rsvpSet.add(key); btn.textContent='RSVP’d'; }
    persistRsvp();
  }

   function addToCalendar(b){
    const start = new Date(b.datetime);
    const end = new Date(start.getTime()+60*60*1000);
    const title = encodeURIComponent(b.title);
    const details = encodeURIComponent(`Join: ${b.meeting_link}`);
     const location = encodeURIComponent(b.location || b.county || 'Kenya');
    const iso = (d)=> d.toISOString().replace(/[-:]|\.\d{3}/g,'');
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nURL:${b.meeting_link}\nDTSTART:${iso(start)}\nDTEND:${iso(end)}\nSUMMARY:${title}\nDESCRIPTION:${details}\nLOCATION:${location}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], {type:'text/calendar'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.ics`;
    document.body.appendChild(link); link.click(); link.remove();
  }

  async function scheduleReminder(b, btn){
    try{
      const perm = await Notification.requestPermission();
      if(perm!=='granted') { alert('Enable notifications in your browser.'); return; }
      const dt = new Date(b.datetime).getTime();
      const due = Math.max(0, dt - Date.now() - 10*60*1000); // 10 min before
      btn.textContent = 'Reminder set';
      setTimeout(()=>{
        new Notification('Baraza starting soon', { body: `${b.title} in 10 minutes` });
      }, due);
    }catch{}
  }

})();
