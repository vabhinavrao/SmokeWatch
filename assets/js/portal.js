/**
 * SmokeWatch - Academic Research Portal Interactivity
 * Handles live ambient air preview fetching, 5-unit EVS tab switches, and theme management.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Theme initialization
  const theme = localStorage.getItem("smokewatch_theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);

  const themeToggle = document.getElementById("btn-portal-theme");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("smokewatch_theme", next);
    });
  }

  // 5-Unit EVS Interactive Explorer Tabs
  const evsTabs = document.querySelectorAll(".evs-tab-btn");
  const evsPanels = document.querySelectorAll(".evs-unit-panel");

  evsTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const unitId = tab.dataset.unit;
      evsTabs.forEach(t => t.classList.remove("is-active"));
      evsPanels.forEach(p => p.classList.remove("is-active"));

      tab.classList.add("is-active");
      const targetPanel = document.getElementById(`unit-panel-${unitId}`);
      if (targetPanel) {
        targetPanel.classList.add("is-active");
      }
    });
  });

  // Fetch Live Real-Time Telemetry for Hyderabad Hero Preview
  fetchHeroTelemetry();

  async function fetchHeroTelemetry() {
    // Default to central Patancheru Industrial Zone coordinates
    const lat = 17.5323;
    const lon = 78.2642;

    const valAqi = document.getElementById("portal-hero-aqi");
    const tagAqi = document.getElementById("portal-hero-tag");
    const valPm25 = document.getElementById("portal-hero-pm25");
    const valPm10 = document.getElementById("portal-hero-pm10");
    const valSo2 = document.getElementById("portal-hero-so2");
    const statusNote = document.getElementById("portal-hero-status-note");

    try {
      if (window.SmokeWatchAPI) {
        const data = await window.SmokeWatchAPI.getAirQuality(lat, lon, "patancheru");
        const cur = data.current;

        if (valAqi) {
          valAqi.textContent = cur.aqi;
          valAqi.style.color = cur.naqiColor;
        }
        if (tagAqi) {
          tagAqi.textContent = cur.naqiCategory;
          tagAqi.style.backgroundColor = cur.naqiBg;
          tagAqi.style.color = cur.naqiColor;
        }
        if (valPm25) valPm25.textContent = `${cur.pm2_5} µg/m³`;
        if (valPm10) valPm10.textContent = `${cur.pm10} µg/m³`;
        if (valSo2) valSo2.textContent = `${cur.so2} µg/m³`;

        if (statusNote) {
          statusNote.textContent = data.isLive 
            ? "Live in-situ data synced from Open-Meteo & CAAQMS network" 
            : "Calibrated diurnal baseline model";
        }
      }
    } catch (e) {
      console.warn("[SmokeWatch Portal] Hero telemetry fetch error:", e);
    }
  }
});
