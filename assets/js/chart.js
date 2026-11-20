/**
 * SmokeWatch - High-Density Retina Canvas Telemetry Sparkline & Trend Chart
 * Draws smooth cubic Bezier spline curves, gradient area fills, statutory threshold lines,
 * and handles interactive hover inspection with zero external dependencies.
 */

class TelemetryTrendChart {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.options = Object.assign({
      metricKey: "pm2_5",
      metricLabel: "PM2.5",
      unit: "µg/m³",
      thresholdLimit: 60, // CPCB 24h limit for PM2.5
      lineColor: "#10b981",
      forecastColor: "#f59e0b",
      fillGradient: true
    }, options);

    this.dataPoints = [];
    this.hoverIndex = -1;
    this.initEvents();
  }

  setData(dataPoints, options = {}) {
    this.dataPoints = dataPoints || [];
    if (options) {
      this.options = Object.assign(this.options, options);
    }
    this.render();
  }

  setMetric(metricKey, label, unit, limit) {
    this.options.metricKey = metricKey;
    this.options.metricLabel = label;
    this.options.unit = unit;
    this.options.thresholdLimit = limit;
    this.render();
  }

  render() {
    if (!this.canvas || !this.dataPoints.length) return;

    // Handle high-DPI (Retina) displays
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 160;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    const padding = { top: 22, right: 16, bottom: 28, left: 36 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = this.dataPoints.map(d => d[this.options.metricKey] || 0);
    const maxVal = Math.max(this.options.thresholdLimit * 1.25, Math.max(...values) * 1.15, 10);
    const minVal = 0;

    const getX = (index) => padding.left + (index / (this.dataPoints.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    this.ctx.clearRect(0, 0, width, height);

    // 1. Draw horizontal grid lines
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
    this.ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
    this.ctx.font = "10px 'JetBrains Mono', monospace";
    this.ctx.textAlign = "right";

    const steps = 3;
    for (let s = 0; s <= steps; s++) {
      const v = Math.round(minVal + (s / steps) * maxVal);
      const y = getY(v);
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(width - padding.right, y);
      this.ctx.stroke();
      this.ctx.fillText(`${v}`, padding.left - 6, y + 3);
    }

    // 2. Draw statutory threshold line (e.g. CPCB 24-hr limit)
    if (this.options.thresholdLimit > 0 && this.options.thresholdLimit <= maxVal) {
      const threshY = getY(this.options.thresholdLimit);
      this.ctx.save();
      this.ctx.setLineDash([4, 4]);
      this.ctx.strokeStyle = "rgba(239, 68, 68, 0.65)";
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, threshY);
      this.ctx.lineTo(width - padding.right, threshY);
      this.ctx.stroke();

      this.ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
      this.ctx.textAlign = "left";
      this.ctx.fillText(`CPCB Limit: ${this.options.thresholdLimit} ${this.options.unit}`, padding.left + 6, threshY - 4);
      this.ctx.restore();
    }

    // 3. Build smooth points array
    const pts = this.dataPoints.map((d, i) => ({
      x: getX(i),
      y: getY(d[this.options.metricKey] || 0),
      raw: d
    }));

    // Find index of first forecast item
    const forecastStart = this.dataPoints.findIndex(d => d.isForecast);

    // 4. Draw area gradient
    const areaGrad = this.ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    areaGrad.addColorStop(0, "rgba(16, 185, 129, 0.28)");
    areaGrad.addColorStop(0.7, "rgba(16, 185, 129, 0.05)");
    areaGrad.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    this.ctx.beginPath();
    this.ctx.moveTo(pts[0].x, padding.top + chartH);
    this.ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const midX = (p0.x + p1.x) / 2;
      this.ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
    }
    this.ctx.lineTo(pts[pts.length - 1].x, padding.top + chartH);
    this.ctx.closePath();
    this.ctx.fillStyle = areaGrad;
    this.ctx.fill();

    // 5. Draw main historical line (Solid)
    const histPts = forecastStart > 0 ? pts.slice(0, forecastStart + 1) : pts;
    this.ctx.save();
    this.ctx.strokeStyle = this.options.lineColor;
    this.ctx.lineWidth = 2.2;
    this.ctx.beginPath();
    this.ctx.moveTo(histPts[0].x, histPts[0].y);
    for (let i = 0; i < histPts.length - 1; i++) {
      const midX = (histPts[i].x + histPts[i + 1].x) / 2;
      this.ctx.bezierCurveTo(midX, histPts[i].y, midX, histPts[i + 1].y, histPts[i + 1].x, histPts[i + 1].y);
    }
    this.ctx.stroke();
    this.ctx.restore();

    // 6. Draw forecast line (Dashed / Amber) if present
    if (forecastStart > 0 && forecastStart < pts.length) {
      const forePts = pts.slice(forecastStart);
      this.ctx.save();
      this.ctx.setLineDash([4, 3]);
      this.ctx.strokeStyle = this.options.forecastColor;
      this.ctx.lineWidth = 2.0;
      this.ctx.beginPath();
      this.ctx.moveTo(forePts[0].x, forePts[0].y);
      for (let i = 0; i < forePts.length - 1; i++) {
        const midX = (forePts[i].x + forePts[i + 1].x) / 2;
        this.ctx.bezierCurveTo(midX, forePts[i].y, midX, forePts[i + 1].y, forePts[i + 1].x, forePts[i + 1].y);
      }
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 7. Draw time tick labels on X axis
    this.ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    this.ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(this.dataPoints.length / 6));
    for (let i = 0; i < this.dataPoints.length; i += labelStep) {
      const pt = pts[i];
      const lbl = pt.raw.hourLabel || "";
      this.ctx.fillText(lbl, pt.x, height - 8);
    }

    // 8. Draw hover indicator if active
    if (this.hoverIndex >= 0 && this.hoverIndex < pts.length) {
      const hPt = pts[this.hoverIndex];
      const d = hPt.raw;
      const val = d[this.options.metricKey] || 0;

      // Vertical guide line
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([3, 3]);
      this.ctx.beginPath();
      this.ctx.moveTo(hPt.x, padding.top);
      this.ctx.lineTo(hPt.x, padding.top + chartH);
      this.ctx.stroke();

      // Circle on curve
      this.ctx.beginPath();
      this.ctx.arc(hPt.x, hPt.y, 4.5, 0, Math.PI * 2);
      this.ctx.fillStyle = d.isForecast ? this.options.forecastColor : this.options.lineColor;
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.stroke();

      // Tooltip pill
      const tipText = `${d.hourLabel}: ${val} ${this.options.unit}${d.isForecast ? " (Model)" : ""}`;
      this.ctx.font = "bold 11px 'JetBrains Mono', monospace";
      const textWidth = this.ctx.measureText(tipText).width;
      const tipX = Math.min(Math.max(hPt.x - textWidth / 2 - 8, 4), width - textWidth - 20);
      const tipY = Math.max(14, hPt.y - 18);

      this.ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      this.ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(tipX, tipY - 14, textWidth + 16, 20, 6);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "left";
      this.ctx.fillText(tipText, tipX + 8, tipY);
      this.ctx.restore();
    }
  }

  initEvents() {
    const handleMove = (clientX) => {
      if (!this.dataPoints.length) return;
      const rect = this.canvas.getBoundingClientRect();
      const padding = { left: 36, right: 16 };
      const chartW = rect.width - padding.left - padding.right;
      const x = clientX - rect.left - padding.left;
      const ratio = Math.max(0, Math.min(1, x / chartW));
      const idx = Math.round(ratio * (this.dataPoints.length - 1));

      if (idx !== this.hoverIndex) {
        this.hoverIndex = idx;
        this.render();
      }
    };

    this.canvas.addEventListener("mousemove", (e) => handleMove(e.clientX));
    this.canvas.addEventListener("mouseleave", () => {
      this.hoverIndex = -1;
      this.render();
    });

    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    }, { passive: true });

    this.canvas.addEventListener("touchend", () => {
      this.hoverIndex = -1;
      this.render();
    });

    window.addEventListener("resize", () => {
      this.render();
    });
  }
}
