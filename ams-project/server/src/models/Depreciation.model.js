// server/src/models/Depreciation.model.js

import { getPool, sql } from "../config/db.js";
import {
  calculateDepreciation,
  getCurrentFY,
} from "../utils/depreciationEngine.js";

const DepreciationModel = {
  // ── Run For Single Asset ──────────────────────────────────────────────────
  /**
   * Calculate + insert one depreciation row for a given asset + FY + method
   * If a row already exists for that asset+FY+method → update it (re-run)
   */
  runForAsset: async ({
    assetId,
    method, // "SLM" or "WDV"
    rate, // percentage e.g. 20
    usefulLifeYears, // SLM only
    fy, // e.g. "2025-26" — defaults to current FY
    createdBy,
  }) => {
    const pool = getPool();
    const financialYear = fy || getCurrentFY();

    // ── Fetch asset details ──────────────────────────────────────────────────
    const assetRes = await pool.request().input("assetId", sql.Int, assetId)
      .query(`
        SELECT
          id, asset_code, asset_name, purchase_cost, scrap_value,
          purchase_date, status, current_book_value
        FROM Assets
        WHERE id = @assetId AND is_deleted = 0
      `);

    const asset = assetRes.recordset[0];
    if (!asset) throw new Error(`Asset ID ${assetId} not found.`);
    if (asset.status === "Disposed")
      throw new Error(`Asset ${asset.asset_code} is already Disposed.`);

    // ── Get opening value ────────────────────────────────────────────────────
    // Opening value = closing value of previous FY row if exists,
    // else current_book_value from Assets table
    const prevRes = await pool
      .request()
      .input("assetId", sql.Int, assetId)
      .input("method", sql.NVarChar, method)
      .input("fy", sql.NVarChar, financialYear).query(`
        SELECT TOP 1 closing_value
        FROM AssetDepreciation
        WHERE asset_id = @assetId
          AND method = @method
          AND financial_year < @fy
          AND is_deleted = 0
        ORDER BY financial_year DESC
      `);

    const openingValue =
      prevRes.recordset[0]?.closing_value ??
      parseFloat(asset.current_book_value ?? asset.purchase_cost);

    // ── Calculate ────────────────────────────────────────────────────────────
    const { depreciationAmount, closingValue, rateUsed } =
      calculateDepreciation(method, {
        purchaseCost: parseFloat(asset.purchase_cost),
        scrapValue: parseFloat(asset.scrap_value ?? 0),
        usefulLifeYears: usefulLifeYears || null,
        openingValue,
        purchaseDate: asset.purchase_date,
        fy: financialYear,
        rate,
      });

    // ── Upsert row (merge) ───────────────────────────────────────────────────
    const result = await pool
      .request()
      .input("assetId", sql.Int, assetId)
      .input("financialYear", sql.NVarChar, financialYear)
      .input("openingValue", sql.Decimal(15, 2), openingValue)
      .input("depreciationAmount", sql.Decimal(15, 2), depreciationAmount)
      .input("closingValue", sql.Decimal(15, 2), closingValue)
      .input("method", sql.NVarChar, method)
      .input("rateUsed", sql.Decimal(5, 2), rateUsed)
      .input("usefulLifeYears", sql.Int, usefulLifeYears || null)
      .input("createdBy", sql.Int, createdBy).query(`
        MERGE AssetDepreciation AS target
        USING (SELECT @assetId AS asset_id, @financialYear AS financial_year, @method AS method) AS source
        ON target.asset_id = source.asset_id
          AND target.financial_year = source.financial_year
          AND target.method = source.method
          AND target.is_deleted = 0
        WHEN MATCHED THEN
          UPDATE SET
            opening_value       = @openingValue,
            depreciation_amount = @depreciationAmount,
            closing_value       = @closingValue,
            rate_used           = @rateUsed,
            useful_life_years   = @usefulLifeYears,
            updated_by          = @createdBy,
            updated_at          = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (
            asset_id, financial_year, opening_value, depreciation_amount,
            closing_value, method, rate_used, useful_life_years,
            created_by, updated_by, created_at, updated_at
          )
          VALUES (
            @assetId, @financialYear, @openingValue, @depreciationAmount,
            @closingValue, @method, @rateUsed, @usefulLifeYears,
            @createdBy, @createdBy, GETDATE(), GETDATE()
          )
        OUTPUT
          INSERTED.id, INSERTED.asset_id, INSERTED.financial_year,
          INSERTED.opening_value, INSERTED.depreciation_amount,
          INSERTED.closing_value, INSERTED.method, INSERTED.rate_used;
      `);

    const row = result.recordset[0];

    // ── Update current_book_value on Assets table ────────────────────────────
    await pool
      .request()
      .input("closingValue", sql.Decimal(15, 2), closingValue)
      .input("assetId", sql.Int, assetId)
      .input("updatedBy", sql.Int, createdBy).query(`
        UPDATE Assets SET
          current_book_value = @closingValue,
          updated_by = @updatedBy,
          updated_at = GETDATE()
        WHERE id = @assetId AND is_deleted = 0
      `);

    return { ...row, assetCode: asset.asset_code, assetName: asset.asset_name };
  },

  // ── Run For All Active Assets ─────────────────────────────────────────────
  /**
   * Bulk run depreciation for ALL active, non-disposed assets
   * Returns summary: { success, failed, skipped, results }
   */
  runForAll: async ({ method, rate, usefulLifeYears, fy, createdBy }) => {
    const pool = getPool();
    const financialYear = fy || getCurrentFY();

    // Fetch all eligible assets
    const assetsRes = await pool.request().query(`
      SELECT id, asset_code, asset_name
      FROM Assets
      WHERE is_deleted = 0 AND status != 'Disposed'
    `);

    const assets = assetsRes.recordset;
    const results = [];
    let success = 0;
    let failed = 0;
    const errors = [];

    for (const asset of assets) {
      try {
        const row = await DepreciationModel.runForAsset({
          assetId: asset.id,
          method,
          rate,
          usefulLifeYears,
          fy: financialYear,
          createdBy,
        });
        results.push({
          assetId: asset.id,
          assetCode: asset.asset_code,
          status: "success",
          row,
        });
        success++;
      } catch (err) {
        errors.push({
          assetId: asset.id,
          assetCode: asset.asset_code,
          error: err.message,
        });
        failed++;
      }
    }

    return {
      financialYear,
      method,
      totalAssets: assets.length,
      success,
      failed,
      errors,
      results,
    };
  },

  // ── Get Ledger for One Asset ──────────────────────────────────────────────
  /**
   * Full year-by-year depreciation history for a single asset
   */
  getLedger: async (assetId) => {
    const pool = getPool();

    const assetRes = await pool.request().input("assetId", sql.Int, assetId)
      .query(`
        SELECT
          a.id, a.asset_code, a.asset_name, a.purchase_cost,
          a.scrap_value, a.purchase_date, a.current_book_value,
          c.category_name, l.location_name, d.dept_name
        FROM Assets a
        LEFT JOIN Categories  c ON a.category_id  = c.id
        LEFT JOIN Locations   l ON a.location_id   = l.id
        LEFT JOIN Departments d ON a.department_id = d.id
        WHERE a.id = @assetId AND a.is_deleted = 0
      `);

    const asset = assetRes.recordset[0];
    if (!asset) throw new Error("Asset not found.");

    const ledgerRes = await pool.request().input("assetId", sql.Int, assetId)
      .query(`
        SELECT
          ad.id, ad.financial_year, ad.opening_value,
          ad.depreciation_amount, ad.closing_value,
          ad.method, ad.rate_used, ad.useful_life_years,
          ad.created_at, ad.updated_at,
          u.full_name AS run_by
        FROM AssetDepreciation ad
        LEFT JOIN Users u ON ad.created_by = u.id
        WHERE ad.asset_id = @assetId AND ad.is_deleted = 0
        ORDER BY ad.financial_year ASC
      `);

    return {
      asset,
      ledger: ledgerRes.recordset,
    };
  },

  // ── Get Summary (paginated) ───────────────────────────────────────────────
  /**
   * Paginated depreciation summary — one row per asset for a given FY + method
   */
  getSummary: async ({
    fy = "",
    method = "",
    categoryId = "",
    locationId = "",
    departmentId = "",
    search = "",
    page = 1,
    pageSize = 20,
  }) => {
    const pool = getPool();
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const financialYear = fy || getCurrentFY();

    let where = `WHERE ad.is_deleted = 0 AND ad.financial_year = '${financialYear}'`;
    if (method) where += ` AND ad.method = '${method}'`;
    if (search)
      where += ` AND (a.asset_name LIKE '%${search}%' OR a.asset_code LIKE '%${search}%')`;
    if (categoryId) where += ` AND a.category_id = ${parseInt(categoryId)}`;
    if (locationId) where += ` AND a.location_id = ${parseInt(locationId)}`;
    if (departmentId)
      where += ` AND a.department_id = ${parseInt(departmentId)}`;

    const countRes = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM AssetDepreciation ad
      JOIN Assets a ON ad.asset_id = a.id
      ${where} AND a.is_deleted = 0
    `);
    const total = countRes.recordset[0].total;

    const dataRes = await pool.request().query(`
      SELECT
        ad.id, ad.financial_year, ad.method, ad.rate_used,
        ad.opening_value, ad.depreciation_amount, ad.closing_value,
        ad.useful_life_years, ad.created_at,
        a.id AS asset_id, a.asset_code, a.asset_name,
        a.purchase_cost, a.scrap_value, a.purchase_date,
        c.category_name, l.location_name, d.dept_name,
        u.full_name AS run_by
      FROM AssetDepreciation ad
      JOIN Assets      a ON ad.asset_id    = a.id
      LEFT JOIN Categories  c ON a.category_id  = c.id
      LEFT JOIN Locations   l ON a.location_id   = l.id
      LEFT JOIN Departments d ON a.department_id = d.id
      LEFT JOIN Users       u ON ad.created_by   = u.id
      ${where} AND a.is_deleted = 0
      ORDER BY a.asset_code ASC
      OFFSET ${offset} ROWS FETCH NEXT ${parseInt(pageSize)} ROWS ONLY
    `);

    return {
      data: dataRes.recordset,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / parseInt(pageSize)),
      financialYear,
    };
  },
};

export default DepreciationModel;
