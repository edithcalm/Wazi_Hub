/* WaziHub Budget Intelligence Dashboard Controller */
(function () {
  'use strict';

  var BI = window.WaziBudgetIntel;
  var fmt = window.WaziHub && window.WaziHub.fmt ? window.WaziHub.fmt : function (n) {
    if (n >= 1e12) return 'KSh ' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return 'KSh ' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return 'KSh ' + (n / 1e6).toFixed(1) + 'M';
    return 'KSh ' + Math.round(n).toLocaleString();
  };

  if (!BI) return;

  var charts = {};
  var state = {
    county: 'nairobi',
    year: '2025/26',
    sector: 'all',
    programme: 'all',
    subprogramme: 'all',
    theme: 'climate',
    view: 'sector',
    compareA: 'nairobi',
    compareB: 'mombasa'
  };

  var root = document.getElementById('budget-tracker');
  if (!root) return;

  function $(sel) { return root.querySelector(sel); }
  function $id(id) { return document.getElementById(id); }

  function destroyChart(key) {
    if (charts[key]) { charts[key].destroy(); charts[key] = null; }
  }

  function destroyAllCharts() {
    Object.keys(charts).forEach(destroyChart);
  }

  function pct(actual, planned) {
    return planned > 0 ? Math.round((actual / planned) * 100) : 0;
  }

  function chartDefaults() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { boxWidth: 10, boxHeight: 10, padding: 8, font: { size: 10 } } },
        tooltip: {
          padding: 8,
          callbacks: {
            label: function (ctx) {
              var v = ctx.parsed !== undefined ? (ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed) : ctx.raw;
              if (typeof v === 'object' && v !== null) v = v._data || v.v || 0;
              return (ctx.dataset.label ? ctx.dataset.label + ': ' : '') + fmt(v);
            }
          }
        }
      }
    };
  }

  function sumProjects(projects, field) {
    return projects.reduce(function (total, project) {
      return total + project[field];
    }, 0);
  }

  function distributeTotal(total, source) {
    var sourceTotal = source.reduce(function (sum, value) { return sum + value; }, 0);
    if (!sourceTotal) return source.map(function () { return 0; });

    var distributed = [];
    var assigned = 0;
    source.forEach(function (value, index) {
      var amount = index === source.length - 1
        ? total - assigned
        : Math.round(total * value / sourceTotal);
      distributed.push(amount);
      assigned += amount;
    });
    return distributed;
  }

  // Retrieve base budget data and derive every filtered view from the same projects.
  function getActiveDataset() {
    var raw = BI.getCountyData(state.county, state.year);
    var fyData = raw.fyData;
    var allProjects = [];

    var filteredSectors = fyData.sectors.reduce(function (sectors, sector) {
      if (state.sector !== 'all' && sector.id !== state.sector) return sectors;

      var programmes = sector.programmes.reduce(function (matches, programme) {
        if (state.programme !== 'all' && programme.code !== state.programme) return matches;

        var subProgrammes = programme.subProgrammes.reduce(function (subMatches, subProgramme) {
          if (state.subprogramme !== 'all' && subProgramme.code !== state.subprogramme) return subMatches;
          var projects = subProgramme.projects.slice();

          if (!projects.length) return subMatches;
          allProjects = allProjects.concat(projects);
          subMatches.push(Object.assign({}, subProgramme, {
            projects: projects,
            plannedKsh: subProgramme.plannedKsh,
            actualKsh: subProgramme.actualKsh
          }));
          return subMatches;
        }, []);

        if (!subProgrammes.length) return matches;
        var programmeProjects = subProgrammes.reduce(function (projects, subProgramme) {
          return projects.concat(subProgramme.projects);
        }, []);
        matches.push(Object.assign({}, programme, {
          subProgrammes: subProgrammes,
          plannedKsh: programme.plannedKsh,
          actualKsh: programme.actualKsh
        }));
        return matches;
      }, []);

      if (!programmes.length) return sectors;
      var sectorProjects = programmes.reduce(function (projects, programme) {
        programme.subProgrammes.forEach(function (subProgramme) {
          projects = projects.concat(subProgramme.projects);
        });
        return projects;
      }, []);
      sectors.push(Object.assign({}, sector, {
        programmes: programmes,
        plannedKsh: sector.plannedKsh,
        actualKsh: sector.actualKsh
      }));
      return sectors;
    }, []);

    var hasFilters = state.sector !== 'all' || state.programme !== 'all' ||
      state.subprogramme !== 'all';
    var selectedNodes = filteredSectors;
    if (state.programme !== 'all') {
      selectedNodes = filteredSectors.reduce(function (programmes, sector) {
        return programmes.concat(sector.programmes);
      }, []);
    }
    if (state.subprogramme !== 'all') {
      selectedNodes = selectedNodes.reduce(function (subProgrammes, programme) {
        return subProgrammes.concat(programme.subProgrammes);
      }, []);
    }
    var plannedSum = hasFilters
      ? selectedNodes.reduce(function (total, node) { return total + node.plannedKsh; }, 0)
      : fyData.totalPlannedKsh;
    var actualSum = hasFilters
      ? selectedNodes.reduce(function (total, node) { return total + node.actualKsh; }, 0)
      : fyData.totalActualKsh;
    var filteredFyData = fyData;

    if (hasFilters) {
      var themeAllocations = {};
      allProjects.forEach(function (project) {
        var themeShare = project.themeIds.length || 1;
        project.themeIds.forEach(function (themeId) {
          if (!themeAllocations[themeId]) themeAllocations[themeId] = { plannedKsh: 0, actualKsh: 0, beneficiaries: 0, projectsCount: 0 };
          themeAllocations[themeId].plannedKsh += project.plannedKsh / themeShare;
          themeAllocations[themeId].actualKsh += project.actualKsh / themeShare;
          themeAllocations[themeId].beneficiaries += project.beneficiaries / themeShare;
          themeAllocations[themeId].projectsCount += 1;
        });
      });

      filteredFyData = Object.assign({}, fyData, {
        sectors: filteredSectors,
        totalPlannedKsh: plannedSum,
        totalActualKsh: actualSum,
        quarterly: {
          planned: distributeTotal(plannedSum, fyData.quarterly.planned),
          actual: distributeTotal(actualSum, fyData.quarterly.actual)
        },
        themeAllocations: Object.keys(themeAllocations).map(function (themeId) {
          var allocation = themeAllocations[themeId];
          return Object.assign({}, fyData.themeAllocations.find(function (theme) {
            return theme.themeId === themeId;
          }), allocation, {
            themeId: themeId,
            plannedKsh: Math.round(allocation.plannedKsh),
            actualKsh: Math.round(allocation.actualKsh),
            beneficiaries: Math.round(allocation.beneficiaries),
            shareOfBudgetPercent: plannedSum ? Math.round(allocation.plannedKsh / plannedSum * 1000) / 10 : 0
          });
        }).sort(function (a, b) { return b.plannedKsh - a.plannedKsh; })
      });
    }

    var pendingSum = Math.max(plannedSum - actualSum, 0);
    var absorptionRate = plannedSum > 0 ? actualSum / plannedSum : 0;

    return {
      raw: raw,
      fyData: filteredFyData,
      projects: allProjects,
      summary: {
        planned: plannedSum,
        actual: actualSum,
        pending: pendingSum,
        absorption: absorptionRate,
        devRatio: fyData.equity.devSpendSharePercent,
        recRatio: fyData.equity.recurrentSharePercent
      }
    };
  }

  // Render dynamic KPI cards
  function updateSummaryCards(summary) {
    var elBudget = $id('bi-total-budget');
    var elSpent = $id('bi-total-spent');
    var elPending = $id('bi-pending-budget');
    var elAbs = $id('bi-absorption-rate');
    var elDev = $id('bi-dev-share');
    var elRec = $id('bi-rec-share');

    if (elBudget) elBudget.textContent = fmt(summary.planned);
    if (elSpent) elSpent.textContent = fmt(summary.actual) + ' (' + Math.round(summary.absorption * 100) + '%)';
    if (elPending) elPending.textContent = fmt(summary.pending);
    if (elAbs) elAbs.textContent = Math.round(summary.absorption * 100) + '%';
    if (elDev) elDev.textContent = summary.devRatio + '%';
    if (elRec) elRec.textContent = summary.recRatio + '%';
  }

  function setSummaryLabels(labels) {
    $id('bi-total-budget-label').textContent = labels[0];
    $id('bi-total-spent-label').textContent = labels[1];
    $id('bi-pending-budget-label').textContent = labels[2];
  }

  function renderBreadcrumb() {
    var el = $id('bi-breadcrumb');
    if (!el) return;
    var d = BI.getCountyData(state.county, state.year);
    var parts = [
      '<button type="button" class="bi-crumb" data-crumb="county">' + d.county.name + ' County</button>'
    ];
    if (state.sector !== 'all') {
      var sec = BI.getSectorById(state.sector);
      parts.push('<span class="bi-crumb-sep">›</span>');
      parts.push('<button type="button" class="bi-crumb" data-crumb="sector">' + sec.shortName + '</button>');
    }
    if (state.programme !== 'all') {
      var progTemplates = STRUCTURE_TEMPLATES_ALL();
      var prog = progTemplates.find(function (p) { return p.code === state.programme; });
      parts.push('<span class="bi-crumb-sep">›</span>');
      parts.push('<button type="button" class="bi-crumb" data-crumb="programme">' + (prog ? prog.name.slice(0, 18) + '...' : 'Prog') + '</button>');
    }
    if (state.subprogramme !== 'all') {
      var subProg = null;
      var secTemplates = STRUCTURE_TEMPLATES_ALL();
      secTemplates.forEach(function (p) {
        p.subProgrammes.forEach(function (sp) {
          if (sp.code === state.subprogramme) subProg = sp;
        });
      });
      parts.push('<span class="bi-crumb-sep">›</span>');
      parts.push('<span class="bi-crumb active">' + (subProg ? subProg.name.slice(0, 18) + '...' : 'Sub-Prog') + '</span>');
    }
    el.innerHTML = parts.join('');
  }

  // Get list of all programme templates
  function STRUCTURE_TEMPLATES_ALL() {
    var list = [];
    Object.keys(BI.catalog.sectors).forEach(function () {
      // Access structured templates via mapping
    });
    // Fallback: build flat list from data generator
    var all = [];
    var tempSectors = ['health', 'agriculture', 'education', 'water', 'roads', 'trade', 'lands', 'finance', 'governance', 'social', 'ict'];
    var dataset = BI.getCountyData('nairobi', '2025/26').fyData;
    dataset.sectors.forEach(function (s) {
      s.programmes.forEach(function (p) {
        all.push(p);
      });
    });
    return all;
  }

  // ===== 1. SECTOR DASHBOARD =====
  function renderSectorDashboard(dataset) {
    var fyData = dataset.fyData;

    // Sector Pie Chart
    var ctxPie = $id('bi-chart-sector-pie');
    if (ctxPie) {
      destroyChart('sectorPie');
      charts.sectorPie = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
          labels: fyData.sectors.map(function (s) { return BI.getSectorById(s.id).shortName; }),
          datasets: [{
            data: fyData.sectors.map(function (s) { return s.plannedKsh; }),
            backgroundColor: fyData.sectors.map(function (s) { return BI.getSectorById(s.id).color; }),
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: Object.assign({}, chartDefaults(), {
          plugins: Object.assign({}, chartDefaults().plugins, {
            legend: { display: false }
          }),
          onClick: function (_e, elems) {
            if (!elems.length) return;
            var sec = fyData.sectors[elems[0].index];
            state.sector = sec.id;
            state.programme = 'all';
            state.subprogramme = 'all';
            $id('bi-sector').value = sec.id;
            updateCascadeSelectors();
            renderAll();
          }
        })
      });
      renderSectorLegend(fyData.sectors);
    }

    // Recurrent vs Development Bar Chart
    var ctxRecDev = $id('bi-chart-rec-dev');
    if (ctxRecDev) {
      destroyChart('recDev');
      charts.recDev = new Chart(ctxRecDev, {
        type: 'bar',
        data: {
          labels: fyData.sectors.map(function (s) { return BI.getSectorById(s.id).shortName; }),
          datasets: [
            { label: 'Recurrent', data: fyData.sectors.map(function (s) { return s.recurrentKsh; }), backgroundColor: '#475569' },
            { label: 'Development', data: fyData.sectors.map(function (s) { return s.developmentKsh; }), backgroundColor: '#00853F' }
          ]
        },
        options: Object.assign({}, chartDefaults(), {
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 9 } } },
            y: { stacked: true, ticks: { callback: function (v) { return (v / 1e9).toFixed(1) + 'B'; } } }
          }
        })
      });
    }

    // Quarterly Spending Chart
    var ctxQ = $id('bi-chart-quarterly');
    if (ctxQ) {
      destroyChart('quarterly');
      charts.quarterly = new Chart(ctxQ, {
        type: 'bar',
        data: {
          labels: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
          datasets: [
            { label: 'Planned', data: fyData.quarterly.planned, backgroundColor: '#cbd5e1' },
            { label: 'Actual Spent', data: fyData.quarterly.actual, backgroundColor: '#00853F' }
          ]
        },
        options: Object.assign({}, chartDefaults(), {
          scales: {
            x: { grid: { display: false } },
            y: { ticks: { callback: function (v) { return (v / 1e9).toFixed(1) + 'B'; } } }
          }
        })
      });
    }

    // Sector Allocation Rankings Table
    var rankingsTbody = $id('bi-sector-rankings-tbody');
    if (rankingsTbody) {
      var sorted = fyData.sectors.slice().sort(function (a, b) { return b.plannedKsh - a.plannedKsh; });
      rankingsTbody.innerHTML = sorted.map(function (s, idx) {
        var secMeta = BI.getSectorById(s.id);
        var abs = pct(s.actualKsh, s.plannedKsh);
        return '<tr>' +
          '<td><strong>#' + (idx + 1) + '</strong> ' + secMeta.name + '</td>' +
          '<td>' + fmt(s.plannedKsh) + '</td>' +
          '<td>' + fmt(s.actualKsh) + '</td>' +
          '<td><span class="badge" data-status="' + (abs >= 75 ? 'ongoing' : 'awarded') + '">' + abs + '%</span></td>' +
          '</tr>';
      }).join('');
    }

    // Drill down logic
    var drillPanel = $id('bi-drill-panel');
    if (state.sector !== 'all') {
      var activeSec = fyData.sectors.find(function (s) { return s.id === state.sector; });
      if (activeSec && drillPanel) {
        drillPanel.hidden = false;
        var ctxProg = $id('bi-chart-programme-stack');
        if (ctxProg) {
          destroyChart('programmeStack');
          
          var progs = activeSec.programmes;
          if (state.programme !== 'all') {
            progs = progs.filter(function (p) { return p.code === state.programme; });
          }

          charts.programmeStack = new Chart(ctxProg, {
            type: 'bar',
            data: {
              labels: progs.map(function (p) { return p.name.length > 25 ? p.name.slice(0, 23) + '...' : p.name; }),
              datasets: [
                { label: 'Planned', data: progs.map(function (p) { return p.plannedKsh; }), backgroundColor: '#94a3b8' },
                { label: 'Actual Spent', data: progs.map(function (p) { return p.actualKsh; }), backgroundColor: '#ff6b35' }
              ]
            },
            options: Object.assign({}, chartDefaults(), {
              indexAxis: 'y',
              scales: {
                x: { ticks: { callback: function (v) { return (v / 1e6).toFixed(1) + 'M'; } } },
                y: { grid: { display: false } }
              }
            })
          });
          $id('bi-drill-title').textContent = activeSec.name + ' — Programmatic Splits';
        }

        // Fill drill-down projects table
        var drillTbody = $id('bi-drill-tbody');
        if (drillTbody) {
          var rowsHtml = [];
          activeSec.programmes.forEach(function (prog) {
            if (state.programme !== 'all' && prog.code !== state.programme) return;
            prog.subProgrammes.forEach(function (subProg) {
              if (state.subprogramme !== 'all' && subProg.code !== state.subprogramme) return;
              subProg.projects.forEach(function (proj) {
                var pAbs = pct(proj.actualKsh, proj.plannedKsh);
                var badgeClass = proj.status === 'Completed' ? 'ongoing' : (proj.status === 'Ongoing' ? 'ongoing' : 'awarded');
                rowsHtml.push('<tr>' +
                  '<td>' + proj.code + '</td>' +
                  '<td><strong>' + subProg.name + '</strong></td>' +
                  '<td>' + proj.name + '</td>' +
                  '<td>' + proj.ward + '</td>' +
                  '<td>' + fmt(proj.plannedKsh) + '</td>' +
                  '<td>' + fmt(proj.actualKsh) + '</td>' +
                  '<td><span class="badge" data-status="' + badgeClass + '">' + proj.status + '</span></td>' +
                  '<td>' + proj.progressPercent + '%</td>' +
                  '</tr>');
              });
            });
          });
          drillTbody.innerHTML = rowsHtml.join('') || '<tr><td colspan="8" class="mute" style="text-align:center;">No matching projects.</td></tr>';
        }
      }
    } else {
      if (drillPanel) drillPanel.hidden = true;
    }
  }

  function renderSectorLegend(sectors) {
    var el = $id('bi-sector-legend');
    if (!el) return;
    el.innerHTML = sectors.map(function (s) {
      var sec = BI.getSectorById(s.id);
      return '<button type="button" class="bi-legend-item" data-sec-legend="' + s.id + '">' +
        '<span class="bi-swatch" style="background:' + sec.color + '"></span>' +
        '<span class="bi-legend-text">' + sec.shortName + ' — <strong>' + fmt(s.plannedKsh) + '</strong></span></button>';
    }).join('');
    
    el.querySelectorAll('[data-sec-legend]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-sec-legend');
        state.sector = id;
        state.programme = 'all';
        state.subprogramme = 'all';
        $id('bi-sector').value = id;
        updateCascadeSelectors();
        renderAll();
      });
    });
  }

  // ===== 2. THEMATIC DASHBOARD =====
  function renderThematicDashboard(dataset) {
    var fyData = dataset.fyData;
    var allocation = fyData.themeAllocations.find(function (theme) {
      return theme.themeId === state.theme;
    });
    var theme = BI.getThemeById(state.theme);
    if (!allocation || !theme) return;

    $id('bi-theme-icon').textContent = theme.icon;
    $id('bi-theme-icon').style.color = theme.color;
    $id('bi-theme-icon').style.backgroundColor = theme.color + '1a';
    $id('bi-theme-category').textContent = theme.category;
    $id('bi-theme-category').className = 'bi-tag bi-tag-' + theme.category.toLowerCase().replace(/\s+/g, '-');
    $id('bi-theme-name').textContent = theme.name;
    $id('bi-theme-description').textContent = theme.description;
    $id('bi-theme-projects').textContent = allocation.projectsCount.toLocaleString();
    $id('bi-theme-beneficiaries').textContent = Math.round(allocation.beneficiaries).toLocaleString();
    $id('bi-theme-share').textContent = allocation.shareOfBudgetPercent + '%';
    $id('bi-theme-execution-title').textContent = theme.name + ' — planned vs actual';
    $id('bi-theme-county-title').textContent = 'Top counties — ' + theme.name + ' (FY ' + state.year + ')';

    var ctxTree = $id('bi-chart-theme-execution');
    if (ctxTree) {
      destroyChart('themeExecution');
      charts.themeExecution = new Chart(ctxTree, {
        type: 'bar',
        data: {
          labels: ['Planned allocation', 'Actual spending'],
          datasets: [{ label: theme.name, data: [allocation.plannedKsh, allocation.actualKsh], backgroundColor: [theme.color + '80', theme.color], borderRadius: 6 }]
        },
        options: Object.assign({}, chartDefaults(), {
          plugins: Object.assign({}, chartDefaults().plugins, { legend: { display: false } }),
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { callback: function (v) { return fmt(v); } } }
          }
        })
      });
    }

    var ctxThemeCounty = $id('bi-chart-theme-county-compare');
    if (ctxThemeCounty) {
      destroyChart('themeCounty');
      var comparisonCounties = Object.keys(BI.counties).map(function (key) {
        var county = BI.counties[key];
        var countyData = county.financialYears[state.year];
        var countyAllocation = countyData.themeAllocations.find(function (item) {
          return item.themeId === state.theme;
        });
        return { name: county.name, planned: countyAllocation ? countyAllocation.plannedKsh : 0 };
      }).sort(function (a, b) { return b.planned - a.planned; }).slice(0, 10).reverse();
      charts.themeCounty = new Chart(ctxThemeCounty, {
        type: 'bar',
        data: {
          labels: comparisonCounties.map(function (county) { return county.name; }),
          datasets: [{ label: theme.name + ' allocation', data: comparisonCounties.map(function (county) { return county.planned; }), backgroundColor: theme.color, borderRadius: 5 }]
        },
        options: Object.assign({}, chartDefaults(), {
          indexAxis: 'y',
          plugins: Object.assign({}, chartDefaults().plugins, { legend: { display: false } }),
          scales: {
            x: { beginAtZero: true, ticks: { callback: function (v) { return fmt(v); } } },
            y: { grid: { display: false } }
          }
        })
      });
    }
  }

  // ===== 3. COUNTY COMPARISON =====
  function renderCompareDashboard() {
    var cAKey = state.compareA;
    var cBKey = state.compareB;

    var cA = BI.counties[cAKey].financialYears[state.year];
    var cB = BI.counties[cBKey].financialYears[state.year];

    // Compute side by side results layout HTML
    var resultsEl = $id('bi-compare-results');
    if (resultsEl) {
      var createCard = function (name, data, isWinner, counterpartVal, isRate) {
        var formatVal = function (v) {
          return isRate ? Math.round(v * 100) + '%' : (typeof v === 'number' && v > 100 ? fmt(v) : v);
        };
        var winBadge = isWinner ? '<span class="bi-compare-winner">Winner</span>' : '';
        return '<div class="bi-compare-card">' +
          '<div class="bi-compare-card-title">' + name + winBadge + '</div>' +
          '<div class="bi-compare-metric-row"><span class="bi-compare-metric-label">Total Planned Budget</span><span class="bi-compare-metric-value">' + fmt(data.totalPlannedKsh) + '</span></div>' +
          '<div class="bi-compare-metric-row"><span class="bi-compare-metric-label">Actual Spent Budget</span><span class="bi-compare-metric-value">' + fmt(data.totalActualKsh) + '</span></div>' +
          '<div class="bi-compare-metric-row"><span class="bi-compare-metric-label">Budget Execution Rate</span><span class="bi-compare-metric-value">' + Math.round(data.equity.absorptionRate * 100) + '%</span></div>' +
          '<div class="bi-compare-metric-row"><span class="bi-compare-metric-label">Development Share</span><span class="bi-compare-metric-value">' + data.equity.devSpendSharePercent + '%</span></div>' +
          '<div class="bi-compare-metric-row"><span class="bi-compare-metric-label">Recurrent Share</span><span class="bi-compare-metric-value">' + data.equity.recurrentSharePercent + '%</span></div>' +
          '<div class="bi-compare-metric-row"><span class="bi-compare-metric-label">Per Capita Allocation</span><span class="bi-compare-metric-value">KES ' + data.equity.perCapitaBudgetKsh.toLocaleString() + '</span></div>' +
          '<div class="bi-compare-metric-row"><span class="bi-compare-metric-label">WaziHub Equity Index</span><span class="bi-compare-metric-value">' + data.equity.equityIndex + '/100</span></div>' +
          '</div>';
      };

      var cAWin = cA.equity.equityIndex > cB.equity.equityIndex;
      var cBWin = cB.equity.equityIndex > cA.equity.equityIndex;

      resultsEl.innerHTML = 
        createCard(BI.counties[cAKey].name + ' County', cA, cAWin, cB.equity.equityIndex, false) +
        createCard(BI.counties[cBKey].name + ' County', cB, cBWin, cA.equity.equityIndex, false);
    }

    // Charts comparison: Sector allocation splits
    var ctxCompSectors = $id('bi-chart-compare-sectors');
    if (ctxCompSectors) {
      destroyChart('compareSectors');
      var labels = BI.catalog.sectors.map(function (s) { return s.shortName; });
      
      var dataA = BI.catalog.sectors.map(function (s) {
        var sec = cA.sectors.find(function (as) { return as.id === s.id; });
        return sec ? sec.plannedKsh : 0;
      });
      var dataB = BI.catalog.sectors.map(function (s) {
        var sec = cB.sectors.find(function (bs) { return bs.id === s.id; });
        return sec ? sec.plannedKsh : 0;
      });

      charts.compareSectors = new Chart(ctxCompSectors, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: BI.counties[cAKey].name, data: dataA, backgroundColor: '#00853F' },
            { label: BI.counties[cBKey].name, data: dataB, backgroundColor: '#ff6b35' }
          ]
        },
        options: Object.assign({}, chartDefaults(), {
          scales: {
            y: { ticks: { callback: function (v) { return (v / 1e6).toFixed(0) + 'M'; } } }
          }
        })
      });
    }

    // Charts comparison: Thematic priority splits
    var ctxCompThemes = $id('bi-chart-compare-themes');
    if (ctxCompThemes) {
      destroyChart('compareThemes');
      var topThemes = ['climate', 'women', 'pwd', 'youth', 'food', 'water_access'];
      var labelsT = topThemes.map(function (tid) { return BI.getThemeById(tid).name; });
      
      var dataAT = topThemes.map(function (tid) {
        var alloc = cA.themeAllocations.find(function (ta) { return ta.themeId === tid; });
        return alloc ? alloc.plannedKsh : 0;
      });
      var dataBT = topThemes.map(function (tid) {
        var alloc = cB.themeAllocations.find(function (ta) { return ta.themeId === tid; });
        return alloc ? alloc.plannedKsh : 0;
      });

      charts.compareThemes = new Chart(ctxCompThemes, {
        type: 'bar',
        data: {
          labels: labelsT,
          datasets: [
            { label: BI.counties[cAKey].name, data: dataAT, backgroundColor: '#7c3aed' },
            { label: BI.counties[cBKey].name, data: dataBT, backgroundColor: '#ffd23f' }
          ]
        },
        options: Object.assign({}, chartDefaults(), {
          scales: {
            y: { ticks: { callback: function (v) { return (v / 1e6).toFixed(0) + 'M'; } } }
          }
        })
      });
    }

    // All counties performance heatmap
    renderHeatmap();
  }

  function renderHeatmap() {
    var el = $id('bi-heatmap');
    if (!el) return;
    var list = BI.getComparisonCounties(state.year).slice(0, 10);
    var metrics = ['perCapita', 'equityIndex', 'absorption'];
    var labels = ['Per Capita (KES)', 'Equity Index', 'Absorption Rate'];
    var maxPerCap = Math.max.apply(null, list.map(function (c) { return c.perCapita; }));

    var html = '<div class="bi-heatmap-grid" role="table" aria-label="County performance heatmap">';
    html += '<div class="bi-heatmap-corner"></div>';
    list.forEach(function (c) {
      html += '<div class="bi-heatmap-col-head">' + c.name + '</div>';
    });
    metrics.forEach(function (m, mi) {
      html += '<div class="bi-heatmap-row-head">' + labels[mi] + '</div>';
      list.forEach(function (c) {
        var val = m === 'absorption' ? c.absorption * 100 : c[m];
        var intensity = 0.5;
        if (m === 'perCapita') intensity = val / maxPerCap;
        else if (m === 'equityIndex') intensity = val / 100;
        else intensity = val / 100;

        var hue = m === 'absorption' ? 145 : (m === 'equityIndex' ? 275 : 205);
        var bg = 'hsla(' + hue + ', 70%, ' + Math.round(92 - intensity * 40) + '%, 1)';
        var display = m === 'perCapita' ? 'KSh ' + Math.round(val).toLocaleString() : Math.round(val) + (m === 'equityIndex' ? '' : '%');
        html += '<div class="bi-heatmap-cell" style="background:' + bg + '" title="' + c.name + ' — ' + labels[mi] + ': ' + display + '">' + display + '</div>';
      });
    });
    html += '</div>';
    el.innerHTML = html;
  }


  function setActiveView(view) {
    state.view = view;
    if (state.theme === 'all') state.theme = 'climate';
    root.setAttribute('data-view', view);
    $id('bi-sector-filters').hidden = view !== 'sector';
    $id('bi-county-filter').hidden = view === 'compare';
    $id('bi-summary').hidden = view === 'compare';
    $id('bi-breadcrumb').hidden = view !== 'sector';
    root.querySelectorAll('.bi-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-view') === view);
      tab.setAttribute('aria-selected', tab.getAttribute('data-view') === view ? 'true' : 'false');
    });
    root.querySelectorAll('.bi-view').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-view') !== view;
    });
  }

  // Cascade selectors logic: Populates dropdown selections dynamically based on hierarchical relationships
  function populateCascadeBase() {
    // 1. Counties (Populate all 47 counties)
    var cSel = $id('bi-county');
    var compA = $id('bi-compare-a');
    var compB = $id('bi-compare-b');
    
    if (cSel && cSel.options.length <= 1) {
      cSel.innerHTML = '';
      compA.innerHTML = '';
      compB.innerHTML = '';
      
      Object.keys(BI.counties).forEach(function (k) {
        var c = BI.counties[k];
        
        var opt = document.createElement('option');
        opt.value = k;
        opt.textContent = c.name;
        cSel.appendChild(opt);

        var optA = opt.cloneNode(true);
        var optB = opt.cloneNode(true);
        compA.appendChild(optA);
        compB.appendChild(optB);
      });
      cSel.value = state.county;
      compA.value = state.compareA;
      compB.value = state.compareB;
    }

    // 2. Sectors (Populate 11 official sectors)
    var sSel = $id('bi-sector');
    if (sSel && sSel.options.length <= 1) {
      BI.catalog.sectors.forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.shortName;
        sSel.appendChild(opt);
      });
      sSel.value = state.sector;
    }

    // 3. Themes (Populate 17 themes)
    var tSel = $id('bi-theme-select');
    if (tSel && tSel.options.length === 0) {
      var groups = {};
      BI.catalog.themes.forEach(function (t) {
        if (!groups[t.category]) {
          groups[t.category] = document.createElement('optgroup');
          groups[t.category].label = t.category;
          tSel.appendChild(groups[t.category]);
        }
        var opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        groups[t.category].appendChild(opt);
      });
      tSel.value = state.theme;
    }
  }

  function updateCascadeSelectors() {
    var pSel = $id('bi-programme');
    var spSel = $id('bi-subprogramme');
    
    if (!pSel || !spSel) return;

    var selectedSector = $id('bi-sector').value;

    // Reset and rebuild programmes selection
    pSel.innerHTML = '<option value="all">All Programmes</option>';
    spSel.innerHTML = '<option value="all">All Sub-Programmes</option>';

    if (selectedSector !== 'all') {
      var d = BI.getCountyData(state.county, state.year).fyData;
      var sec = d.sectors.find(function (s) { return s.id === selectedSector; });
      if (sec) {
        sec.programmes.forEach(function (p) {
          var opt = document.createElement('option');
          opt.value = p.code;
          opt.textContent = p.name;
          pSel.appendChild(opt);
        });
      }
    }
    pSel.value = state.programme;
    
    // Rebuild sub-programmes selection
    var selectedProg = pSel.value;
    if (selectedSector !== 'all' && selectedProg !== 'all') {
      var d = BI.getCountyData(state.county, state.year).fyData;
      var sec = d.sectors.find(function (s) { return s.id === selectedSector; });
      if (sec) {
        var prog = sec.programmes.find(function (p) { return p.code === selectedProg; });
        if (prog) {
          prog.subProgrammes.forEach(function (sp) {
            var opt = document.createElement('option');
            opt.value = sp.code;
            opt.textContent = sp.name;
            spSel.appendChild(opt);
          });
        }
      }
    }
    spSel.value = state.subprogramme;
  }

  function applySelectedFilters() {
    state.year = $id('bi-year').value;
    state.county = $id('bi-county').value;
    if (state.view === 'sector') {
      state.sector = $id('bi-sector').value;
      updateCascadeSelectors();
      state.programme = $id('bi-programme').value || 'all';
      state.subprogramme = $id('bi-subprogramme').value || 'all';
    }
    renderAll();
  }

  function renderAll() {
    if (state.view === 'sector') {
      setSummaryLabels(['Total budget', 'Total spent', 'Unspent / pending']);
      var dataset = getActiveDataset();
      updateSummaryCards(dataset.summary);
      renderBreadcrumb();
      renderSectorDashboard(dataset);
    } else if (state.view === 'theme') {
      var countyData = BI.getCountyData(state.county, state.year).fyData;
      var themeAllocation = countyData.themeAllocations.find(function (item) {
        return item.themeId === state.theme;
      });
      if (themeAllocation) {
        setSummaryLabels(['Theme allocation', 'Spent on theme', 'Unspent allocation']);
        updateSummaryCards({
          planned: themeAllocation.plannedKsh,
          actual: themeAllocation.actualKsh,
          pending: Math.max(themeAllocation.plannedKsh - themeAllocation.actualKsh, 0),
          absorption: themeAllocation.plannedKsh ? themeAllocation.actualKsh / themeAllocation.plannedKsh : 0
        });
      }
      renderThematicDashboard({ fyData: countyData });
    } else if (state.view === 'compare') {
      renderCompareDashboard();
    }
  }

  function bindEvents() {
    var resetBtn = $id('bi-reset');

    var yearSel = $id('bi-year');
    var countySel = $id('bi-county');
    var sectorSel = $id('bi-sector');
    var progSel = $id('bi-programme');
    var subprogSel = $id('bi-subprogramme');
    var themeSel = $id('bi-theme-select');

    // Apply filter changes immediately after refreshing dependent programme options.
    if (sectorSel) {
      sectorSel.addEventListener('change', function () {
        state.sector = sectorSel.value;
        state.programme = 'all';
        state.subprogramme = 'all';
        updateCascadeSelectors();
        applySelectedFilters();
      });
    }

    if (progSel) {
      progSel.addEventListener('change', function () {
        state.programme = progSel.value;
        state.subprogramme = 'all';
        updateCascadeSelectors();
        applySelectedFilters();
      });
    }

    if (subprogSel) {
      subprogSel.addEventListener('change', function () {
        state.subprogramme = subprogSel.value;
        applySelectedFilters();
      });
    }

    [yearSel, countySel].forEach(function (selector) {
      if (selector) selector.addEventListener('change', applySelectedFilters);
    });
    if (themeSel) {
      themeSel.addEventListener('change', function () {
        state.theme = themeSel.value;
        renderAll();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        yearSel.value = '2025/26';
        countySel.value = 'nairobi';
        sectorSel.value = 'all';
        themeSel.value = 'climate';
        $id('bi-compare-a').value = 'nairobi';
        $id('bi-compare-b').value = 'mombasa';
        state.sector = 'all';
        state.programme = 'all';
        state.subprogramme = 'all';
        state.theme = themeSel.value;
        state.year = yearSel.value;
        state.county = countySel.value;
        state.compareA = 'nairobi';
        state.compareB = 'mombasa';
        updateCascadeSelectors();
        applySelectedFilters();
      });
    }

    // Compare Counties selectors
    var compareA = $id('bi-compare-a');
    var compareB = $id('bi-compare-b');
    var compareBtn = $id('bi-compare-btn');

    if (compareBtn) {
      compareBtn.addEventListener('click', function () {
        state.compareA = compareA.value;
        state.compareB = compareB.value;
        destroyChart('compareSectors');
        destroyChart('compareThemes');
        renderCompareDashboard();
      });
    }

    // Tab buttons event binding
    root.querySelectorAll('.bi-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        setActiveView(tab.getAttribute('data-view'));
        destroyAllCharts();
        renderAll();
      });
    });

    // Breadcrumbs click binding
    var breadcrumb = $id('bi-breadcrumb');
    if (breadcrumb) {
      breadcrumb.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-crumb]');
        if (!btn) return;
        var crumb = btn.getAttribute('data-crumb');
        
        if (crumb === 'county') {
          state.sector = 'all';
          state.programme = 'all';
          state.subprogramme = 'all';
        } else if (crumb === 'sector') {
          state.programme = 'all';
          state.subprogramme = 'all';
        } else if (crumb === 'programme') {
          state.subprogramme = 'all';
        }
        
        // Match selection inputs
        $id('bi-sector').value = state.sector;
        updateCascadeSelectors();
        $id('bi-programme').value = state.programme;
        updateCascadeSelectors();
        $id('bi-subprogramme').value = state.subprogramme;
        
        destroyAllCharts();
        renderAll();
      });
    }

    window.addEventListener('resize', function () {
      Object.keys(charts).forEach(function (k) {
        if (charts[k]) charts[k].resize();
      });
    });
  }

  function init() {
    if (typeof Chart === 'undefined') {
      setTimeout(init, 50);
      return;
    }
    populateCascadeBase();
    updateCascadeSelectors();
    bindEvents();
    setActiveView('sector');
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
