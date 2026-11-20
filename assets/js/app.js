/**
 * SmokeWatch - Main Application Orchestrator
 * Connects Leaflet Map, Live Open-Meteo Air Quality API, Canvas Trend Chart,
 * Incident Audit Manager, and Decarbonization Abatement Calculator.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    activeZone: HYDERABAD_ZONES[0], // Default: Patancheru
    activeMetric: "pm2_5",
    activeMetricLabel: "PM2.5",
    activeMetricUnit: "µg/m³",
    activeMetricLimit: 60,
    theme: localStorage.getItem("smokewatch_theme") || "dark",
    isPickModeActive: false,
    pickedCoords: null
  };

  // Set Theme on Root Element
  document.documentElement.setAttribute("data-theme", state.theme);

  // Initialize Canvas Trend Chart
  const chartCanvas = document.getElementById("telemetry-chart");
  const trendChart = new TelemetryTrendChart(chartCanvas, {
    metricKey: state.activeMetric,
    metricLabel: state.activeMetricLabel,
    unit: state.activeMetricUnit,
    thresholdLimit: state.activeMetricLimit
  });

  // Initialize Leaflet Map
  const mapEngine = new SmokeWatchMap("map-container", {
    theme: state.theme,
    onZoneSelected: (zone) => {
      selectZone(zone);
    },
    onLocationPicked: (lat, lon) => {
      state.pickedCoords = { lat, lon };
      const latInput = document.getElementById("rep-lat");
      const lonInput = document.getElementById("rep-lon");
      if (latInput && lonInput) {
        latInput.value = lat.toFixed(4);
        lonInput.value = lon.toFixed(4);
      }
      const pickFeedback = document.getElementById("pick-coords-feedback");
      if (pickFeedback) {
        pickFeedback.textContent = `Coordinates selected: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
        pickFeedback.style.color = "#38bdf8";
      }
    }
  });

  // Render Zone Selection Chips
  renderZoneChips();

  // Initial Load of Default Zone
  selectZone(state.activeZone);

  // Render Initial Incidents
  renderIncidentsList();
  mapEngine.renderIncidents(IncidentReportsManager.getAllIncidents());

  // Subscribe to Incident Changes
  IncidentReportsManager.onReportChange((updatedIncidents) => {
    renderIncidentsList();
    mapEngine.renderIncidents(updatedIncidents);
  });

  // Initialize Decarbonization Calculator
  initCalculator();

  // Setup Event Listeners
  setupNavigation();
  setupMetricButtons();
  setupIncidentForm();
  setupThemeToggle();

  // Start Real-Time Clock
  startLiveClock();

  /**
   * Zone Selection Handler
   */
  async function selectZone(zone) {
    state.activeZone = zone;

    // Update active chip UI
    document.querySelectorAll(".zone-chip").forEach(chip => {
      chip.classList.toggle("is-active", chip.dataset.zone === zone.id);
    });

    // Update Map
    mapEngine.selectZone(zone.id, false);

    // Update Zone Info in Telemetry Card
    document.getElementById("zone-name").textContent = zone.name;
    document.getElementById("zone-type-badge").textContent = zone.zoneType;
    document.getElementById("zone-station-name").textContent = zone.caaqmsStation;

    // Update Static / OCEMS Metrics from Data Model
    updateIndustrialTelemetryPanels(zone);

    // Fetch Live Open-Meteo Air Telemetry
    const telemetryStatusEl = document.getElementById("telemetry-source-badge");
    if (telemetryStatusEl) {
      telemetryStatusEl.textContent = "Fetching Live CAAQMS Telemetry...";
      telemetryStatusEl.className = "badge badge-neutral";
    }

    try {
      const data = await SmokeWatchAPI.getAirQuality(zone.lat, zone.lon, zone.id);
      
      // Update Live UI Cards
      updateAirQualityCards(data);

      // Update Chart
      trendChart.setData(data.trend, {
        metricKey: state.activeMetric,
        metricLabel: state.activeMetricLabel,
        unit: state.activeMetricUnit,
        thresholdLimit: state.activeMetricLimit
      });

      // Update Map Marker with fresh AQI
      mapEngine.updateZoneLiveMetrics(zone.id, data.current);

      if (telemetryStatusEl) {
        telemetryStatusEl.textContent = data.isLive ? "Live Open-Meteo / CAAQMS Telemetry" : "Calibrated In-Situ Model";
        telemetryStatusEl.className = data.isLive ? "badge badge-good" : "badge badge-moderate";
      }
    } catch (err) {
      console.error("[SmokeWatch] Failed to update air telemetry:", err);
    }
  }

  /**
   * Updates Ambient Air UI cards with fetched data
   */
  function updateAirQualityCards(data) {
    const cur = data.current;
    const aqiNumEl = document.getElementById("aqi-hero-val");
    const aqiTagEl = document.getElementById("aqi-naqi-tag");
    const aqiSubEl = document.getElementById("aqi-hero-subtext");

    if (aqiNumEl) {
      aqiNumEl.textContent = cur.aqi;
      aqiNumEl.style.color = cur.naqiColor;
    }

    if (aqiTagEl) {
      aqiTagEl.textContent = cur.naqiCategory;
      aqiTagEl.style.backgroundColor = cur.naqiBg;
      aqiTagEl.style.color = cur.naqiColor;
      aqiTagEl.style.border = `1px solid ${cur.naqiColor}44`;
    }

    if (aqiSubEl) {
      aqiSubEl.textContent = `CPCB NAAQS Baseline: ${cur.pm2_5} µg/m³ PM2.5 · Station synced`;
    }

    // Update 6 Pollutant Chips
    setPollutantChip("pm2_5", cur.pm2_5, CPCB_STANDARDS.pm2_5.limit, "µg/m³");
    setPollutantChip("pm10", cur.pm10, CPCB_STANDARDS.pm10.limit, "µg/m³");
    setPollutantChip("so2", cur.so2, CPCB_STANDARDS.so2.limit, "µg/m³");
    setPollutantChip("no2", cur.no2, CPCB_STANDARDS.no2.limit, "µg/m³");
    setPollutantChip("co", cur.co, CPCB_STANDARDS.co.limit, "µg/m³");
    setPollutantChip("ozone", cur.ozone, CPCB_STANDARDS.ozone.limit, "µg/m³");
  }

  function setPollutantChip(id, val, limit, unit) {
    const valEl = document.getElementById(`val-${id}`);
    const badgeEl = document.getElementById(`badge-${id}`);
    if (valEl) valEl.textContent = val;
    if (badgeEl) {
      const isExceeded = val > limit;
      badgeEl.textContent = isExceeded ? "Exceeded" : "Within Norm";
      badgeEl.className = `badge mono ${isExceeded ? "badge-severe" : "badge-good"}`;
    }
  }

  /**
   * Updates Stack OCEMS & CETP panels
   */
  function updateIndustrialTelemetryPanels(zone) {
    // Stack Metrics
    document.getElementById("stack-opacity").textContent = `${zone.stackMetrics.opacityPercent}%`;
    document.getElementById("stack-so2").textContent = `${zone.stackMetrics.stackSO2} mg/Nm³`;
    document.getElementById("stack-deltap").textContent = `${zone.stackMetrics.scrubberDeltaP} mmWC`;
    document.getElementById("stack-status").textContent = zone.stackMetrics.scrubberStatus;

    // Effluent Metrics
    document.getElementById("effluent-ph").textContent = `${zone.effluentMetrics.ph}`;
    document.getElementById("effluent-bod").textContent = `${zone.effluentMetrics.bod} mg/L`;
    document.getElementById("effluent-cod").textContent = `${zone.effluentMetrics.cod} mg/L`;
    document.getElementById("effluent-tds").textContent = `${zone.effluentMetrics.tds} mg/L`;
    document.getElementById("cetp-name-val").textContent = `${zone.cetpName} (${zone.cetpCapacity})`;
    document.getElementById("effluent-stage").textContent = zone.effluentMetrics.treatmentStage;

    // Controls text
    document.getElementById("zone-controls-desc").textContent = zone.suggestedControls;
  }

  /**
   * Render Horizontal Zone Selector Chips
   */
  function renderZoneChips() {
    const container = document.getElementById("zone-chips-container");
    if (!container) return;
    container.innerHTML = "";

    HYDERABAD_ZONES.forEach(zone => {
      const chip = document.createElement("button");
      chip.className = "zone-chip";
      chip.dataset.zone = zone.id;
      chip.textContent = zone.name.replace(" Industrial Area", "").replace(" Industrial Estate", "").replace(" IDA Phase I-III", "");
      chip.addEventListener("click", () => {
        selectZone(zone);
        mapEngine.selectZone(zone.id, true);
      });
      container.appendChild(chip);
    });
  }

  /**
   * Metric switch buttons for trend chart
   */
  function setupMetricButtons() {
    const buttons = document.querySelectorAll(".trend-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const mKey = btn.dataset.metric;
        state.activeMetric = mKey;

        if (mKey === "pm2_5") {
          state.activeMetricLabel = "PM2.5";
          state.activeMetricUnit = "µg/m³";
          state.activeMetricLimit = CPCB_STANDARDS.pm2_5.limit;
        } else if (mKey === "pm10") {
          state.activeMetricLabel = "PM10";
          state.activeMetricUnit = "µg/m³";
          state.activeMetricLimit = CPCB_STANDARDS.pm10.limit;
        } else if (mKey === "so2") {
          state.activeMetricLabel = "SO₂";
          state.activeMetricUnit = "µg/m³";
          state.activeMetricLimit = CPCB_STANDARDS.so2.limit;
        } else if (mKey === "aqi") {
          state.activeMetricLabel = "AQI";
          state.activeMetricUnit = "Index";
          state.activeMetricLimit = 100;
        }

        trendChart.setMetric(state.activeMetric, state.activeMetricLabel, state.activeMetricUnit, state.activeMetricLimit);
      });
    });
  }

  /**
   * Tab Navigation
   */
  function setupNavigation() {
    const tabButtons = document.querySelectorAll(".sidebar-tab-btn");
    const tabContents = document.querySelectorAll(".sidebar-tab-content");

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.tab;
        tabButtons.forEach(b => b.classList.remove("is-active"));
        tabContents.forEach(c => c.classList.remove("is-active"));

        btn.classList.add("is-active");
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add("is-active");
      });
    });

    // Layer toggles on map
    const layerIncidentsBtn = document.getElementById("toggle-layer-incidents");
    if (layerIncidentsBtn) {
      layerIncidentsBtn.addEventListener("click", () => {
        const isActive = layerIncidentsBtn.classList.toggle("is-active");
        if (mapEngine.incidentMarkersGroup) {
          if (isActive) {
            mapEngine.map.addLayer(mapEngine.incidentMarkersGroup);
          } else {
            mapEngine.map.removeLayer(mapEngine.incidentMarkersGroup);
          }
        }
      });
    }

    const toggleOsmStyleBtn = document.getElementById("toggle-osm-style");
    if (toggleOsmStyleBtn) {
      toggleOsmStyleBtn.addEventListener("click", () => {
        const pane = document.querySelector(".map-viewport .leaflet-tile-pane");
        if (pane) {
          const isNatural = pane.style.filter === "none";
          pane.style.filter = isNatural ? "" : "none";
          toggleOsmStyleBtn.classList.toggle("is-active", !isNatural);
        }
      });
    }

    const fitBoundsBtn = document.getElementById("btn-fit-bounds");
    if (fitBoundsBtn) {
      fitBoundsBtn.addEventListener("click", () => {
        mapEngine.fitAllZones();
      });
    }
  }

  /**
   * Incidents Feed Rendering
   */
  function renderIncidentsList() {
    const listContainer = document.getElementById("incidents-list-container");
    if (!listContainer) return;

    const incidents = IncidentReportsManager.getAllIncidents();
    listContainer.innerHTML = incidents.map(inc => `
      <div class="incident-item-card">
        <div class="incident-card-top">
          <span class="incident-id">${inc.id}</span>
          <span class="badge ${getStatusBadgeClass(inc.statusBadge)}">${inc.verificationStatus}</span>
        </div>
        <h4 class="incident-card-title">${inc.title}</h4>
        <p class="incident-card-desc">${inc.description}</p>
        <div class="incident-card-footer">
          <span>${inc.zoneName} · ${inc.category}</span>
          <span class="mono">${inc.timeAgo}</span>
        </div>
      </div>
    `).join("");
  }

  function getStatusBadgeClass(badge) {
    if (badge === "verified") return "badge-severe";
    if (badge === "resolved") return "badge-good";
    return "badge-moderate";
  }

  /**
   * Incident Form Submission & Map Location Picker
   */
  function setupIncidentForm() {
    const form = document.getElementById("new-incident-form");
    const pickBtn = document.getElementById("btn-pick-location");
    const zoneSelect = document.getElementById("rep-zone-select");

    // Populate zone dropdown
    if (zoneSelect) {
      zoneSelect.innerHTML = HYDERABAD_ZONES.map(z => `<option value="${z.id}">${z.name}</option>`).join("");
    }

    if (pickBtn) {
      pickBtn.addEventListener("click", () => {
        state.isPickModeActive = true;
        pickBtn.textContent = "Click on map to drop pin...";
        pickBtn.classList.add("btn-primary");
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("rep-title").value.trim();
        const zoneId = zoneSelect.value;
        const selectedZoneObj = HYDERABAD_ZONES.find(z => z.id === zoneId) || state.activeZone;
        const category = document.getElementById("rep-category").value;
        const severity = document.getElementById("rep-severity").value;
        const desc = document.getElementById("rep-desc").value.trim();
        const lat = parseFloat(document.getElementById("rep-lat").value) || selectedZoneObj.lat;
        const lon = parseFloat(document.getElementById("rep-lon").value) || selectedZoneObj.lon;

        if (!title || !desc) {
          alert("Please provide an incident title and observation details.");
          return;
        }

        IncidentReportsManager.addIncident({
          title,
          zoneId,
          zoneName: selectedZoneObj.name,
          category,
          severity,
          description: desc,
          lat,
          lon
        });

        // Reset form
        form.reset();
        mapEngine.clearReportPin();
        const pickFeedback = document.getElementById("pick-coords-feedback");
        if (pickFeedback) pickFeedback.textContent = "Report logged and pinned to map successfully.";

        // Switch to list view / feedback
        renderIncidentsList();
      });
    }
  }

  /**
   * Decarbonization Abatement Calculator
   */
  function initCalculator() {
    const inputs = ["calc-grid-kwh", "calc-diesel-litres", "calc-coal-kg", "calc-eff-pct", "calc-solar-kwp", "calc-scrubber-eff"];

    const updateCalc = () => {
      const gridKwh = document.getElementById("calc-grid-kwh")?.value;
      const dieselLitres = document.getElementById("calc-diesel-litres")?.value;
      const coalKg = document.getElementById("calc-coal-kg")?.value;
      const efficiencyUpgradePercent = document.getElementById("calc-eff-pct")?.value;
      const solarKwp = document.getElementById("calc-solar-kwp")?.value;
      const scrubberEffPercent = document.getElementById("calc-scrubber-eff")?.value;

      // Update Slider Label Displays
      const effLabel = document.getElementById("calc-eff-val");
      const solarLabel = document.getElementById("calc-solar-val");
      const scrubLabel = document.getElementById("calc-scrub-val");
      if (effLabel) effLabel.textContent = `${efficiencyUpgradePercent}%`;
      if (solarLabel) solarLabel.textContent = `${solarKwp} kWp`;
      if (scrubLabel) scrubLabel.textContent = `${scrubberEffPercent}%`;

      const result = DecarbCalculator.calculateAbatement({
        gridKwh,
        dieselLitres,
        coalKg,
        efficiencyUpgradePercent,
        solarKwp,
        scrubberEffPercent
      });

      // Update UI outputs
      document.getElementById("calc-out-baseline").textContent = result.baselineTonnes;
      document.getElementById("calc-out-abated").textContent = result.abatedTonnes;
      document.getElementById("calc-out-monthly-saved").textContent = result.monthlySavedTonnes;
      document.getElementById("calc-out-annual-saved").textContent = result.annualSavedTonnes;
      document.getElementById("calc-out-pct-reduced").textContent = `${result.percentageReduction}%`;
      document.getElementById("calc-out-trees").textContent = result.treesEquivalent;
      document.getElementById("calc-out-pm-captured").textContent = result.capturedPmKg;
      document.getElementById("calc-out-inr-saved").textContent = `₹${result.monthlyCostSavingsInr}`;
    };

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", updateCalc);
      }
    });

    updateCalc();
  }

  /**
   * Theme Switcher (Dark / Light)
   */
  function setupThemeToggle() {
    const toggleBtn = document.getElementById("btn-theme-toggle");
    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", state.theme);
      localStorage.setItem("smokewatch_theme", state.theme);
      mapEngine.setTheme(state.theme);
    });
  }

  /**
   * Live Clock
   */
  function startLiveClock() {
    const clockEl = document.getElementById("live-ist-clock");
    if (!clockEl) return;
    const updateTime = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) + " IST";
    };
    updateTime();
    setInterval(updateTime, 1000);
  }
});
