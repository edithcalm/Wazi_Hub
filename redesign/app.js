(async function(){
  const DATA_URL = './sample-data.json';
  const data = await fetch(DATA_URL).then(r=>r.json());
  const catalog = data.catalog;
  const counties = data.counties;

  const state = { county: 'nairobi', year: data.meta.financialYear };

  // DOM refs
  const elCounty = document.getElementById('wh-county');
  const elRefresh = document.getElementById('wh-refresh');
  const elTotal = document.getElementById('sum-total');
  const elActual = document.getElementById('sum-actual');
  const elAbs = document.getElementById('sum-abs');
  const elDev = document.getElementById('sum-dev');
  const elSectorPie = document.getElementById('chart-sector-pie').getContext('2d');
  const elRecDev = document.getElementById('chart-rec-dev').getContext('2d');
  const elTreemap = document.getElementById('chart-theme-treemap').getContext('2d');
  const elThemeCards = document.getElementById('theme-cards');
  const elLegend = document.getElementById('sector-legend');
  const elEquityGrid = document.getElementById('equity-grid');
  const elEquityChart = document.getElementById('chart-equity').getContext('2d');
  const elTrends = document.getElementById('chart-trends').getContext('2d');
  const elHeatmap = document.getElementById('heatmap');
  const elAi = document.getElementById('ai-insights');

  let charts = {};

  function fmt(n){ if(n>=1e9) return 'KSh '+(n/1e9).toFixed(2)+'B'; if(n>=1e6) return 'KSh '+(n/1e6).toFixed(1)+'M'; return 'KSh '+Number(n).toLocaleString(); }

  function getCounty(){ return counties[state.county]; }
  function getFY(){ return getCounty().financialYears[state.year]; }

  function updateSummary(){ const fy = getFY(); elTotal.textContent = fmt(fy.totalPlannedKsh); elActual.textContent = fmt(fy.totalActualKsh); elAbs.textContent = Math.round((fy.totalActualKsh/fy.totalPlannedKsh)*100)+'%'; elDev.textContent = fy.developmentKsh?Math.round((fy.developmentKsh/fy.totalPlannedKsh)*100)+'%':'—'; }

  function clearCharts(){ Object.values(charts||{}).forEach(c=>c&&c.destroy()); charts={}; }

  function renderSectorPie(){ const fy=getFY(); const labels = fy.sectors.map(s=>s.name); const dataSet = fy.sectors.map(s=>s.plannedKsh); const colors = fy.sectors.map(s=>{ const c = catalog.sectors.find(x=>x.id===s.id); return c?c.color:'#888'; }); clearCharts(); charts.pie = new Chart(elSectorPie,{type:'pie',data:{labels, datasets:[{data:dataSet, backgroundColor:colors, borderColor:'#fff', borderWidth:2}]}, options:{plugins:{legend:{position:'bottom'}}}}); renderLegend(fy.sectors); }

  function renderLegend(sectors){ elLegend.innerHTML=''; sectors.forEach(s=>{ const c = catalog.sectors.find(x=>x.id===s.id); const btn = document.createElement('button'); btn.className='legend-item'; btn.innerHTML=`<span class='legend-swatch' style='background:${c.color}'></span><div><div style='font-weight:700'>${c.shortName}</div><div class='muted'>${fmt(s.plannedKsh)}</div></div>`; btn.onclick=()=>renderProgrammeStack(s); elLegend.appendChild(btn); }); }

  function renderSectorList(){ const fy = getFY(); const container = document.getElementById('sector-list'); if(!container) return; const sectors = catalog.sectors || []; const rows = sectors.map(meta=>{ const fySec = (fy.sectors||[]).find(x=>x.id===meta.id) || {plannedKsh:0, actualKsh:0, sharePercent:0}; return `<tr class='sector-row' data-id='${meta.id}'><td><strong>${meta.name}</strong><div class='muted'>${meta.shortName}</div></td><td class='muted'>${meta.description||''}</td><td>${fmt(fySec.plannedKsh)}</td><td>${fmt(fySec.actualKsh)}</td><td>${fySec.sharePercent||Math.round(((fySec.plannedKsh||0)/fy.totalPlannedKsh)*100)||0}%</td></tr>`; }).join(''); container.innerHTML = `<div style='overflow:auto'><table class='sector-table'><thead><tr><th>Sector</th><th>What it covers</th><th>Planned</th><th>Actual</th><th>Share</th></tr></thead><tbody>${rows}</tbody></table></div>`; container.querySelectorAll('.sector-row').forEach(r=> r.addEventListener('click', ()=>{ const id=r.getAttribute('data-id'); const sec = (fy.sectors||[]).find(s=>s.id===id); if(sec) renderProgrammeStack(sec); else renderProgrammeStack({id:id, name: (catalog.sectors.find(x=>x.id===id)||{}).shortName || id}); })); }

  function renderProgrammeStack(sector){ // small stub to show drill behaviour: show rec vs dev by sector
    const fy=getFY(); const sec = fy.sectors.find(s=>s.id===sector.id); if(!sec) return; if(charts.prog) charts.prog.destroy(); charts.prog = new Chart(elRecDev,{type:'bar',data:{labels:[sec.name+' — recurrent','development'], datasets:[{label:'KSh',data:[sec.recurrentKsh, sec.developmentKsh], backgroundColor:['#0b8f4a','#e44d4d']}]}, options:{indexAxis:'y', plugins:{legend:{display:false}}}});
  }

  function renderRecDev(){ const fy=getFY(); const labels = fy.sectors.map(s=> catalog.sectors.find(x=>x.id===s.id).shortName); const rec = fy.sectors.map(s=>s.recurrentKsh); const dev = fy.sectors.map(s=>s.developmentKsh); charts.recdev = new Chart(elRecDev,{type:'bar', data:{labels, datasets:[{label:'Recurrent', data:rec, backgroundColor:'rgba(11,143,74,0.85)'},{label:'Development', data:dev, backgroundColor:'rgba(228,77,77,0.85)'}]}, options:{scales:{x:{stacked:true}, y:{stacked:true}}}}); }

  function renderThemeTreemap(){ const fy=getFY(); const themes = fy.themeAllocations || []; const tree = themes.map(t=>{ const meta = catalog.themes.find(x=>x.id===t.themeId)||{name:t.themeId,color:'#999'}; return {v:t.plannedKsh, label:meta.name, backgroundColor:meta.color}; }); if(typeof Chart.registry.getChart('treemap')!=='undefined'){ charts.treemap = new Chart(elTreemap,{type:'treemap', data:{datasets:[{tree, key:'v', groups:['label'], backgroundColor:tree.map(x=>x.backgroundColor), labels:{display:true, formatter:(ctx)=>ctx.raw.label+'\n'+fmt(ctx.raw.v)}}]}, options:{plugins:{legend:{display:false}}}}); } else { // fallback bar
      charts.treemap = new Chart(elTreemap,{type:'bar', data:{labels:tree.map(t=>t.label), datasets:[{data:tree.map(t=>t.v), backgroundColor:tree.map(t=>t.backgroundColor)}]}, options:{indexAxis:'y', plugins:{legend:{display:false}}}});
  }
    renderThemeCards(); }

  function renderThemeCards(){ const fy=getFY(); elThemeCards.innerHTML = (fy.themeAllocations||[]).slice(0,8).map(t=>{ const meta = catalog.themes.find(x=>x.id===t.themeId)||{}; return `<div class='theme-card'><div style='font-weight:800;color:${meta.color||"#111"}'>${meta.name||t.themeId}</div><div class='muted'>${Math.round(t.shareOfBudgetPercent||((t.plannedKsh/ fy.totalPlannedKsh)*100||0))}% of budget</div><div style='font-weight:700;margin-top:6px'>${fmt(t.plannedKsh)}</div></div>`; }).join(''); }

  function renderEquity(){ const fy=getFY(); const eq = fy.equity||{}; elEquityGrid.innerHTML = `<div class='card'>Per-capita<br><strong>KSh ${eq.perCapitaBudgetKsh||'—'}</strong></div><div class='card'>Gender-tagged<br><strong>${eq.genderBudgetTaggedPercent||0}%</strong></div><div class='card'>Climate-tagged<br><strong>${eq.climateTaggedPercent||0}%</strong></div>`; const labels=['Gender','Climate','PwD','Youth','Dev spend','Absorption']; const values=[eq.genderBudgetTaggedPercent||0, eq.climateTaggedPercent||0, eq.pwdMainstreamedPercent||0, eq.youthTaggedPercent||0, eq.devSpendSharePercent||0, Math.round((eq.absorptionRate||0)*100)]; if(charts.equity) charts.equity.destroy(); charts.equity = new Chart(elEquityChart,{type:'bar', data:{labels, datasets:[{data:values, backgroundColor:['#db2777','#059669','#7c3aed','#577590','#ffd23f','#00853F']}]}, options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, max:100}}}}); }

  function renderTrends(){ // minimal sample trend generation
    const list = Object.keys(counties).map(k=>{ const fy = counties[k].financialYears[state.year]; return {key:k,name:counties[k].name, planned:fy.totalPlannedKsh, actual:fy.totalActualKsh, perCapita: fy.equity.perCapitaBudgetKsh, equityIndex: fy.equity.equityIndex, absorption: fy.equity.absorptionRate}; }); if(charts.trends) charts.trends.destroy(); charts.trends = new Chart(elTrends,{type:'bar', data:{labels:list.map(x=>x.name), datasets:[{label:'Planned', data:list.map(x=>x.planned), backgroundColor:'rgba(11,143,74,0.8)'},{label:'Actual', data:list.map(x=>x.actual), backgroundColor:'rgba(228,77,77,0.8)'}]}, options:{scales:{y:{ticks:{callback:(v)=>v>=1e9?(v/1e9).toFixed(1)+'B':v}}}}); renderHeatmap(list); }

  function renderHeatmap(list){ elHeatmap.innerHTML=''; const metrics=[{k:'perCapita',label:'Per-capita'},{k:'equityIndex',label:'Equity index'},{k:'absorption',label:'Absorption'}]; const table = document.createElement('div'); table.style.display='grid'; table.style.gridTemplateColumns='150px repeat('+list.length+',1fr)'; const corner=document.createElement('div'); corner.textContent=''; table.appendChild(corner); list.forEach(c=>{ const h=document.createElement('div'); h.textContent=c.name; h.style.fontWeight='700'; table.appendChild(h); }); metrics.forEach(m=>{ const rhead=document.createElement('div'); rhead.textContent=m.label; rhead.style.fontWeight='700'; table.appendChild(rhead); list.forEach(c=>{ const cell=document.createElement('div'); let v = m.k==='absorption'? Math.round(c[m.k]*100)+'%': c[m.k]; cell.textContent=v; cell.style.padding='8px'; cell.style.background='#fff'; cell.style.border='1px solid #f0f3f5'; table.appendChild(cell); }); }); elHeatmap.appendChild(table); }

  function generateAiInsights(){ const fy=getFY(); const sectors=fy.sectors.slice().sort((a,b)=>b.plannedKsh-a.plannedKsh); const top = sectors[0]; const low = sectors.slice().sort((a,b)=> (a.actualKsh/a.plannedKsh)-(b.actualKsh/b.plannedKsh))[0]; const items = [`Top allocation: ${top.name} receives ${top.sharePercent||Math.round((top.plannedKsh/fy.totalPlannedKsh)*100)}% of the county budget (${fmt(top.plannedKsh)}).`, `Lowest absorption: ${low.name} absorption ${(Math.round((low.actualKsh/low.plannedKsh)*100))}% — check project delivery and procurements.`, `Thematic lead: ${ (fy.themeAllocations&&fy.themeAllocations[0])? fy.themeAllocations[0].themeId : 'N/A' } — examine programme tagging for gender/climate.`]; elAi.innerHTML = items.map(i=>`<div style='margin-bottom:8px'>${i}</div>`).join(''); }

  function renderAll(){ updateSummary(); renderSectorPie(); renderRecDev(); renderThemeTreemap(); renderSectorList(); renderEquity(); renderTrends(); generateAiInsights(); }

  // Tab switching
  document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click', (e)=>{ document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); e.target.classList.add('active'); const view=e.target.getAttribute('data-view'); document.querySelectorAll('.view').forEach(v=>v.hidden = v.getAttribute('data-view')!==view); }));

  elCounty.addEventListener('change', ()=>{ state.county = elCounty.value; renderAll(); });
  elRefresh.addEventListener('click', ()=>renderAll());

  // initial
  renderAll();
})();
