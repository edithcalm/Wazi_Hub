# WaziHub Budget Intelligence — Architecture

Production architecture for the redesigned Open Budget Tracker: a civic finance intelligence layer aligned with Kenyan Programme-Based Budgeting (PBB), County Integrated Development Plans (CIDPs), and citizen-friendly thematic analysis.

---

## 1. Information Architecture

```text
WaziHub Budget Intelligence
├── Global filters (persistent)
│   ├── Financial Year (2018/19 – 2025/26)
│   ├── County (10 sample counties → 47 via API)
│   └── Sector drill-down (optional)
├── Summary KPIs (always visible)
│   ├── Total Budget · Total Spent · Pending
│   ├── Absorption Rate · Dev/Recurrent split
│   └── Breadcrumb: County › Sector › Programme
├── View: Sector Allocation
│   ├── Pie — sector share (PBB-aligned)
│   ├── Stacked bar — recurrent vs development
│   ├── Quarterly planned vs actual
│   └── Drill-down — programmes + projects table
├── View: Thematic Allocation
│   ├── Treemap — cross-cutting themes
│   └── Theme cards — GBV, youth, climate, PwD, etc.
├── View: Budget Equity
│   ├── Per-capita · gender · climate · PwD · youth
│   └── Equity indicator bar chart
├── View: Trend Analysis
│   └── Multi-year line (planned, actual, absorption)
├── View: County Comparison
│   ├── Grouped bar — planned vs actual
│   └── Heatmap — per-capita, equity, absorption
└── View: AI Insights
    └── Citizen-friendly narrative cards
```

### Hierarchy (data model)

```text
County
 └── FinancialYear
      ├── totals (planned, actual, recurrent, development)
      ├── sectors[]          ← Official county executive sectors
      │    └── programmes[] ← PBB programme codes & policy goals
      │         ├── themeIds[]  ← Cross-cutting tags (many-to-many)
      │         └── projects[]  ← Development book / county projects
      ├── themeAllocations[]    ← Aggregated thematic spend
      ├── quarterly{}           ← Q1–Q4 planned/actual
      └── equity{}              ← GRB, climate, PwD, per-capita
```

---

## 2. Official Sector Classifications

Replaced 14 generic demo sectors with **10 county executive sectors** used in Kenyan county PBB/CIDP frameworks:

| ID | Sector |
|----|--------|
| `governance` | Governance, Public Administration & ICT |
| `finance` | Finance & Economic Planning |
| `agriculture` | Agriculture, Livestock, Fisheries & Cooperative Development |
| `health` | Health Services |
| `education` | Education, Vocational Training, Youth Affairs & Sports |
| `infrastructure` | Public Works, Transport, Infrastructure & Energy |
| `water` | Water, Environment, Natural Resources & Climate Change |
| `lands` | Lands, Housing & Urban Development |
| `trade` | Trade, Tourism, Cooperatives & Industry |
| `social` | Culture, Social Services, Gender & Special Programmes |

---

## 3. Thematic Classification Framework

Cross-cutting themes (not mutually exclusive — programmes can carry multiple tags):

| Theme ID | Name | Source framework |
|----------|------|------------------|
| `gbv` | GBV Prevention & Response | Gender Responsive Budgeting |
| `women` | Women & Girls Empowerment | GRB / CIDP |
| `youth` | Youth Employment & Skills | CIDP / SDG 8 |
| `pwd` | Persons with Disabilities | Disability Mainstreaming |
| `climate` | Climate Action & Resilience | Climate Budget Tagging |
| `children` | Children & ECD | SDG 4 / Social Protection |
| `elderly` | Elderly Care & Social Protection | CIDP |
| `food` | Food Security & Nutrition | SDG 2 / CIDP |
| `employment` | Employment & Livelihoods | SDG 8 |
| `housing` | Affordable Housing & Slum Upgrading | SDG 11 / CIDP |
| `uhc` | Universal Health Coverage | SDG 3 |
| `digital` | Digital Inclusion & e-Government | SDG 9 / Cross-cutting |

JSON Schema: `data/budget-intelligence-schema.json`  
Sample data: `data/budget-intelligence.js` → `window.WaziBudgetIntel`

---

## 4. UI Wireframe (ASCII)

```text
┌─────────────────────────────────────────────────────────────────┐
│ Budget Intelligence                                    [tabs]   │
│ Sector | Theme | Equity | Trends | Compare | Insights           │
├─────────────────────────────────────────────────────────────────┤
│ Year ▼  County ▼  Sector ▼                    [Update Data]     │
│ Nairobi County › Health Services › …                            │
├────────┬────────┬────────┬────────┬────────┬──────────────────┤
│ Budget │ Spent  │ Pending│ Absorp │ Dev %  │ Rec %            │
├────────────────────────────┬────────────────────────────────────┤
│  SECTOR PIE (click drill)  │  RECURRENT vs DEV (stacked)        │
├────────────────────────────┴────────────────────────────────────┤
│  QUARTERLY PLANNED vs ACTUAL (bar)                              │
├─────────────────────────────────────────────────────────────────┤
│  [Drill panel: programme bars + project table]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Hierarchy

```text
index.html#budget-tracker
├── js/budget-intelligence.js       ← Controller + Chart.js
├── css/budget-intelligence.css     ← Dashboard layout
├── data/budget-intelligence.js     ← WaziBudgetIntel dataset
└── data/budget-intelligence-schema.json

Chart instances (destroyed/recreated on filter change):
  sectorPie · recDev · quarterly · progStack
  themeTreemap · equity · trends · compare
```

---

## 6. Chart.js Configuration Summary

| View | Chart type | Canvas ID | Plugin |
|------|------------|-------------|--------|
| Sector share | Pie | `bi-chart-sector-pie` | Core |
| Recurrent/Dev | Stacked bar | `bi-chart-rec-dev` | Core |
| Quarterly | Grouped bar | `bi-chart-quarterly` | Core |
| Programmes | Horizontal bar | `bi-chart-programme-stack` | Core |
| Themes | Treemap | `bi-chart-theme-treemap` | chartjs-chart-treemap |
| Equity | Bar | `bi-chart-equity` | Core |
| Trends | Multi-line (+ dual axis) | `bi-chart-trends` | Core |
| Compare | Grouped bar | `bi-chart-compare` | Core |
| Heatmap | CSS grid | `#bi-heatmap` | Native (accessible) |

Responsive: `maintainAspectRatio: false` + `height: clamp(...)` on `.chart-box`.

---

## 7. Future API Integration Strategy

### REST endpoints (proposed)

```http
GET /api/budget/v1/counties
GET /api/budget/v1/counties/{code}/years/{fy}
GET /api/budget/v1/counties/{code}/years/{fy}/sectors
GET /api/budget/v1/counties/{code}/years/{fy}/themes
GET /api/budget/v1/counties/{code}/years/{fy}/programmes?sector={id}
GET /api/budget/v1/counties/{code}/years/{fy}/projects?programme={id}
GET /api/budget/v1/compare?counties=nairobi,nakuru&fy=2025/26
GET /api/budget/v1/trends?county={code}&from=2018/19&to=2025/26
POST /api/budget/v1/insights  { county, fy, locale }  → AI narrative
```

### Client adapter (drop-in)

```javascript
// js/budget-api.js (future)
async function loadCountyBudget(county, fy) {
  const res = await fetch(`/api/budget/v1/counties/${county}/years/${encodeURIComponent(fy)}`);
  if (!res.ok) return WaziBudgetIntel.getCountyData(county, fy); // offline fallback
  return res.json();
}
```

### Data pipeline

1. **Ingest** — County approved estimates PDFs + CARA allocations + CoB quarterly reports  
2. **Extract** — PDF tables → programme codes (Python/pdfplumber)  
3. **Tag** — Rule-based + ML theme tagging (keywords from CIDP, GRB manuals)  
4. **Validate** — Totals vs Budget Statement; version by `estimateType`  
5. **Publish** — Static JSON on CDN or API; service worker caches county bundles  

### AI Insights panel

Replace `buildInsights()` demo strings with:

```javascript
POST /api/budget/v1/insights
{ county: "nairobi", fy: "2025/26", locale: "en", context: "citizen" }
→ { insights: [{ type, title, text, citations[] }] }
```

Use RAG over programme descriptions + CoB variance reports; always cite source documents.

---

## 8. Files Changed / Added

| File | Role |
|------|------|
| `data/budget-intelligence-schema.json` | JSON Schema v1 |
| `data/budget-intelligence.js` | Sample dataset + `WaziBudgetIntel` API |
| `js/budget-intelligence.js` | Dashboard controller & charts |
| `css/budget-intelligence.css` | Responsive BI styles |
| `index.html#budget-tracker` | Redesigned section |
| `docs/BUDGET_INTELLIGENCE_ARCHITECTURE.md` | This document |
| `data/budget.js` | Legacy (superseded; kept for reference) |

---

## 9. Citizen UX Principles

- **Dual lens** — Officials think in sectors/programmes; citizens think in themes (health, roads, youth jobs). Both views use the same underlying data.
- **Drill-down without jargon** — Breadcrumb + plain programme names; PBB codes in table for accountability users.
- **Equity visible by default** — Gender, climate, PwD tagging surfaced in dedicated view, not buried in PDFs.
- **Ask-your-leader prompts** — Insights panel suggests baraza questions, not just charts.
- **Mobile-first** — Tabs wrap; charts stack; heatmap scrolls horizontally.

---

## 10. Validation Checklist (before production)

- [ ] Replace sample amounts with published county estimates per FY  
- [ ] Map all 47 counties with correct population (KNBS census)  
- [ ] Link projects to Open Contracting portal tender IDs  
- [ ] Overlay Controller of Budget actuals quarterly  
- [ ] Version supplementary budgets (Supp I–III)  
- [ ] Swahili/local language strings for theme names  
- [ ] WCAG 2.1 AA audit on charts (text alternatives, keyboard drill-down)
