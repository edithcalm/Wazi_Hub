/* WaziHub application logic */
(function () {
  'use strict';
  const WaziData = window.WaziData;
  const WaziHub = window.WaziHub;
  const sectorPalette = WaziData.sectorPalette;
  const baseData = WaziData.baseData;
  const yearMul = WaziData.yearMul;
  const countyScale = WaziData.countyScale;
  const projects = WaziData.projects;

  // ===== CHARTS =====
  const pieCtx = document.getElementById('pie').getContext('2d');
  const barCtx = document.getElementById('bars').getContext('2d');
  let pieChart, barChart;

  function makePie(data){
    const labels = Object.keys(data);
    const values = labels.map(k => data[k].planned);
    const colors = labels.map(l => sectorPalette[l] || '#ccc');
    return new Chart(pieCtx, {
      type: 'pie',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: '#ffffff', borderWidth: 2 }]},
      options: {
        plugins:{
          legend:{ display:false },
          tooltip:{ callbacks:{ label:(ctx)=> `${ctx.label}: ${WaziHub.fmt(ctx.parsed)}` } }
        }
      }
    });
  }

  function makeBars(data){
    const labels = ["Q1","Q2","Q3","Q4"];
    const plannedTotal = Object.values(data).reduce((s,v)=>s+v.planned,0);
    const actualTotal  = Object.values(data).reduce((s,v)=>s+v.actual,0);
    // Simple quarterly splits (dummy)
    const p = [0.24,0.26,0.26,0.24].map(r=> Math.round(plannedTotal*r));
    const a = [0.20,0.23,0.25,0.22].map((r,i)=> Math.min(Math.round(actualTotal*r), p[i])); // cap actual <= planned per quarter
    return new Chart(barCtx, {
      type:'bar',
      data:{
        labels,
        datasets:[
          { label:'Planned', data:p, backgroundColor:'rgba(0,133,63,0.85)' },
          { label:'Actual',  data:a, backgroundColor:'rgba(187,25,25,0.9)' }
        ]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        layout:{ padding:{ top: 8, right: 8, bottom: 0, left: 8 } },
        plugins:{
          legend:{ position:'top', labels:{ boxWidth: 12, boxHeight:12, padding:10 } },
          tooltip:{ padding:8 }
        },
        interaction:{ mode:'index', intersect:false },
        scales:{
          y:{ beginAtZero:true, grace:'1%', ticks:{ callback:(v)=> (v/1e9)+'B' } },
          x:{ grid:{ display:false } }
        }
      }
    });
  }

  function buildLegend(data){
    const el = document.getElementById('pie-legend');
    el.innerHTML = '';
    for(const [label,vals] of Object.entries(data)){
      const color = sectorPalette[label] || '#ccc';
      const item = document.createElement('div');
      item.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${color};margin-right:8px;vertical-align:middle;"></span>${label} — <strong>${WaziHub.fmt(vals.planned)}</strong>`;
      el.appendChild(item);
    }
  }

  function updateCards(data){
    const planned = Object.values(data).reduce((s,v)=>s+v.planned,0);
    const actual  = Object.values(data).reduce((s,v)=>s+v.actual,0);
    const pending = Math.max(planned-actual, 0);
    document.getElementById('total-budget').textContent = WaziHub.fmt(planned);
    document.getElementById('total-spent').textContent  = WaziHub.fmt(actual);
    document.getElementById('pending-budget').textContent = WaziHub.fmt(pending);
  }

  function filterBySector(data, sector){
    if(!sector || sector==="All sectors" || sector==="Sekta zote" || sector==="Sekta zote") return data;
    const filtered = {};
    if(data[sector]) filtered[sector] = data[sector];
    return filtered;
  }

  function scaleForCounty(data, countyVal){
    const key = (countyVal||'').toLowerCase();
    const scale = countyScale[key] || countyScale.default;
    const scaled = {};
    for(const k in data){
      scaled[k] = {
        planned: Math.round(data[k].planned*scale),
        actual : Math.round(data[k].actual *Math.min(scale, 1.15))
      };
    }
    return scaled;
  }

  function scaleForYear(data, year){
    const mul = yearMul[year] || 1;
    const scaled = {};
    for(const k in data){
      scaled[k] = {
        planned: Math.round(data[k].planned*mul),
        actual : Math.round(data[k].actual *mul*0.97) // slight execution gap
      };
    }
    return scaled;
  }

  function drawAll(){
    const sectorSel = document.getElementById('sector').value;
    const countySel = document.getElementById('county').value;
    const yearSel   = document.getElementById('budget-year').value;
    let data = scaleForYear(baseData, yearSel);
    data = scaleForCounty(data, countySel);
    data = filterBySector(data, sectorSel);

    if(pieChart) pieChart.destroy();
    if(barChart) barChart.destroy();

    pieChart = makePie(data);
    barChart = makeBars(data);
    buildLegend(data);
    updateCards(data);
  }

  document.getElementById('update').addEventListener('click', drawAll);

  // Initial charts render
  drawAll();

  // ===== MAP: DUMMY PROJECT PINS =====
  // Map centered roughly on Kenya
  const map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: false,
    dragging: false,
    keyboard: false,
    tap: false
  }).setView([0.3, 37.8], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  projects.forEach(p=>{
    const popup = `
      <strong>${p.name}</strong><br/>
      <em>${p.sector} • ${p.county}</em><br/>
      <div>Budget: <strong>${WaziHub.fmt(p.budget)}</strong> &nbsp; • &nbsp; Spent: <strong>${WaziHub.fmt(p.spent)}</strong></div>
      <div>Status: <span class="badge" style="vertical-align:middle;">${p.status}</span></div>
      <div style="margin-top:.3rem;">Progress:
        <progress value="${p.progress}" max="100" style="width:100%">${p.progress}%</progress>
      </div>
    `;
    L.marker([p.lat,p.lng]).addTo(map).bindPopup(popup);
  });

  // Enable dragging only while pointer is over the map
  const mapEl = document.getElementById('map');
  mapEl.addEventListener('mouseenter', ()=> map.dragging.enable());
  mapEl.addEventListener('mouseleave', ()=> map.dragging.disable());
  // On touch, enable dragging for the duration of the interaction only
  mapEl.addEventListener('touchstart', ()=> map.dragging.enable(), {passive:true});
  mapEl.addEventListener('touchend',   ()=> map.dragging.disable());

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
          <div>
            <div class="baraza-title">${WaziHub.escapeHtml(b.title)}</div>
            <div class="baraza-datetime">${when} • ${WaziHub.escapeHtml(b.county)} • <span>${rel}</span> ${badges}</div>
            <div class="baraza-line2">
               <span class="chip">Host: ${WaziHub.escapeHtml(b.host)}</span>
               <span class="chip">👥 ${b.participants}</span>
               <span class="chip">Location: ${WaziHub.escapeHtml(b.location||'Venue TBC')}</span>
              ${tags}
          </div>
          <div class="baraza-cta">
            ${isPast ? pastCtas : upcomingCtas}
            <button class="vote-btn" data-action="vote-up" data-id="${b.id}">▲</button>
            <span data-role="up">${b.upvotes||0}</span>
            <button class="vote-btn" data-action="vote-down" data-id="${b.id}">▼</button>
            <span data-role="down">${b.downvotes||0}</span>
          </div>
          <div class="baraza-highlights">${highlights}</div>
        </div>`;
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
