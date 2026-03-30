// server/src/utils/depreciationEngine.js

// ── Financial Year Helpers ────────────────────────────────────────────────────

/**
 * Returns current financial year string e.g. "2025-26"
 * FY runs April 1 → March 31
 */
export function getCurrentFY() {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-12
  const year = today.getFullYear();
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

/**
 * Returns FY start date (April 1) for a given FY string e.g. "2025-26"
 */
export function getFYStartDate(fy) {
  const startYear = parseInt(fy.split("-")[0]);
  return new Date(startYear, 3, 1); // April 1
}

/**
 * Returns FY end date (March 31) for a given FY string e.g. "2025-26"
 */
export function getFYEndDate(fy) {
  const startYear = parseInt(fy.split("-")[0]);
  return new Date(startYear + 1, 2, 31); // March 31
}

/**
 * Returns how many days in a given FY the asset was active
 * (from max(purchaseDate, FYStart) to FYEnd)
 * Used for pro-rata SLM in the first year
 */
export function getActiveDaysInFY(purchaseDate, fy) {
  const fyStart = getFYStartDate(fy);
  const fyEnd = getFYEndDate(fy);
  const purchase = new Date(purchaseDate);

  // Asset not yet purchased in this FY
  if (purchase > fyEnd) return 0;

  const effectiveStart = purchase > fyStart ? purchase : fyStart;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((fyEnd - effectiveStart) / msPerDay) + 1;
}

/**
 * Total days in a financial year (365 or 366 for leap year)
 */
export function getTotalDaysInFY(fy) {
  const startYear = parseInt(fy.split("-")[0]);
  // Check if the calendar year containing March 31 is a leap year
  const isLeap =
    (startYear + 1) % 4 === 0 &&
    ((startYear + 1) % 100 !== 0 || (startYear + 1) % 400 === 0);
  return isLeap ? 366 : 365;
}

// ── SLM — Straight Line Method ────────────────────────────────────────────────

/**
 * Calculate SLM depreciation for one financial year
 *
 * Formula: (Purchase Cost - Scrap Value) / Useful Life Years
 * Pro-rated in the first year based on days active
 *
 * @param {number} purchaseCost
 * @param {number} scrapValue       - residual/salvage value (default 0)
 * @param {number} usefulLifeYears  - total useful life in years
 * @param {number} openingValue     - book value at start of this FY
 * @param {string} purchaseDate     - "YYYY-MM-DD" — used for pro-rata in first FY
 * @param {string} fy               - e.g. "2025-26"
 * @returns {{ depreciationAmount: number, closingValue: number, rateUsed: number }}
 */
export function calculateSLM({
  purchaseCost,
  scrapValue = 0,
  usefulLifeYears,
  openingValue,
  purchaseDate,
  fy,
}) {
  if (!usefulLifeYears || usefulLifeYears <= 0)
    throw new Error("usefulLifeYears must be a positive number for SLM.");

  const depreciableAmount = purchaseCost - scrapValue;
  const annualDepreciation = depreciableAmount / usefulLifeYears;
  const rateUsed = parseFloat(
    ((annualDepreciation / purchaseCost) * 100).toFixed(2),
  );

  // Pro-rata for first year
  const activeDays = getActiveDaysInFY(purchaseDate, fy);
  const totalDays = getTotalDaysInFY(fy);
  const proRataFactor = activeDays / totalDays;

  let depreciationAmount = parseFloat(
    (annualDepreciation * proRataFactor).toFixed(2),
  );

  // Cannot depreciate below scrap value
  const minClosing = scrapValue;
  if (openingValue - depreciationAmount < minClosing) {
    depreciationAmount = parseFloat((openingValue - minClosing).toFixed(2));
  }

  // No depreciation if already at or below scrap value
  if (depreciationAmount < 0) depreciationAmount = 0;

  const closingValue = parseFloat(
    (openingValue - depreciationAmount).toFixed(2),
  );

  return { depreciationAmount, closingValue, rateUsed };
}

// ── WDV — Written Down Value Method ──────────────────────────────────────────

/**
 * Calculate WDV depreciation for one financial year
 *
 * Formula: Opening Value × Rate%
 * Pro-rated in the first year based on days active
 *
 * @param {number} openingValue   - book value at start of this FY
 * @param {number} rate           - depreciation rate as percentage e.g. 20 for 20%
 * @param {number} scrapValue     - asset should not go below this
 * @param {string} purchaseDate   - "YYYY-MM-DD" — used for pro-rata in first FY
 * @param {string} fy             - e.g. "2025-26"
 * @returns {{ depreciationAmount: number, closingValue: number, rateUsed: number }}
 */
export function calculateWDV({
  openingValue,
  rate,
  scrapValue = 0,
  purchaseDate,
  fy,
}) {
  if (!rate || rate <= 0 || rate >= 100)
    throw new Error("WDV rate must be between 0 and 100.");

  // Pro-rata for first year
  const activeDays = getActiveDaysInFY(purchaseDate, fy);
  const totalDays = getTotalDaysInFY(fy);
  const proRataFactor = activeDays / totalDays;

  let depreciationAmount = parseFloat(
    (openingValue * (rate / 100) * proRataFactor).toFixed(2),
  );

  // Cannot depreciate below scrap value
  if (openingValue - depreciationAmount < scrapValue) {
    depreciationAmount = parseFloat((openingValue - scrapValue).toFixed(2));
  }

  if (depreciationAmount < 0) depreciationAmount = 0;

  const closingValue = parseFloat(
    (openingValue - depreciationAmount).toFixed(2),
  );

  return { depreciationAmount, closingValue, rateUsed: rate };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

/**
 * Single entry point — picks SLM or WDV based on method
 *
 * @param {string} method - "SLM" or "WDV"
 * @param {object} params - all params for the chosen method
 */
export function calculateDepreciation(method, params) {
  if (method === "SLM") return calculateSLM(params);
  if (method === "WDV") return calculateWDV(params);
  throw new Error(`Unknown depreciation method: ${method}. Use SLM or WDV.`);
}
