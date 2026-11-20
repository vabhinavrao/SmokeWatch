# SmokeWatch — Industrial Environmental Monitoring & Intelligence Platform

[![Production Deployment](https://img.shields.io/badge/Vercel-smokewatch--telangana.vercel.app-black?logo=vercel&logoColor=white)](https://smokewatch-telangana.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-vabhinavrao%2FSmokeWatch-181717?logo=github&logoColor=white)](https://github.com/vabhinavrao/SmokeWatch)
[![OpenStreetMap](https://img.shields.io/badge/Map-OpenStreetMap-7EBC6F?logo=openstreetmap&logoColor=white)](https://smokewatch-telangana.vercel.app/app)
[![Open-Meteo API](https://img.shields.io/badge/Telemetry-Open--Meteo%20Live-0284c7)](https://open-meteo.com)

> **An Engineering Assessment & IoT Surveillance System for Industrial Emissions, Effluent Streams, and Decarbonization across Greater Hyderabad.**
> Developed for the **Environmental Studies (EVS)** curriculum, Department of Computer Science & Engineering (**CSE-B**), **Hyderabad Institute of Technology and Management (HITAM)**.

---

## 🌟 Overview

**SmokeWatch** is a production-grade environmental intelligence and continuous compliance monitoring system that bridges rigorous academic environmental research with live geospatial telemetry. 

Unlike generic mockups, SmokeWatch connects directly to real atmospheric reanalysis data via the **Open-Meteo Air Quality API**, visualizes industrial zones on **OpenStreetMap (Leaflet.js)**, models statutory **Continuous Emission Monitoring Systems (OCEMS)** and **Central Effluent Treatment Plants (CETPs)** under **TSPCB / CPCB** regulations, and features an engineering-grade **Industrial Decarbonization & Abatement Calculator**.

---

## 🚀 Key Features

### 1. 🗺️ Geospatial Industrial Intelligence (OpenStreetMap)
- Interactive **Leaflet.js** map rendered on sleek **CartoDB Dark Matter / Positron** basemaps.
- High-precision geospatial boundaries and monitoring mast coordinates for 8 key Telangana industrial belts:
  - **Patancheru Industrial Area** — Active pharmaceutical ingredients, bulk drugs, PETL CETP ($7,500\text{ KLD}$).
  - **Jeedimetla Industrial Area** — Chemical formulations, electroplating, JETL CETP ($5,000\text{ KLD}$).
  - **Balanagar Industrial Estate** — Foundries, precision aerospace fabrication, CNC units.
  - **Pashamylaram IDA Phase I-III** — Mega chemical synthesis & biotech park.
  - **Kattedan Industrial Area** — Plastics extrusion, textile dyeing, Mir Alam Tank catchment.
  - **Cherlapally IDA** — Electrical switchgear, clean fabrication, solar PV assembly.
  - **Nacharam & Mallapur IDA** — Food processing, rubber products, commercial manufacturing.
  - **Sanathnagar Industrial Area** — Heavy manufacturing & central CPCB CAAQMS reference station.
- Interactive click-to-inspect, zone boundary highlighting, and custom animated status pins.

### 2. 📡 Real-Time Air Quality API (Open-Meteo)
- Zero-API-key live telemetry fetching real-time atmospheric concentrations:
  - $\text{PM}_{2.5}$ & $\text{PM}_{10}$ (Particulate Matter)
  - $\text{SO}_2$ (Sulphur Dioxide) & $\text{NO}_2$ (Nitrogen Dioxide)
  - $\text{CO}$ (Carbon Monoxide) & Ground-level Ozone ($\text{O}_3$)
  - Indian National Air Quality Index (**NAQI**) & US AQI classifications.
- 15-minute client caching with intelligent offline fallback calibrated to Hyderabad's diurnal temperature inversion cycle.
- High-density **Retina Canvas Sparkline / Trend Chart** displaying 24-hour historical readings and a 12-hour predictive forecast curve with CPCB standard threshold benchmarks.

### 3. 🏭 Industrial Stack OCEMS & CETP Effluent Layer
- Real-time continuous stack emission simulation:
  - Stack opacity (%), Flue gas velocity ($\text{m/s}$), Flue gas $\text{SO}_2$ ($\text{mg/Nm}^3$), and Scrubber differential pressure ($\Delta P\text{ in mmWC}$).
- Wastewater & Common Effluent Treatment metrics:
  - Effluent $\text{pH}$ (TSPCB limit: $6.5 - 8.5$), $\text{BOD}$ ($\le 30\text{ mg/L}$), $\text{COD}$ ($\le 250\text{ mg/L}$), and $\text{TDS}$ ($\le 2100\text{ mg/L}$).

### 4. 📝 Geotagged Incident Audit & Verification Log
- Citizen & field inspector observation reporting.
- Interactive pin dropping by clicking directly on OpenStreetMap.
- Categorized by verified failure mode (*Stack Plume, Unpermitted Effluent Discharge, Solid Sludge Dumping, Fugitive Dust, Toxic Chemical Odor*).
- Lifecycle tracking: *Logged $\rightarrow$ Verified by CAAQMS $\rightarrow$ Dispatched to TSPCB Cell $\rightarrow$ Remediated*.
- Persistent browser storage (`localStorage`).

### 5. 🧮 Decarbonization & Abatement Engineering Calculator
- Computes Scope 1 (diesel generator sets, process coal) and Scope 2 (grid electricity) emissions.
- Calibrated to the **Central Electricity Authority (CEA) India CO2 baseline database** ($0.71\text{ kg CO}_2\text{e/kWh}$) and **CPCB fuel factors** ($2.68\text{ kg CO}_2/\text{L}$ diesel, $2.42\text{ kg CO}_2/\text{kg}$ coal).
- Dynamically models engineering abatement interventions:
  - Waste heat recovery & Variable Frequency Drives (VFD).
  - Captive rooftop solar PV generation ($\text{kWp}$).
  - Baghouse & wet scrubber capture efficiency ($\%$).
- Outputs net abated tonnes $\text{CO}_2\text{e}$, particulate matter diverted ($\text{kg/month}$), annual mature tree offset equivalent, and industrial HT tariff savings ($\text{INR}$).

### 6. 🎓 Academic EVS Research Portal
- Dedicated web portal (`index.html`) translating the 18-slide academic PPT into a modern interactive research paper.
- Comprehensive **5-Unit EVS Analysis** (Environment, Natural Resources, Ecosystems, Pollution, Sustainable Development).
- **Simplified EIA / EMP Risk Matrix** addressing equipment failure, sludge disposal, and occupational safety.
- **UN SDG Mapping** covering SDGs 3, 6, 9, 12, 13, and 15 with quantitative targets.
- **Four-Year Continuation Roadmap** for future engineering cohorts.

---

## 📂 Project Architecture

```
SmokeWatch/
├── index.html                           # Academic Research & EVS Project Portal
├── app.html                             # SmokeWatch Live Operations & Telemetry Platform
├── assets/
│   ├── css/
│   │   ├── common.css                   # Design tokens, typography, badges, inputs
│   │   ├── portal.css                   # Portal hero, 5-unit EVS tabs, EIA matrix, SDGs
│   │   └── app.css                      # Dual-pane operations console, Leaflet markers, chart
│   └── js/
│       ├── data.js                      # Hyderabad zones, CPCB/TSPCB standards, seed incidents
│       ├── api.js                       # Open-Meteo Air Quality client + caching + fallback
│       ├── chart.js                     # High-density Retina Canvas Bezier spline trend chart
│       ├── calculator.js                # Scope 1 & 2 carbon & particulate abatement engine
│       ├── reports.js                   # Geotagged incident audit manager & localStorage sync
│       ├── map.js                       # Leaflet OpenStreetMap engine, CartoDB tiles, custom markers
│       ├── app.js                       # Operations platform coordinator & event bus
│       └── portal.js                    # Research portal live hero preview & tab switcher
├── legacy/                              # Preserved original HTML templates
│   ├── Industrial Pollution & Global Warming — EVS Project (2).html
│   └── SmokeWatch – Industrial Pollution Tracker.html
├── Industrial_Pollution_EVS_Assessment_Complete_17_Sections.pptx # Primary academic presentation
└── README.md                            # Complete engineering & project documentation
```

---

## 💻 How to Run Locally

Because SmokeWatch is built with zero-build-step modern web standards, you can run it instantly using any static web server:

### Option A: Python 3 Built-in Server (Recommended)
```bash
# Navigate to the project directory
cd /Users/abhinavrao/Downloads/SmokeWatch

# Start local server on port 8000
python3 -m http.server 8000
```
Then open your browser to:
- **Research Portal:** [http://localhost:8000/index.html](http://localhost:8000/index.html)
- **Live Operations Platform:** [http://localhost:8000/app.html](http://localhost:8000/app.html)

### Option B: Direct File Opening
Double-click `index.html` or `app.html` in your file browser (Finder / Explorer) to open directly in Chrome, Safari, Firefox, or Edge.

---

## 👥 Student Research Authors (HITAM)

- **Institution:** Hyderabad Institute of Technology and Management (HITAM)
- **Department:** Computer Science & Engineering (Class **CSE-B**)
- **Course:** Environmental Studies (EVS)
- **Selected Challenge Track:** Environmental Protection and Climate Action

| Name | Roll Number | Role |
| :--- | :--- | :--- |
| **Bhavana Reddy** | `26E51A0564` | Research Lead & Problem Formulation |
| **Anwita Jayanthi** | `26E51A05B2` | Hydrological Effluent & CETP Data Modeling |
| **Upendhar Chary** | `26E51A05C2` | Decarbonization & Abatement Engineering Math |
| **Pranith Reddy** | `26E51A0592` | Atmospheric Chemistry & CPCB NAAQS Benchmarking |
| **Vishwak Reddy** | `26E51A05B4` | Geospatial GIS & Industrial Zone Boundaries |
| **Harshit Jala** | `26E51A05B0` | EIA/EMP Risk Assessment & Regulatory Synthesis |

---

## 📜 Regulatory Reference Standards

1. **Central Pollution Control Board (CPCB)**: *National Ambient Air Quality Standards (NAAQS)*, Notification No. B-29016/20/90/PCI-L.
2. **Telangana State Pollution Control Board (TSPCB)**: *General Standards for Discharge of Environmental Pollutants — Part-A: Effluents (Schedule VI)*.
3. **Central Electricity Authority (CEA), Ministry of Power, Govt. of India**: *CO2 Baseline Database for the Indian Power Sector, User Guide Version 19.0*.
4. **United Nations**: *Department of Economic and Social Affairs — Sustainable Development Goals (SDGs 3, 6, 9, 12, 13, 15)*.
