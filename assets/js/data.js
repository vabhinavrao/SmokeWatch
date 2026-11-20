/**
 * SmokeWatch - Hyderabad Industrial Zones & Environmental Standards Data
 * Aligned with HITAM CSE-B EVS Assessment & CPCB / TSPCB Norms
 */

const HYDERABAD_ZONES = [
  {
    id: "patancheru",
    name: "Patancheru Industrial Area",
    zoneType: "Major Bulk Drugs & Chemical Belt",
    lat: 17.5323,
    lon: 78.2642,
    radius: 4200,
    areaKm2: 32.5,
    activeUnits: 380,
    caaqmsStation: "TSPCB / ICRISAT Continuous Station",
    cetpName: "Patancheru Enviro Tech Ltd (PETL)",
    cetpCapacity: "7,500 KLD",
    primaryPollutants: ["VOCs", "SO₂", "PM2.5", "High COD Effluents", "Ammoniacal Nitrogen"],
    keyIndustries: "Active Pharmaceutical Ingredients (APIs), Synthetic Organics, Bulk Chemicals, Heavy Metallurgy",
    criticalReceivingBody: "Nakkavagu Stream & Manjira River Basin",
    baselineAirIndex: 148,
    // Real-time industrial telemetry simulation targets (OCEMS)
    stackMetrics: {
      flueGasVelocity: 14.2, // m/s
      opacityPercent: 28.5,   // %
      stackSO2: 480,          // mg/Nm³ (CPCB Limit: 600)
      stackNOx: 290,          // mg/Nm³ (CPCB Limit: 400)
      scrubberDeltaP: 155,    // mmWC (Normal: 130-180)
      scrubberStatus: "Active - Alkaline Spray Operational"
    },
    effluentMetrics: {
      ph: 7.4,                // Standard: 6.5 - 8.5
      bod: 28,                // mg/L (TSPCB Limit: 30)
      cod: 215,               // mg/L (TSPCB Limit: 250)
      tss: 82,                // mg/L (TSPCB Limit: 100)
      tds: 1850,              // mg/L (TSPCB Limit: 2100)
      flowRate: 260,          // m³/hr
      treatmentStage: "Tertiary RO Permeate & Multi-Effect Evaporator (ZLD)"
    },
    suggestedControls: "Zero Liquid Discharge (ZLD) enforcement, Regenerative Thermal Oxidizers (RTOs) for VOCs, and Continuous Stack Opacity Telemetry.",
    complianceRating: "Moderate Caution"
  },
  {
    id: "jeedimetla",
    name: "Jeedimetla Industrial Area",
    zoneType: "Chemical Formulations & Engineering Cluster",
    lat: 17.5186,
    lon: 78.4619,
    radius: 3500,
    areaKm2: 24.8,
    activeUnits: 460,
    caaqmsStation: "Jeedimetla Industrial Association CAAQMS",
    cetpName: "Jeedimetla Effluent Treatment Ltd (JETL)",
    cetpCapacity: "5,000 KLD",
    primaryPollutants: ["PM10", "Acid Mists", "NO₂", "Heavy Metals (Cr, Ni)", "Phenolic Waste"],
    keyIndustries: "Paint & Pigments, Electroplating, Dyes & Intermediates, Precision Machine Tools",
    criticalReceivingBody: "Shapur Nala / Hussain Sagar Catchment",
    baselineAirIndex: 162,
    stackMetrics: {
      flueGasVelocity: 12.8,
      opacityPercent: 36.2,
      stackSO2: 520,
      stackNOx: 340,
      scrubberDeltaP: 124, // Low scrubber differential pressure warning
      scrubberStatus: "Attention Required - Venturi Scrubber Inspection Due"
    },
    effluentMetrics: {
      ph: 8.2,
      bod: 34,                // Exceedance of 30 mg/L
      cod: 275,               // Exceedance of 250 mg/L
      tss: 94,
      tds: 2190,              // Exceedance of 2100 mg/L
      flowRate: 195,
      treatmentStage: "Secondary Biological Aeration & Clarifier"
    },
    suggestedControls: "Automated pH neutralizing dosing, mandatory venturi scrubbers on acid pickling lines, and digital gate passes for hazardous sludge.",
    complianceRating: "High Watch"
  },
  {
    id: "balanagar",
    name: "Balanagar Industrial Estate",
    zoneType: "Foundries & Heavy Precision Engineering",
    lat: 17.4721,
    lon: 78.4418,
    radius: 2800,
    areaKm2: 18.2,
    activeUnits: 310,
    caaqmsStation: "TSPCB Balanagar Metro Station",
    cetpName: "Decentralized Neutralization Tanks",
    cetpCapacity: "1,800 KLD",
    primaryPollutants: ["PM2.5", "PM10", "Carbon Monoxide", "Silica Dust", "Waste Coolants"],
    keyIndustries: "Aerospace Component Machining, Ferrous & Non-Ferrous Foundries, Glass Moulding",
    criticalReceivingBody: "Kukatpally Drainage Canal",
    baselineAirIndex: 135,
    stackMetrics: {
      flueGasVelocity: 16.5,
      opacityPercent: 22.0,
      stackSO2: 310,
      stackNOx: 215,
      scrubberDeltaP: 160,
      scrubberStatus: "Nominal - Baghouse Filtration Active"
    },
    effluentMetrics: {
      ph: 7.1,
      bod: 18,
      cod: 140,
      tss: 65,
      tds: 1420,
      flowRate: 85,
      treatmentStage: "Oil-Water Separation & Chemical Coagulation"
    },
    suggestedControls: "Pulse-jet baghouse collectors on induction furnaces, acoustic dampeners on heavy drop hammers, and coolant oil recycling.",
    complianceRating: "Compliant"
  },
  {
    id: "pashamylaram",
    name: "Pashamylaram IDA Phase I-III",
    zoneType: "Mega Chemical & Biotech Park",
    lat: 17.5375,
    lon: 78.1884,
    radius: 3800,
    areaKm2: 29.0,
    activeUnits: 220,
    caaqmsStation: "Pashamylaram Phase-II Monitoring Mast",
    cetpName: "Dedicated ZLD Pipeline to PETL & Onsite MEE",
    cetpCapacity: "4,000 KLD",
    primaryPollutants: ["Solvent VOCs", "Particulate Matter", "SO₂ from Coal Boilers", "Ammonia"],
    keyIndustries: "Export Formulation Facilities, Biotech Intermediates, Specialty Polymers",
    criticalReceivingBody: "Nakkavagu Tributary Corridor",
    baselineAirIndex: 118,
    stackMetrics: {
      flueGasVelocity: 13.5,
      opacityPercent: 19.8,
      stackSO2: 340,
      stackNOx: 180,
      scrubberDeltaP: 172,
      scrubberStatus: "Nominal - Multi-stage Cyclones & Scrubbers"
    },
    effluentMetrics: {
      ph: 7.3,
      bod: 14,
      cod: 120,
      tss: 45,
      tds: 1100,
      flowRate: 140,
      treatmentStage: "Membrane Bioreactor (MBR) + Reverse Osmosis"
    },
    suggestedControls: "VOC fugitive emission infrared imaging, mandatory biomass transition for industrial steam boilers.",
    complianceRating: "Compliant"
  },
  {
    id: "kattedan",
    name: "Kattedan Industrial Area",
    zoneType: "Plastics, Textiles & Edible Oils",
    lat: 17.3210,
    lon: 78.4385,
    radius: 3100,
    areaKm2: 16.5,
    activeUnits: 290,
    caaqmsStation: "TSPCB South Zone Station",
    cetpName: "Kattedan Biological Treatment Facility",
    cetpCapacity: "3,200 KLD",
    primaryPollutants: ["Pyrolysis Smoke", "Plastic VOCs", "Suspended Solids", "High COD Washings"],
    keyIndustries: "Plastic Pelletizing & Extrusion, Dye Washing, Spent Oil Refining",
    criticalReceivingBody: "Mir Alam Tank Wetland System",
    baselineAirIndex: 154,
    stackMetrics: {
      flueGasVelocity: 11.2,
      opacityPercent: 33.4,
      stackSO2: 460,
      stackNOx: 275,
      scrubberDeltaP: 138,
      scrubberStatus: "Active - Carbon Bed Filter Operational"
    },
    effluentMetrics: {
      ph: 7.9,
      bod: 29,
      cod: 238,
      tss: 96,
      tds: 1980,
      flowRate: 110,
      treatmentStage: "Extended Aeration Lagoon & Clarification"
    },
    suggestedControls: "Strict prohibition of low-grade fuel combustion, scrubbers on plastic extrusion exhausts, and effluent pre-treatment.",
    complianceRating: "Moderate Caution"
  },
  {
    id: "cherlapally",
    name: "Cherlapally Industrial Development Area",
    zoneType: "Electrical Machinery & Clean Fabrication",
    lat: 17.4682,
    lon: 78.5991,
    radius: 3600,
    areaKm2: 26.0,
    activeUnits: 340,
    caaqmsStation: "East Hyderabad Industrial Air Monitor",
    cetpName: "Cherlapally Industrial Park ETP",
    cetpCapacity: "2,500 KLD",
    primaryPollutants: ["PM10 Dust", "Welding Fumes", "Packaging Scrap", "Low-strength Effluents"],
    keyIndustries: "Electrical Switchgear, Food Packaging, Solar PV Panel Assembly, Cable Fabrication",
    criticalReceivingBody: "Kapra Lake Catchment Canal",
    baselineAirIndex: 92,
    stackMetrics: {
      flueGasVelocity: 9.8,
      opacityPercent: 14.5,
      stackSO2: 180,
      stackNOx: 140,
      scrubberDeltaP: 150,
      scrubberStatus: "Nominal - HEPA Exhaust & Fume Extractors"
    },
    effluentMetrics: {
      ph: 7.2,
      bod: 12,
      cod: 85,
      tss: 38,
      tds: 920,
      flowRate: 70,
      treatmentStage: "Secondary Settling & Sand Filter Bed"
    },
    suggestedControls: "Rooftop solar expansion, ISO 14001 certification audits, and factory perimeter green buffers.",
    complianceRating: "Compliant"
  },
  {
    id: "nacharam",
    name: "Nacharam & Mallapur IDA",
    zoneType: "Mixed Light Manufacturing & Food Processing",
    lat: 17.4338,
    lon: 78.5583,
    radius: 3000,
    areaKm2: 19.5,
    activeUnits: 270,
    caaqmsStation: "Nacharam Industrial Air Station",
    cetpName: "Nacharam Industrial Drainage Network",
    cetpCapacity: "2,200 KLD",
    primaryPollutants: ["Organic Odors", "Boiler Particulates", "High Organic Loading (BOD)"],
    keyIndustries: "Commercial Food Processing, Rubber Products, Electrical Accessories",
    criticalReceivingBody: "Musi River North Drainage",
    baselineAirIndex: 104,
    stackMetrics: {
      flueGasVelocity: 12.0,
      opacityPercent: 21.0,
      stackSO2: 290,
      stackNOx: 195,
      scrubberDeltaP: 145,
      scrubberStatus: "Nominal - Cyclone Collector Operating"
    },
    effluentMetrics: {
      ph: 6.8,
      bod: 26,
      cod: 190,
      tss: 78,
      tds: 1350,
      flowRate: 95,
      treatmentStage: "Dissolved Air Flotation (DAF) & Bio-Reactor"
    },
    suggestedControls: "Bio-filters for odor suppression, upgrading diesel fire-tube boilers to piped gas (PNG).",
    complianceRating: "Compliant"
  },
  {
    id: "sanathnagar",
    name: "Sanathnagar Industrial Area",
    zoneType: "Historic Heavy Engineering Corridor",
    lat: 17.4583,
    lon: 78.4350,
    radius: 2500,
    areaKm2: 14.0,
    activeUnits: 190,
    caaqmsStation: "TSPCB Sanathnagar Central Station (CPCB Reference)",
    cetpName: "Sanathnagar Regional Sewage-Effluent Trunk",
    cetpCapacity: "3,000 KLD",
    primaryPollutants: ["PM2.5", "NO₂", "SO₂", "Combustion Flyash"],
    keyIndustries: "Structural Steel Works, Commercial Glass Works, Industrial Warehouses",
    criticalReceivingBody: "Hussain Sagar Western Inlet Canal",
    baselineAirIndex: 126,
    stackMetrics: {
      flueGasVelocity: 15.1,
      opacityPercent: 24.2,
      stackSO2: 360,
      stackNOx: 230,
      scrubberDeltaP: 158,
      scrubberStatus: "Nominal - Electrostatic Precipitator (ESP)"
    },
    effluentMetrics: {
      ph: 7.5,
      bod: 22,
      cod: 165,
      tss: 72,
      tds: 1510,
      flowRate: 115,
      treatmentStage: "Chemical Neutralization & Clarification"
    },
    suggestedControls: "Continuous stack opacity transmission to TSPCB, road dust suppression via mechanized mist sprayers.",
    complianceRating: "Compliant"
  }
];

// CPCB National Ambient Air Quality Standards (NAAQS) 24-Hour Limits
const CPCB_STANDARDS = {
  pm2_5: { limit: 60, unit: "µg/m³", desc: "Particulate Matter < 2.5 µm" },
  pm10: { limit: 100, unit: "µg/m³", desc: "Particulate Matter < 10 µm" },
  so2: { limit: 80, unit: "µg/m³", desc: "Sulphur Dioxide" },
  no2: { limit: 80, unit: "µg/m³", desc: "Nitrogen Dioxide" },
  co: { limit: 2000, unit: "µg/m³", desc: "Carbon Monoxide (8-hour)" },
  ozone: { limit: 100, unit: "µg/m³", desc: "Ground-level Ozone (8-hour)" }
};

// TSPCB Industrial Effluent Discharge Standards (Inland Surface Water)
const TSPCB_EFFLUENT_STANDARDS = {
  ph: { min: 6.5, max: 8.5, unit: "pH units" },
  bod: { limit: 30, unit: "mg/L", desc: "Biochemical Oxygen Demand (3 days at 27°C)" },
  cod: { limit: 250, unit: "mg/L", desc: "Chemical Oxygen Demand" },
  tss: { limit: 100, unit: "mg/L", desc: "Total Suspended Solids" },
  tds: { limit: 2100, unit: "mg/L", desc: "Total Dissolved Solids" }
};

// Pre-seeded Citizen & Field Verification Incidents
const INITIAL_INCIDENTS = [
  {
    id: "INC-2026-0814",
    title: "Dense Black Smoke from Boiler Stack",
    zoneId: "jeedimetla",
    zoneName: "Jeedimetla Industrial Area",
    category: "Flue Gas / Stack Emission",
    severity: "High",
    timestamp: "2026-11-20T14:15:00",
    timeAgo: "4 hours ago",
    lat: 17.5194,
    lon: 78.4632,
    description: "Continuous heavy particulate plume observed from a chemical dye unit stack along Phase-III main road. Possible scrubber bypass during boiler startup.",
    verificationStatus: "Verified by CAAQMS Monitor",
    statusBadge: "verified",
    assignedTo: "TSPCB Regional Office (Medchal-Malkajgiri)",
    actionNote: "Automated trigger sent to OCEMS server. Inspector dispatched."
  },
  {
    id: "INC-2026-0811",
    title: "Foaming Effluent in Drainage Culvert",
    zoneId: "patancheru",
    zoneName: "Patancheru Industrial Area",
    category: "Industrial Effluent Bypass",
    severity: "Critical",
    timestamp: "2026-11-20T09:40:00",
    timeAgo: "9 hours ago",
    lat: 17.5348,
    lon: 78.2615,
    description: "Yellowish discolored runoff with pungent solvent odor discharging into storm drain feeding Nakkavagu stream near boundary gate 4.",
    verificationStatus: "Under Field Investigation",
    statusBadge: "investigating",
    assignedTo: "PETL Surveillance Squad & TSPCB Taskforce",
    actionNote: "Water sample collected for BOD/COD and heavy metal testing."
  },
  {
    id: "INC-2026-0805",
    title: "Illegal Plastic Pyrolysis & Scrap Burning",
    zoneId: "kattedan",
    zoneName: "Kattedan Industrial Area",
    category: "Solid Waste & Open Burning",
    severity: "High",
    timestamp: "2026-11-19T18:20:00",
    timeAgo: "Yesterday",
    lat: 17.3195,
    lon: 78.4410,
    description: "Acrid black smoke and strong plastic burning smell impacting adjacent residential wards near Mailardevpally.",
    verificationStatus: "Remediation Enforced",
    statusBadge: "resolved",
    assignedTo: "GHMC Sanitation & PCB South Enforcement",
    actionNote: "Unlicensed scrap reprocessing fire extinguished. Penalty notice issued."
  },
  {
    id: "INC-2026-0798",
    title: "Fugitive Silica Dust from Foundry Sand Plant",
    zoneId: "balanagar",
    zoneName: "Balanagar Industrial Estate",
    category: "Fugitive Dust & Air Quality",
    severity: "Moderate",
    timestamp: "2026-11-18T16:00:00",
    timeAgo: "2 days ago",
    lat: 17.4735,
    lon: 78.4398,
    description: "Sand handling conveyer operating without water mist sprays, causing ambient PM10 spike near metro corridor.",
    verificationStatus: "Remediation Enforced",
    statusBadge: "resolved",
    assignedTo: "Balanagar Industrial Association Safety Cell",
    actionNote: "Misting sprays repaired and enclosed hood reinstated."
  }
];

// Helper functions for air quality index classification based on Indian National AQI norms
function getNAQICategory(aqiValue) {
  if (aqiValue <= 50) return { category: "Good", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)" };
  if (aqiValue <= 100) return { category: "Satisfactory", color: "#34d399", bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.3)" };
  if (aqiValue <= 200) return { category: "Moderate", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" };
  if (aqiValue <= 300) return { category: "Poor", color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.3)" };
  if (aqiValue <= 400) return { category: "Very Poor", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.3)" };
  return { category: "Severe / Hazardous", color: "#b91c1c", bg: "rgba(185, 28, 28, 0.18)", border: "rgba(185, 28, 28, 0.4)" };
}
