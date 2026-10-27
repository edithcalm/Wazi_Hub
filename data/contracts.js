/* WaziHub contracts data */
(function (g) {
  'use strict';
  g.WaziData = g.WaziData || {};
  g.WaziData.contracts = [
    {
      id: "PPIP-001",
      project: "Nairobi Ward Road Upgrade",
      contractor: "ABC Builders Ltd",
      value: 120000000,
      date: "2025-07-10",
      status: "Ongoing",
      reportUrl: "reports/PPIP-001-Report.pdf",
      summary: "Comprehensive upgrade of key ward access roads to bituminous standard, complete with side drains, culverts, and solar street lighting to enhance commerce and neighborhood security.",
      scope: "Upgrade of 5.2km of tertiary ward roads, construction of 2.1km of stone-pitched storm drains, installation of 120 LED solar-powered streetlights, and paving of 800m of pedestrian walkways.",
      boq: [
        { item: "1", desc: "Site Clearance & Earthworks", qty: "5.2 km", rate: "2,500,000", total: "13,000,000" },
        { item: "2", desc: "Sub-base and Gravel Base Courses", qty: "12,400 m³", rate: "2,800", total: "34,720,000" },
        { item: "3", desc: "Asphalt Concrete Surfacing (50mm)", qty: "36,400 m²", rate: "1,150", total: "41,860,000" },
        { item: "4", desc: "Drainage structures & Culvert installation", qty: "2,100 m", rate: "7,500", total: "15,750,000" },
        { item: "5", desc: "Solar Streetlights & Walkways", qty: "120 Units", rate: "122,250", total: "14,670,000" }
      ],
      timeline: [
        { phase: "Mobilization & Survey", start: "2025-07-20", end: "2025-08-15", status: "Completed" },
        { phase: "Drainage & Sub-grade works", start: "2025-08-16", end: "2025-10-30", status: "Ongoing" },
        { phase: "Base courses & Asphalt paving", start: "2025-11-01", end: "2026-02-15", status: "Pending" },
        { phase: "Street lighting & Pedestrian walks", start: "2026-02-16", end: "2026-04-10", status: "Pending" }
      ],
      procurement: {
        method: "National Competitive Bidding (NCB)",
        published: "2025-05-02",
        bidsReceived: 8,
        engineerEstimate: 130000000
      },
      oversight: {
        committee: "Nairobi Ward Roads Citizen Oversight Team",
        chairman: "John Kamau",
        members: 7,
        meetingsHeld: 3
      }
    },
    {
      id: "PPIP-002",
      project: "County Hospital Wing",
      contractor: "HealthWorks KE",
      value: 340000000,
      date: "2025-06-02",
      status: "Awarded",
      reportUrl: "reports/PPIP-002-Report.pdf",
      summary: "Construction and equipping of a new multi-storey hospital wing to accommodate 150 inpatient beds, a state-of-the-art intensive care unit (ICU), and modern outpatient consulting clinics.",
      scope: "Structural erection of a 4-level reinforced concrete wing, partitioning of pediatric, surgical and general wards, electrical and medical gas piping installation, and delivery of core ICU equipment.",
      boq: [
        { item: "1", desc: "Substructure and Concrete Frame Erection", qty: "1 Item", rate: "95,000,000", total: "95,000,000" },
        { item: "2", desc: "Wall Partitioning and Finishes", qty: "4 Levels", rate: "18,500,000", total: "74,000,000" },
        { item: "3", desc: "Electrical, HVAC & Medical Gas Piping", qty: "1 System", rate: "68,000,000", total: "68,000,000" },
        { item: "4", desc: "General Wards & ICU Equipping", qty: "150 Beds", rate: "520,000", total: "78,000,000" },
        { item: "5", desc: "Lifts, Backup Generators & Infrastructure", qty: "2 Units", rate: "12,500,000", total: "25,000,000" }
      ],
      timeline: [
        { phase: "Site handover & Excavation", start: "2025-06-15", end: "2025-07-30", status: "Completed" },
        { phase: "Substructure & Framing", start: "2025-08-01", end: "2026-03-30", status: "Ongoing" },
        { phase: "Finishes and M&E Installations", start: "2026-04-01", end: "2026-11-15", status: "Pending" },
        { phase: "Commissioning & Equipping", start: "2026-11-16", end: "2027-01-30", status: "Pending" }
      ],
      procurement: {
        method: "International Competitive Bidding (ICB)",
        published: "2025-03-10",
        bidsReceived: 5,
        engineerEstimate: 360000000
      },
      oversight: {
        committee: "County Hospital Expansion Monitoring Forum",
        chairman: "Dr. Amina Mwangi",
        members: 5,
        meetingsHeld: 1
      }
    },
    {
      id: "PPIP-003",
      project: "Garissa Solar Mini-Grid Phase 1",
      contractor: "SunGrid Africa",
      value: 210000000,
      date: "2025-05-18",
      status: "Ongoing",
      reportUrl: "reports/PPIP-003-Report.pdf",
      summary: "Implementation of a hybrid solar PV mini-grid system to provide clean, reliable, and affordable off-grid electrical power to over 1,200 households and public utilities in rural Garissa.",
      scope: "Installation of a 450kWp solar PV array, a 1.2MWh lithium-ion battery storage vault, backup diesel generator synchronization, and construction of a 12km low-voltage distribution network.",
      boq: [
        { item: "1", desc: "Solar PV Panels & Ground Racking Support", qty: "1,200 Pcs", rate: "35,000", total: "42,000,000" },
        { item: "2", desc: "Battery Energy Storage System (BESS)", qty: "1.2 MWh", rate: "75,000,000", total: "75,000,000" },
        { item: "3", desc: "Hybrid Inverters & Control Systems", qty: "1 System", rate: "28,000,000", total: "28,000,000" },
        { item: "4", desc: "Distribution Poles and Cabling Network", qty: "12 km", rate: "3,500,000", total: "42,000,000" },
        { item: "5", desc: "Civil Works, Fencing & Site Office", qty: "1 Item", rate: "23,000,000", total: "23,000,000" }
      ],
      timeline: [
        { phase: "Land acquisition & Site clearance", start: "2025-06-01", end: "2025-07-10", status: "Completed" },
        { phase: "PV array erection & civil base works", start: "2025-07-15", end: "2025-10-30", status: "Ongoing" },
        { phase: "BESS installation & Powerhouse cabling", start: "2025-11-01", end: "2026-01-15", status: "Pending" },
        { phase: "Grid lines erection & connection testing", start: "2026-01-16", end: "2026-03-30", status: "Pending" }
      ],
      procurement: {
        method: "National Competitive Bidding (NCB)",
        published: "2025-02-18",
        bidsReceived: 11,
        engineerEstimate: 225000000
      },
      oversight: {
        committee: "Garissa Rural Energy Action Council",
        chairman: "Hussein Farah",
        members: 9,
        meetingsHeld: 4
      }
    },
    {
      id: "PPIP-004",
      project: "Kiambu Community Water Project",
      contractor: "AquaWorks Consortium",
      value: 85000000,
      date: "2025-04-11",
      status: "Awarded",
      reportUrl: "reports/PPIP-004-Report.pdf",
      summary: "Drilling of high-yield boreholes, installation of treatment facilities, building of overhead storage tanks, and piping distribution to supply safe drinking water directly to 8,000 residents.",
      scope: "Drilling of 3 high-yield boreholes, installation of hybrid solar pump systems, building of a 150m³ elevated water steel tank, and trenching of a 22km supply network to communal kiosks.",
      boq: [
        { item: "1", desc: "Hydro-geological Survey & Borehole Drilling", qty: "3 Wells", rate: "6,500,000", total: "19,500,000" },
        { item: "2", desc: "Solar Pumps and Filtration Treatment", qty: "3 Sets", rate: "4,800,000", total: "14,400,000" },
        { item: "3", desc: "Elevated Steel Storage Tank (150m³)", qty: "1 Unit", rate: "21,500,000", total: "21,500,000" },
        { item: "4", desc: "Trenching and Supply Pipe Networking", qty: "22 km", rate: "1,150,000", total: "25,300,000" },
        { item: "5", desc: "Water Kiosk & Metering Terminals", qty: "10 Units", rate: "430,000", total: "4,300,000" }
      ],
      timeline: [
        { phase: "Borehole drilling & yield tests", start: "2025-05-01", end: "2025-06-30", status: "Completed" },
        { phase: "Steel tank assembly & foundation", start: "2025-07-01", end: "2025-09-15", status: "Ongoing" },
        { phase: "Piping distribution & solar mount", start: "2025-09-16", end: "2025-11-30", status: "Pending" },
        { phase: "Water kiosk commissioning", start: "2025-12-01", end: "2025-12-20", status: "Pending" }
      ],
      procurement: {
        method: "National Competitive Bidding (NCB)",
        published: "2025-01-20",
        bidsReceived: 9,
        engineerEstimate: 90000000
      },
      oversight: {
        committee: "Kiambu Public Water Oversight Committee",
        chairman: "Mary Wambui",
        members: 6,
        meetingsHeld: 2
      }
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
