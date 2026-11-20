/**
 * SmokeWatch - Citizen & Industrial Incident Audit System
 * Persists geotagged environmental reports with verification states and authority dispatch logging.
 */

const IncidentReportsManager = (function() {
  const STORAGE_KEY = "smokewatch_incident_reports_v2";
  let incidents = [];
  let changeListeners = [];

  function init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        incidents = JSON.parse(stored);
      } else {
        incidents = [...INITIAL_INCIDENTS];
        save();
      }
    } catch (e) {
      incidents = [...INITIAL_INCIDENTS];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    } catch (e) {}
  }

  function getAllIncidents() {
    return incidents;
  }

  function getIncidentsForZone(zoneId) {
    if (!zoneId || zoneId === "all") return incidents;
    return incidents.filter(i => i.zoneId === zoneId);
  }

  function addIncident(reportData) {
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newIncident = {
      id: `INC-2026-${idNum}`,
      title: reportData.title || "Industrial Emission Exceedance",
      zoneId: reportData.zoneId || "patancheru",
      zoneName: reportData.zoneName || "Patancheru Industrial Area",
      category: reportData.category || "Flue Gas / Stack Emission",
      severity: reportData.severity || "Moderate",
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      lat: parseFloat(reportData.lat) || 17.5323,
      lon: parseFloat(reportData.lon) || 78.2642,
      description: reportData.description || "",
      verificationStatus: "Logged & Awaiting CAAQMS Correlation",
      statusBadge: "pending",
      assignedTo: getAssignedAuthority(reportData.zoneId),
      actionNote: "Geotagged telemetry captured. Correlating with hourly ambient sensor trends."
    };

    incidents.unshift(newIncident);
    save();
    notifyChange();
    return newIncident;
  }

  function getAssignedAuthority(zoneId) {
    const map = {
      patancheru: "TSPCB Regional Office (Sangareddy / Patancheru)",
      jeedimetla: "TSPCB Regional Office (Medchal-Malkajgiri)",
      balanagar: "TSPCB Zonal Office (Hyderabad-North)",
      pashamylaram: "TSPCB Sangareddy Taskforce Cell",
      kattedan: "TSPCB South Enforcement Division & GHMC",
      cherlapally: "TSPCB East Monitoring Division",
      nacharam: "TSPCB Regional Office (Hyderabad-East)",
      sanathnagar: "TSPCB Central Monitoring Cell"
    };
    return map[zoneId] || "TSPCB Central Vigilance Division";
  }

  function onReportChange(callback) {
    changeListeners.push(callback);
  }

  function notifyChange() {
    changeListeners.forEach(fn => {
      try { fn(incidents); } catch (e) {}
    });
  }

  init();

  return {
    getAllIncidents,
    getIncidentsForZone,
    addIncident,
    onReportChange
  };
})();
