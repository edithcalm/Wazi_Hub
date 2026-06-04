# National Budget Data → WaziHub (Program-Based Budget Book)

## Can WaziHub access live national budget data today?

**Not automatically.** Kenya’s National Treasury does **not** publish a public REST API for the Program-Based Budget (PBB) Book. Official data is released as **PDF budget books** each financial year.

WaziHub currently uses **demo sector totals** in `data/budget.js`. To mirror the real **Program-Based Budget Book**, you must **download official documents**, extract structured fields, and load them into WaziHub (JSON + optional backend).

---

## Official sources (start here)

| Source | What you get | URL |
|--------|----------------|-----|
| **National Treasury – Budget Books** | Full PBB, Recurrent & Development volumes (PDF) | https://www.treasury.go.ke/budget-books |
| **Bajeti Yetu (Treasury portal)** | Same books by FY, searchable list | https://bajetiyetu.treasury.go.ke/document-libraries/list?cat=13&doc=BUDGET+BOOKS |
| **Parliament – Budget documents** | Estimates, PBB, Budget Statement | https://www.parliament.go.ke/2025-2026-budget-documents |
| **Budget Highlights (Mwananchi Guide)** | Citizen-friendly sector summary (PDF) | https://www.treasury.go.ke/wp-content/uploads/2025/06/Budget-Highlights-The-Mwananchi-Guide-for-the-FY-2025-26-Budget.pdf |
| **Controller of Budget** | Implementation / absorption (actual spend) | https://www.cob.go.ke |
| **County Allocation of Revenue Act** | County shares (not programme detail) | https://kenyalaw.org |

### Reference civic-tech sites (already parsed Treasury PDFs)

| Site | Structure | Notes |
|------|-----------|--------|
| [Open Budget Kenya](https://openbudget.or.ke/) | State Dept → Programme → Sub-programme → Project | Same PBB logic as WaziHub target model |
| [Sirkal Finance Explorer](https://sirkal.co.ke/) | National estimates, CSV/PDF exports | Verify against Treasury before production use |

Contact Open Budget KE (see their [Sources](https://openbudget.or.ke/sources) page) if you need advice on how they parse the six budget volumes.

---

## Treasury budget book set (per financial year)

Each FY typically includes **six volumes**:

1. **Program Based Budget Book** ← **primary for WaziHub**
2. Development Budget Book 1
3. Development Budget Book 2 (often roads/infrastructure)
4. Development Budget Book 3
5. Recurrent Budget Book 1
6. Recurrent Budget Book 2

The **PBB Book** is required under the **Public Finance Management Act** — it organises spending by **outcomes** (programmes), not only line items.

**Development** and **Recurrent** books provide project-level and wage/operations detail; link those amounts to PBB programme codes in your dataset.

---

## FY 2025/26 national totals (published summaries)

Use these as **top-level checks** when validating extracted data (not a substitute for the full PBB book):

| Category | Amount (KSh) | Source |
|----------|--------------|--------|
| **Total budget** | 4.239 trillion | Parliament / Treasury FY 2025/26 estimates |
| Recurrent expenditure | 1.79 trillion | Budget Statement |
| Consolidated Fund Services | 1.337 trillion | Budget Statement |
| Development expenditure | 707.8 billion | Budget Statement |
| **Education sector** | 702.7 billion | Parliament briefing |
| **Health sector** | 138.1 billion | Parliament / Budget Statement |

Sector figures in highlights sometimes differ slightly between documents (e.g. education 658.4 bn in Mwananchi Guide vs 702.7 bn in Parliament) — always cite the document version and date.

---

## WaziHub data model (Program-Based Budget Book)

File: `data/pbb-fy2025-26-sample.json` (starter schema + sample programmes).

```text
FinancialYear
 └── votes[]                    # e.g. Vote 1011 – Executive Office of the President
      ├── voteCode, voteName, ministry
      └── stateDepartments[]
           └── programmes[]
                ├── programmeCode, programmeName, policyGoal
                ├── recurrentKsh, developmentKsh, totalKsh
                └── subProgrammes[]
                     └── projects[]   # optional link to Development Budget Book
                          ├── projectCode, projectName, county, allocationKsh
```

### Field mapping from PBB PDF columns

| PBB book field (typical) | WaziHub JSON field |
|--------------------------|-------------------|
| Vote / Institution code | `voteCode` |
| Vote name | `voteName` |
| State Department | `stateDepartmentName` |
| Programme code & name | `programmeCode`, `programmeName` |
| Programme objective | `policyGoal` |
| Recurrent estimates | `recurrentKsh` |
| Development estimates | `developmentKsh` |
| Sub-programme | `subProgrammes[]` |
| Project (from Dev. books) | `projects[]` |

---

## How to get data into WaziHub (3 paths)

### Path A — Manual + spreadsheet (fastest MVP)

1. Download **FY 2025/26 Program Based Budget Book** from Treasury.
2. Copy programme tables into Excel/Google Sheets (vote → programme → sub-programme → KSh).
3. Export CSV → convert to JSON matching `pbb-fy2025-26-sample.json`.
4. Replace or merge with `data/budget.js` / load via new `js/budget-pbb.js`.

### Path B — PDF extraction script (scalable)

1. Use Python: `pdfplumber` or `tabula-py` on PBB PDF tables.
2. Normalize vote codes (1011–2151).
3. Output `data/pbb-fy2025-26.json`.
4. Add a small Node script in CI to validate totals against Budget Statement.

### Path C — Partner with parsed dataset

1. Align schema with [Open Budget Kenya](https://openbudget.or.ke/) hierarchy.
2. Request permission / methodology for their extracted files.
3. Pipe into WaziHub API when you add a backend (`GET /api/budget?fy=2025/26&vote=...`).

---

## Wiring WaziHub UI to PBB (next development steps)

1. **Filters:** Year → Vote (MDA) → State Department → Programme (replace generic “sector” only view).
2. **Charts:** Programme allocation pie; recurrent vs development stacked bar.
3. **Drill-down:** Programme → sub-programme → linked projects (map already exists).
4. **County layer:** Use County Allocation of Revenue Act + county programme-based budgets (separate PDF set per county).
5. **Actuals:** Overlay Controller of Budget quarterly implementation reports on `actualKsh`.

---

## Legal and accuracy notes

- Treasury PDFs are **public** for civic use; attribute sources on every screen.
- Mark data as **“Estimates”** until the Appropriations Act is passed.
- Supplementary budgets (I, II, III) amend the same programme codes — version your JSON by `estimateType: "Original" | "SupplementaryI"`.
- Do not scrape Treasury sites aggressively; download official PDFs manually or use their portals.

---

## Files in this repo

| File | Purpose |
|------|---------|
| `data/budget.js` | Current demo sector chart data |
| `data/pbb-fy2025-26-sample.json` | PBB schema + sample Education & Health programmes (FY 2025/26) |
| `docs/BUDGET_DATA_INTEGRATION.md` | This guide |

When full extraction is ready, add `data/pbb-fy2025-26.json` (full book) and keep the sample file for documentation only.
