// server/src/utils/cronJobs.js

import cron from "node-cron";
import { getPool } from "../config/db.js";
import {
  sendAMCExpiryAlert,
  sendInsuranceExpiryAlert,
} from "./emailService.js";

// ── Helper: fetch expiring assets from DB directly ────────────────────────────
async function getExpiringAssets(type, days = 30) {
  const pool = getPool();

  const dateCol = type === "amc" ? "amc_expiry_date" : "insurance_expiry_date";
  const vendorCol = type === "amc" ? "amc_vendor" : "insurance_company";
  const policyCol = type === "insurance" ? ", a.insurance_policy_no" : "";

  const result = await pool.request().query(`
    SELECT
      a.id, a.asset_code, a.asset_name, a.status,
      a.${dateCol},
      a.${vendorCol}${policyCol},
      DATEDIFF(DAY, CAST(GETDATE() AS DATE), a.${dateCol}) AS days_remaining,
      c.category_name, l.location_name, d.dept_name,
      e.full_name AS employee_name, e.employee_code
    FROM Assets a
    LEFT JOIN Categories  c ON a.category_id         = c.id
    LEFT JOIN Locations   l ON a.location_id          = l.id
    LEFT JOIN Departments d ON a.department_id        = d.id
    LEFT JOIN Employees   e ON a.assigned_employee_id = e.id
    WHERE a.is_deleted = 0
      AND a.status != 'Disposed'
      AND a.${dateCol} IS NOT NULL
      AND a.${dateCol} <= DATEADD(DAY, ${days}, CAST(GETDATE() AS DATE))
    ORDER BY a.${dateCol} ASC
  `);

  return result.recordset;
}

// ── Job 1: Daily AMC Expiry Alert — 8:00 AM ───────────────────────────────────
export function startAMCAlertJob() {
  // Runs every day at 08:00
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ [CRON] Running AMC expiry check...");
    try {
      const assets = await getExpiringAssets("amc", 30);
      if (assets.length > 0) {
        await sendAMCExpiryAlert(assets);
      } else {
        console.log("✅ [CRON] No AMC expiries within 30 days.");
      }
    } catch (err) {
      console.error("❌ [CRON] AMC alert job failed:", err.message);
    }
  });

  console.log("✅ AMC expiry alert job scheduled — daily at 8:00 AM.");
}

// ── Job 2: Daily Insurance Expiry Alert — 8:00 AM ────────────────────────────
export function startInsuranceAlertJob() {
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ [CRON] Running Insurance expiry check...");
    try {
      const assets = await getExpiringAssets("insurance", 30);
      if (assets.length > 0) {
        await sendInsuranceExpiryAlert(assets);
      } else {
        console.log("✅ [CRON] No insurance expiries within 30 days.");
      }
    } catch (err) {
      console.error("❌ [CRON] Insurance alert job failed:", err.message);
    }
  });

  console.log("✅ Insurance expiry alert job scheduled — daily at 8:00 AM.");
}

// ── Job 3: FY Auto-Run Depreciation — April 1 at midnight (optional) ─────────
// Uncomment this when you're ready to enable auto depreciation runs
// You must set DEFAULT_DEPRECIATION_METHOD and DEFAULT_DEPRECIATION_RATE in .env

export function startFYDepreciationJob() {
  // Runs at 00:00 on April 1 every year
  cron.schedule("0 0 1 4 *", async () => {
    console.log("⏰ [CRON] Running FY depreciation auto-run...");
    try {
      const method = process.env.DEFAULT_DEPRECIATION_METHOD || "WDV";
      const rate = parseFloat(process.env.DEFAULT_DEPRECIATION_RATE || "20");
      const usefulLifeYears = process.env.DEFAULT_USEFUL_LIFE_YEARS
        ? parseInt(process.env.DEFAULT_USEFUL_LIFE_YEARS)
        : null;

      if (!method || !rate) {
        console.warn(
          "⚠️  [CRON] DEFAULT_DEPRECIATION_METHOD or DEFAULT_DEPRECIATION_RATE not set in .env. Skipping.",
        );
        return;
      }

      const DepreciationModel = (
        await import("../models/Depreciation.model.js")
      ).default;

      const result = await DepreciationModel.runForAll({
        method,
        rate,
        usefulLifeYears,
        fy: null, // auto-detects current FY
        createdBy: null, // system run
      });

      console.log(
        `✅ [CRON] FY depreciation run complete — ${result.success} succeeded, ${result.failed} failed.`,
      );
    } catch (err) {
      console.error("❌ [CRON] FY depreciation job failed:", err.message);
    }
  });

  console.log(
    "✅ FY depreciation auto-run job scheduled — April 1 at midnight.",
  );
}

// ── Start All Jobs ────────────────────────────────────────────────────────────
export function startAllCronJobs() {
  startAMCAlertJob();
  startInsuranceAlertJob();
  // startFYDepreciationJob(); // ← uncomment when ready
}
