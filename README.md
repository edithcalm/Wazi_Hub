# 🌍 WaziHub

**Giving Every Mwananchi a Voice in Governance**

---

## 📖 What is WaziHub?

WaziHub is a digital platform that helps Kenyan citizens participate in governance, understand county budgets, monitor public projects, and engage directly with leaders.

Think of it as a digital baraza where wananchi can:

- Share ideas and concerns
- Track how public money is being used
- Monitor development projects
- Join virtual community meetings
- Report issues in their neighborhoods
- Access government information in a simple way

WaziHub is designed to work on:

- 📱 **Smartphones (Website)**
- 💬 **WhatsApp Chatbot**
- ☎️ **USSD (Feature Phones)**

This ensures that everyone can participate, even without internet access.

---

## 🎯 The Problem

Many citizens want to participate in governance but face challenges such as:

- Lack of access to county budget information
- Limited opportunities to engage with leaders
- Difficulty tracking government projects
- Poor feedback channels
- Low awareness of public participation forums
- Exclusion of citizens without smartphones

As a result, many development decisions happen without meaningful citizen involvement.

---

## 💡 Our Solution

WaziHub brings governance closer to citizens through a single digital platform.

The platform allows citizens to:

- ✅ Understand county budgets
- ✅ Track public projects
- ✅ Participate in Virtual Barazas
- ✅ Access open contracting information
- ✅ Report community issues
- ✅ Share opinions and vote on ideas
- ✅ Receive updates in local languages

---

## 🚀 Key Features

### 1. 📊 Budget Explorer

Citizens can:

- View county budgets
- Explore sector allocations
- Understand where money is being spent

**Example:**

| Sector | Allocation |
|--------|------------|
| Health | Ksh 2 Billion |
| Education | Ksh 1 Billion |
| Infrastructure | Ksh 3 Billion |

### 2. 🏗 Project Monitoring

Track public projects in real time.

Citizens can view:

- Project name
- Location
- Budget allocation
- Progress percentage
- Completion status

**Example:**

- ✔️ Hospital Upgrade – 80% Complete
- ✔️ Road Construction – 65% Complete

### 3. 📑 Open Contracting

Promotes transparency by showing:

- Contractors awarded projects
- Contract values
- Project timelines

This helps reduce corruption and improve accountability.

### 4. 🗣 Virtual Barazas

Virtual Barazas bring traditional community meetings online.

Citizens can:

- 📅 View upcoming meetings
- 🔗 Join live sessions
- 🎥 Watch recordings
- 👍 Rate meetings
- 💬 Share feedback

This ensures participation regardless of location.

### 5. 🚨 Report an Issue

Citizens can report:

- Broken roads
- Water shortages
- Corruption concerns
- Health facility issues
- Environmental problems

Reports can be submitted anonymously.

### 6. 💬 Community Discussion Forum

Citizens can:

- Post ideas
- Discuss local issues
- Upvote useful suggestions
- Comment on proposals

This creates a collaborative civic space.

### 7. 🌍 Multilingual Support

WaziHub supports multiple Kenyan languages:

- English
- Kiswahili
- Gikuyu
- Dholuo
- Kikamba
- Luhya
- Kalenjin
- Somali
- Turkana
- Kimeru

No citizen should be left behind because of language barriers.

---

## 📱 USSD Service

Citizens without internet can dial:

```text
*384*43258#
```

and access:

- Explore Budgets
- Open Contracting
- Project Monitoring
- Report an Issue
- Talk to Support
- Virtual Barazas

---

## 💬 WhatsApp Assistant

The WhatsApp chatbot helps citizens:

- Ask questions about county budgets
- Find project information
- View upcoming barazas
- Access meeting recordings
- Report community concerns

Available 24/7.

**Contact:** [+254 721 606 409](https://wa.me/254721606409?text=Hello%20WaziHub) — say “Hello WaziHub” to start.

---

## 👥 Who Benefits?

| Stakeholder | Benefit |
|-------------|---------|
| **Citizens** | Better access to information and decision-making |
| **County Governments** | Receive real-time citizen feedback |
| **Civil Society Organizations** | Improve public participation efforts |
| **Development Partners** | Access community insights and project feedback |

---

## 🌟 Expected Impact

Through WaziHub, we aim to:

- Increase citizen participation in governance
- Improve transparency in public spending
- Strengthen accountability
- Promote inclusive decision-making
- Improve trust between citizens and government
- Make governance accessible to everyone

---

## 🛠 Technology Stack

### Frontend

- HTML
- CSS
- Bootstrap
- JavaScript

### Backend

- Node.js
- Flask (future integrations)

### Database

- MySQL

### Communication Channels

- Website
- WhatsApp
- USSD

---

## 🔮 Future Enhancements

- AI-powered civic assistant
- Budget analysis dashboards
- County performance rankings
- SMS notifications
- Civic education modules
- Citizen satisfaction analytics
- National government integration

---

## 🤝 Vision

To become Kenya's leading digital civic participation platform, empowering every mwananchi to engage, monitor, and shape development in their community.

---

## 🇰🇪 WaziHub

**"Sauti ya Mwananchi, Nguvu ya Mabadiliko."**  
*(The Citizen's Voice, The Power of Change.)*

**Tagline:** See More • Know More • Do More

---

## Getting Started (This Repository)

This project is deployed as a static site via GitHub Pages and can be **installed as a PWA** on Android/iOS (Add to Home Screen).

### Project structure

```text
Wazi_Hub/
├── index.html          # Main page
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline shell)
├── css/styles.css      # Styles
├── js/                 # Application logic
│   ├── main.js         # Charts, map, barazas
│   ├── i18n.js         # Language switcher
│   ├── utils.js        # Formatting helpers
│   ├── report.js       # Report form (local save)
│   └── pwa.js          # Install prompt + SW registration
├── data/               # Demo datasets
│   ├── i18n.js
│   ├── budget.js
│   ├── projects.js
│   └── barazas-demo.js
└── icons/icon.svg      # App icon
```

### Run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/edithcalm/Wazi_Hub.git
   cd Wazi_Hub
   ```
2. Serve over HTTP (required for service worker):
   ```bash
   npx --yes serve .
   ```
   Or use VS Code **Live Server** (port 5502).
3. Open the URL shown (e.g. `http://localhost:3000`).
4. On your phone: open the same URL → browser menu → **Install app** / **Add to Home screen**.

### Install as PWA

- **Chrome (Android):** Menu → *Install app* (or use the green banner when shown).
- **Safari (iPhone):** Share → *Add to Home Screen*.
- Works offline for the dashboard shell; live API data loads when online.

Push to `main` to trigger the GitHub Actions Pages deploy workflow.

### National budget (Program-Based Budget Book)

Official Treasury data is **PDF-based** (no public API). See **[docs/BUDGET_DATA_INTEGRATION.md](docs/BUDGET_DATA_INTEGRATION.md)** for sources, schema, and how to load the Programme Based Budget into WaziHub. A starter sample lives in `data/pbb-fy2025-26-sample.json`.
