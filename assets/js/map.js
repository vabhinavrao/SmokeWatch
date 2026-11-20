/**
 * SmokeWatch - OpenStreetMap & Leaflet Geospatial Visualization Engine
 * Renders Hyderabad industrial clusters, CAAQMS stations, CETPs, and citizen incident pins
 * on CartoDB Dark Matter / Positron tiles with high-performance SVG vector markers.
 */

class SmokeWatchMap {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = Object.assign({
      center: [17.47, 78.42], // Central Hyderabad industrial corridor
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      theme: "dark"
    }, options);

    this.map = null;
    this.tileLayer = null;
    this.zoneLayers = new Map();
    this.markerLayers = new Map();
    this.incidentMarkersGroup = null;
    this.reportPinMarker = null;
    this.activeZoneId = null;
    this.onZoneSelected = options.onZoneSelected || null;
    this.onLocationPicked = options.onLocationPicked || null;

    this.init();
  }

  init() {
    if (!window.L) {
      console.error("[SmokeWatch Map] Leaflet library not loaded!");
      return;
    }

    // Initialize Leaflet map instance
    this.map = L.map(this.containerId, {
      center: this.options.center,
      zoom: this.options.zoom,
      minZoom: this.options.minZoom,
      maxZoom: this.options.maxZoom,
      zoomControl: false,
      attributionControl: false
    });

    // Custom positioned Zoom Control
    L.control.zoom({ position: "bottomright" }).addTo(this.map);

    // Custom minimal attribution
    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors')
      .addTo(this.map);

    // Add 100% Free OpenStreetMap Tile Layer
    this.updateTiles(this.options.theme);

    // Layer group for incident pins
    this.incidentMarkersGroup = L.layerGroup().addTo(this.map);

    // Render Hyderabad Industrial Zones
    this.renderIndustrialZones();

    // Setup map click listener for coordinate picking in report mode
    this.map.on("click", (e) => {
      if (this.onLocationPicked) {
        this.setReportPin(e.latlng.lat, e.latlng.lng);
        this.onLocationPicked(e.latlng.lat, e.latlng.lng);
      }
    });

    // Auto resize handling
    window.addEventListener("resize", () => {
      this.map.invalidateSize();
    });
  }

  updateTiles(theme) {
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }

    // 100% Free OpenStreetMap Tile Source (Zero API key required)
    // Uses official OpenStreetMap standard tile servers with maxZoom 19
    const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    this.tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  setTheme(theme) {
    this.options.theme = theme;
    this.updateTiles(theme);
  }

  renderIndustrialZones() {
    HYDERABAD_ZONES.forEach(zone => {
      const naqi = getNAQICategory(zone.baselineAirIndex);

      // Zone Boundary Circle
      const circle = L.circle([zone.lat, zone.lon], {
        radius: zone.radius,
        color: naqi.color,
        weight: 1.5,
        opacity: 0.8,
        fillColor: naqi.color,
        fillOpacity: 0.12,
        className: `zone-boundary-circle zone-${zone.id}`
      }).addTo(this.map);

      // Custom HTML Marker with Pulse Animation and Name Label
      const markerHtml = `
        <div class="sw-zone-marker" data-zone="${zone.id}">
          <div class="sw-marker-pulse" style="background:${naqi.color}"></div>
          <div class="sw-marker-dot" style="background:${naqi.color}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="sw-marker-icon">
              <path d="M2 20h20"/>
              <path d="M6 20V8l6 4V4l8 6v10"/>
              <path d="M18 14h.01"/>
            </svg>
          </div>
          <div class="sw-marker-label">
            <span class="sw-label-name">${zone.name.replace(" Industrial Area", "").replace(" Industrial Estate", "").replace(" IDA Phase I-III", "")}</span>
            <span class="sw-label-val" style="color:${naqi.color}">AQI ${zone.baselineAirIndex}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "sw-custom-leaflet-icon",
        html: markerHtml,
        iconSize: [120, 48],
        iconAnchor: [24, 24]
      });

      const marker = L.marker([zone.lat, zone.lon], { icon: customIcon }).addTo(this.map);

      const selectHandler = () => {
        this.selectZone(zone.id, true);
        if (this.onZoneSelected) {
          this.onZoneSelected(zone);
        }
      };

      circle.on("click", selectHandler);
      marker.on("click", selectHandler);

      this.zoneLayers.set(zone.id, { circle, marker, zone });
    });
  }

  selectZone(zoneId, shouldFly = false) {
    this.activeZoneId = zoneId;

    this.zoneLayers.forEach((layerObj, id) => {
      const isSelected = id === zoneId;
      const naqi = getNAQICategory(layerObj.zone.baselineAirIndex);

      layerObj.circle.setStyle({
        weight: isSelected ? 3.0 : 1.5,
        fillOpacity: isSelected ? 0.28 : 0.12,
        color: isSelected ? "#38bdf8" : naqi.color
      });

      const el = layerObj.marker.getElement();
      if (el) {
        el.classList.toggle("is-active", isSelected);
      }
    });

    if (shouldFly && this.zoneLayers.has(zoneId)) {
      const target = this.zoneLayers.get(zoneId);
      this.map.flyTo([target.zone.lat, target.zone.lon], 13.5, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }

  updateZoneLiveMetrics(zoneId, currentMetrics) {
    if (!this.zoneLayers.has(zoneId)) return;
    const layerObj = this.zoneLayers.get(zoneId);
    const aqi = currentMetrics.aqi;
    const naqi = getNAQICategory(aqi);

    layerObj.circle.setStyle({
      color: this.activeZoneId === zoneId ? "#38bdf8" : naqi.color,
      fillColor: naqi.color
    });

    const el = layerObj.marker.getElement();
    if (el) {
      const valEl = el.querySelector(".sw-label-val");
      const pulseEl = el.querySelector(".sw-marker-pulse");
      const dotEl = el.querySelector(".sw-marker-dot");
      if (valEl) {
        valEl.textContent = `AQI ${aqi}`;
        valEl.style.color = naqi.color;
      }
      if (pulseEl) pulseEl.style.background = naqi.color;
      if (dotEl) dotEl.style.background = naqi.color;
    }
  }

  renderIncidents(incidents) {
    if (!this.incidentMarkersGroup) return;
    this.incidentMarkersGroup.clearLayers();

    incidents.forEach(inc => {
      let iconColor = "#f59e0b";
      if (inc.statusBadge === "verified") iconColor = "#ef4444";
      if (inc.statusBadge === "resolved") iconColor = "#10b981";

      const pinHtml = `
        <div class="sw-incident-pin status-${inc.statusBadge}" title="${inc.title}">
          <div class="sw-incident-bubble" style="background:${iconColor}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="sw-pin-svg">
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        className: "sw-custom-incident-icon",
        html: pinHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const marker = L.marker([inc.lat, inc.lon], { icon: pinIcon });
      
      const popupContent = `
        <div class="sw-map-popup">
          <div class="sw-popup-header">
            <span class="sw-popup-id">${inc.id}</span>
            <span class="sw-popup-status status-${inc.statusBadge}">${inc.verificationStatus}</span>
          </div>
          <h4 class="sw-popup-title">${inc.title}</h4>
          <p class="sw-popup-desc">${inc.description}</p>
          <div class="sw-popup-meta">
            <span><strong>Zone:</strong> ${inc.zoneName}</span>
            <span><strong>Logged:</strong> ${inc.timeAgo}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280, className: "sw-leaflet-popup" });
      this.incidentMarkersGroup.addLayer(marker);
    });
  }

  setReportPin(lat, lon) {
    if (this.reportPinMarker) {
      this.reportPinMarker.setLatLng([lat, lon]);
    } else {
      const pinHtml = `
        <div class="sw-draggable-report-pin">
          <div class="sw-drop-pin-head">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
      `;
      const pinIcon = L.divIcon({
        className: "sw-drop-pin-icon",
        html: pinHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 40]
      });

      this.reportPinMarker = L.marker([lat, lon], {
        icon: pinIcon,
        draggable: true
      }).addTo(this.map);

      this.reportPinMarker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        if (this.onLocationPicked) {
          this.onLocationPicked(pos.lat, pos.lng);
        }
      });
    }
  }

  clearReportPin() {
    if (this.reportPinMarker) {
      this.map.removeLayer(this.reportPinMarker);
      this.reportPinMarker = null;
    }
  }

  fitAllZones() {
    const group = L.featureGroup(Array.from(this.zoneLayers.values()).map(v => v.circle));
    this.map.fitBounds(group.getBounds().pad(0.12));
  }
}
