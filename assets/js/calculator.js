/**
 * SmokeWatch - Industrial Decarbonization & Abatement Engineering Calculator
 * Computes Scope 1 & Scope 2 greenhouse gas emissions and particulate mitigation
 * based on CEA (Central Electricity Authority) India Grid baseline and CPCB emission factors.
 */

const DecarbCalculator = (function() {
  // Regulatory & Scientific Constants
  const GRID_EMISSION_FACTOR = 0.71;      // kg CO2e per kWh (CEA Baseline Database v19)
  const DIESEL_EMISSION_FACTOR = 2.68;    // kg CO2e per Litre of diesel (IPCC / CPCB)
  const COAL_EMISSION_FACTOR = 2.42;      // kg CO2e per kg of non-coking industrial boiler coal
  const TREE_ANNUAL_ABSORPTION = 21.77;   // kg CO2 sequestered per mature tree per year
  const INDUSTRIAL_TARIFF_INR = 8.20;     // Average INR per kWh for HT-Industrial category in Telangana

  /**
   * Calculate baseline emissions and post-intervention abatement
   */
  function calculateAbatement(inputs) {
    const gridKwh = Math.max(0, parseFloat(inputs.gridKwh) || 0);
    const dieselLitres = Math.max(0, parseFloat(inputs.dieselLitres) || 0);
    const coalKg = Math.max(0, parseFloat(inputs.coalKg) || 0);

    // Percentage interventions
    const effPercent = Math.max(0, Math.min(60, parseFloat(inputs.efficiencyUpgradePercent) || 0)) / 100;
    const solarKwp = Math.max(0, parseFloat(inputs.solarKwp) || 0);
    const scrubberEfficiency = Math.max(0, Math.min(99, parseFloat(inputs.scrubberEffPercent) || 85)) / 100;

    // Estimated monthly solar generation in Hyderabad climate (~125 kWh per kWp per month)
    const solarMonthlyKwh = Math.min(gridKwh, solarKwp * 125);

    // Baseline Scope 1 & 2 Emissions (Monthly in kg CO2e)
    const baselineScope1 = (dieselLitres * DIESEL_EMISSION_FACTOR) + (coalKg * COAL_EMISSION_FACTOR);
    const baselineScope2 = gridKwh * GRID_EMISSION_FACTOR;
    const baselineTotalKg = baselineScope1 + baselineScope2;

    // After Interventions
    // 1. Efficiency upgrade reduces grid draw and boiler consumption
    const abatedGridKwh = Math.max(0, (gridKwh * (1 - effPercent)) - solarMonthlyKwh);
    const abatedDiesel = dieselLitres * (1 - effPercent * 0.7);
    const abatedCoal = coalKg * (1 - effPercent * 0.6);

    const abatedScope1 = (abatedDiesel * DIESEL_EMISSION_FACTOR) + (abatedCoal * COAL_EMISSION_FACTOR);
    const abatedScope2 = abatedGridKwh * GRID_EMISSION_FACTOR;
    const abatedTotalKg = abatedScope1 + abatedScope2;

    const monthlySavedKg = Math.max(0, baselineTotalKg - abatedTotalKg);
    const monthlySavedTonnes = monthlySavedKg / 1000;
    const annualSavedTonnes = monthlySavedTonnes * 12;

    // Particulate matter capture (assuming 2.5 g PM per kg coal / 1.8 g per L diesel without filter)
    const rawPmKg = (coalKg * 0.0025) + (dieselLitres * 0.0018);
    const capturedPmKg = rawPmKg * scrubberEfficiency;

    // Equivalent trees planted
    const treesEquivalent = Math.round((annualSavedTonnes * 1000) / TREE_ANNUAL_ABSORPTION);

    // Financial savings from grid electricity reduction
    const monthlyKwhSaved = gridKwh - abatedGridKwh;
    const monthlyCostSavingsInr = Math.round(monthlyKwhSaved * INDUSTRIAL_TARIFF_INR);

    return {
      baselineTonnes: (baselineTotalKg / 1000).toFixed(2),
      abatedTonnes: (abatedTotalKg / 1000).toFixed(2),
      monthlySavedTonnes: monthlySavedTonnes.toFixed(2),
      annualSavedTonnes: annualSavedTonnes.toFixed(1),
      percentageReduction: baselineTotalKg > 0 ? Math.round((monthlySavedKg / baselineTotalKg) * 100) : 0,
      scope1BaselineTonnes: (baselineScope1 / 1000).toFixed(2),
      scope2BaselineTonnes: (baselineScope2 / 1000).toFixed(2),
      scope1AbatedTonnes: (abatedScope1 / 1000).toFixed(2),
      scope2AbatedTonnes: (abatedScope2 / 1000).toFixed(2),
      treesEquivalent: treesEquivalent.toLocaleString(),
      capturedPmKg: capturedPmKg.toFixed(1),
      monthlyCostSavingsInr: monthlyCostSavingsInr.toLocaleString("en-IN")
    };
  }

  return {
    calculateAbatement
  };
})();
