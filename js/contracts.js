/* WaziHub Open Contracting Portal Controller */
(function () {
  'use strict';

  var WaziData = window.WaziData;
  var WaziHub = window.WaziHub;

  if (!WaziData || !WaziData.contracts) return;

  var contracts = WaziData.contracts;

  // DOM Elements
  var tbody = document.getElementById('contracts-tbody');
  var searchInput = document.getElementById('contracts-search-input');
  var statusFilter = document.getElementById('contracts-status-filter');
  var contractorFilter = document.getElementById('contracts-contractor-filter');
  var projectFilter = document.getElementById('contracts-project-filter');
  
  // Metrics Elements
  var metricTotalCount = document.getElementById('metric-total-contracts');
  var metricTotalValue = document.getElementById('metric-total-value');
  var metricAwardedCount = document.getElementById('metric-awarded-contracts');
  var metricOngoingCount = document.getElementById('metric-ongoing-contracts');

  // Modal Elements
  var modal = document.getElementById('contract-detail-modal');
  var modalOverlay = document.getElementById('contract-modal-overlay');
  var modalClose = document.getElementById('contract-modal-close');

  // Currency formatter fallback
  var fmt = WaziHub && WaziHub.fmt ? WaziHub.fmt : function (n) {
    if (n >= 1e9) return 'KSh ' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return 'KSh ' + (n / 1e6).toFixed(1) + 'M';
    return 'KSh ' + Math.round(n).toLocaleString();
  };

  // Populate dynamic filter options (Contractors and Projects)
  function populateFilterDropdowns() {
    if (contractorFilter) {
      var contractorsList = [];
      contracts.forEach(function (c) {
        if (contractorsList.indexOf(c.contractor) === -1) {
          contractorsList.push(c.contractor);
        }
      });
      contractorFilter.innerHTML = '<option value="all">All Contractors</option>';
      contractorsList.sort().forEach(function (con) {
        var opt = document.createElement('option');
        opt.value = con;
        opt.textContent = con;
        contractorFilter.appendChild(opt);
      });
    }

    if (projectFilter) {
      var projectsList = [];
      contracts.forEach(function (c) {
        if (projectsList.indexOf(c.project) === -1) {
          projectsList.push(c.project);
        }
      });
      projectFilter.innerHTML = '<option value="all">All Projects</option>';
      projectsList.sort().forEach(function (proj) {
        var opt = document.createElement('option');
        opt.value = proj;
        opt.textContent = proj;
        projectFilter.appendChild(opt);
      });
    }
  }

  // Filter and update table
  function updatePortal() {
    var query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    var status = statusFilter ? statusFilter.value : 'all';
    var contractor = contractorFilter ? contractorFilter.value : 'all';
    var project = projectFilter ? projectFilter.value : 'all';

    var filtered = contracts.filter(function (c) {
      // 1. Query Filter (matches ID, Project or Contractor)
      if (query) {
        var haystack = [c.id, c.project, c.contractor].join(' ').toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }
      // 2. Status Filter
      if (status !== 'all' && c.status.toLowerCase() !== status.toLowerCase()) {
        return false;
      }
      // 3. Contractor Filter
      if (contractor !== 'all' && c.contractor !== contractor) {
        return false;
      }
      // 4. Project Filter
      if (project !== 'all' && c.project !== project) {
        return false;
      }
      return true;
    });

    renderTable(filtered);
    updateMetrics(filtered);
  }

  // Render Contracts table
  function renderTable(list) {
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 2rem;">No contracts match your filter criteria.</td></tr>';
      return;
    }

    list.forEach(function (c) {
      var tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.className = 'contract-row';
      tr.setAttribute('data-id', c.id);

      var statusClass = c.status.toLowerCase() === 'ongoing' ? 'ongoing' : 'awarded';
      
      tr.innerHTML = 
        '<td><strong>' + WaziHub.escapeHtml(c.id) + '</strong></td>' +
        '<td>' + WaziHub.escapeHtml(c.project) + '</td>' +
        '<td>' + WaziHub.escapeHtml(c.contractor) + '</td>' +
        '<td><strong>' + fmt(c.value) + '</strong></td>' +
        '<td>' + WaziHub.escapeHtml(c.date) + '</td>' +
        '<td><span class="badge" data-status="' + statusClass + '">' + WaziHub.escapeHtml(c.status) + '</span></td>' +
        '<td><a href="' + WaziHub.escapeHtml(c.reportUrl) + '" target="_blank" class="view-report-btn">View Report</a></td>';

      // Attach row-click listener (except when clicking the report link itself)
      tr.addEventListener('click', function (e) {
        if (e.target.closest('.view-report-btn')) return;
        openContractDetail(c.id);
      });

      tbody.appendChild(tr);
    });
  }

  // Update KPI Summary Metrics
  function updateMetrics(list) {
    var count = list.length;
    var totalValue = 0;
    var awarded = 0;
    var ongoing = 0;

    list.forEach(function (c) {
      totalValue += c.value;
      if (c.status.toLowerCase() === 'awarded') {
        awarded++;
      } else if (c.status.toLowerCase() === 'ongoing') {
        ongoing++;
      }
    });

    if (metricTotalCount) metricTotalCount.textContent = count;
    if (metricTotalValue) metricTotalValue.textContent = fmt(totalValue);
    if (metricAwardedCount) metricAwardedCount.textContent = awarded;
    if (metricOngoingCount) metricOngoingCount.textContent = ongoing;
  }

  // Open Contract Detail Modal
  function openContractDetail(id) {
    var c = contracts.find(function (item) { return item.id === id; });
    if (!c || !modal) return;

    // Populate Modal Content
    document.getElementById('modal-contract-id').textContent = c.id;
    document.getElementById('modal-project-name').textContent = c.project;
    document.getElementById('modal-contractor').textContent = c.contractor;
    document.getElementById('modal-award-value').textContent = fmt(c.value);
    document.getElementById('modal-award-date').textContent = c.date;
    
    var statusBadge = document.getElementById('modal-status-badge');
    if (statusBadge) {
      statusBadge.textContent = c.status;
      statusBadge.setAttribute('data-status', c.status.toLowerCase());
    }

    document.getElementById('modal-project-summary').textContent = c.summary;
    document.getElementById('modal-project-scope').textContent = c.scope;

    // Render BoQ
    var boqTbody = document.getElementById('modal-boq-tbody');
    if (boqTbody) {
      boqTbody.innerHTML = c.boq.map(function (b) {
        return '<tr>' +
          '<td>' + WaziHub.escapeHtml(b.item) + '</td>' +
          '<td>' + WaziHub.escapeHtml(b.desc) + '</td>' +
          '<td>' + WaziHub.escapeHtml(b.qty) + '</td>' +
          '<td>' + WaziHub.escapeHtml(b.rate) + '</td>' +
          '<td><strong>' + WaziHub.escapeHtml(b.total) + '</strong></td>' +
          '</tr>';
      }).join('');
    }

    // Render Timeline
    var timelineContainer = document.getElementById('modal-timeline-container');
    if (timelineContainer) {
      timelineContainer.innerHTML = c.timeline.map(function (t) {
        var timelineStatusClass = t.status.toLowerCase() === 'completed' ? 'ongoing' : (t.status.toLowerCase() === 'ongoing' ? 'ongoing' : 'awarded');
        return '<div class="timeline-item" style="border-left: 3px solid var(--kenya-green); padding-left: 1rem; margin-bottom: 1rem; position: relative;">' +
          '<div style="font-weight: 800; font-size: 0.95rem;">' + WaziHub.escapeHtml(t.phase) + '</div>' +
          '<div style="font-size: 0.85rem; color: var(--muted);">' + WaziHub.escapeHtml(t.start) + ' to ' + WaziHub.escapeHtml(t.end) + '</div>' +
          '<div style="margin-top: 0.2rem;"><span class="badge" data-status="' + timelineStatusClass + '" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">' + WaziHub.escapeHtml(t.status) + '</span></div>' +
          '</div>';
      }).join('');
    }

    // Render Procurement
    var procDetails = document.getElementById('modal-procurement-details');
    if (procDetails) {
      procDetails.innerHTML = 
        '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.9rem;">' +
          '<div><strong>Procurement Method:</strong> ' + WaziHub.escapeHtml(c.procurement.method) + '</div>' +
          '<div><strong>Tender Published:</strong> ' + WaziHub.escapeHtml(c.procurement.published) + '</div>' +
          '<div><strong>Bids Received:</strong> ' + WaziHub.escapeHtml(c.procurement.bidsReceived) + ' bids</div>' +
          '<div><strong>Engineer Estimate:</strong> ' + fmt(c.procurement.engineerEstimate) + '</div>' +
        '</div>';
    }

    // Render Oversight
    var oversightDetails = document.getElementById('modal-oversight-details');
    if (oversightDetails) {
      oversightDetails.innerHTML = 
        '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.9rem;">' +
          '<div><strong>Oversight Committee:</strong> ' + WaziHub.escapeHtml(c.oversight.committee) + '</div>' +
          '<div><strong>Committee Chair:</strong> ' + WaziHub.escapeHtml(c.oversight.chairman) + '</div>' +
          '<div><strong>Citizen Members:</strong> ' + WaziHub.escapeHtml(c.oversight.members) + '</div>' +
          '<div><strong>Community Audit Meetings:</strong> ' + WaziHub.escapeHtml(c.oversight.meetingsHeld) + ' held</div>' +
        '</div>';
    }

    // Report Link in Modal
    var modalReportLink = document.getElementById('modal-download-report');
    if (modalReportLink) {
      modalReportLink.href = c.reportUrl;
    }

    // Open Modal
    modal.classList.add('open');
    if (modalOverlay) modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeModal() {
    if (modal) modal.classList.remove('open');
    if (modalOverlay) modalOverlay.classList.remove('open');
    document.body.style.overflow = ''; // Release background scroll
  }

  // Bind Listeners
  function bindListeners() {
    if (searchInput) searchInput.addEventListener('input', updatePortal);
    if (statusFilter) statusFilter.addEventListener('change', updatePortal);
    if (contractorFilter) contractorFilter.addEventListener('change', updatePortal);
    if (projectFilter) projectFilter.addEventListener('change', updatePortal);

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Support escape key to close modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    // Refresh DOM bindings because of dynamic loading
    tbody = document.getElementById('contracts-tbody');
    searchInput = document.getElementById('contracts-search-input');
    statusFilter = document.getElementById('contracts-status-filter');
    contractorFilter = document.getElementById('contracts-contractor-filter');
    projectFilter = document.getElementById('contracts-project-filter');
    
    metricTotalCount = document.getElementById('metric-total-contracts');
    metricTotalValue = document.getElementById('metric-total-value');
    metricAwardedCount = document.getElementById('metric-awarded-contracts');
    metricOngoingCount = document.getElementById('metric-ongoing-contracts');

    modal = document.getElementById('contract-detail-modal');
    modalOverlay = document.getElementById('contract-modal-overlay');
    modalClose = document.getElementById('contract-modal-close');

    populateFilterDropdowns();
    bindListeners();
    updatePortal();
  });

})();
