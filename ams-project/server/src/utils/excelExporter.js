import ExcelJS from "exceljs";

/**
 * Generate an Excel (.xlsx) buffer for a report.
 * @param {string} title       - Report title (shown in first row + sheet name)
 * @param {Array}  columns     - [{ header: 'Column Name', key: 'row_key' }, ...]
 * @param {Array}  data        - Array of row objects
 * @returns {Promise<Buffer>}
 */
export async function generateExcel(title, columns, data) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AMS System";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.substring(0, 31)); // Excel limit: 31 chars

  // ── Title row ──────────────────────────────────────────────────────────────
  sheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = {
    name: "Calibri",
    size: 14,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" },
  };
  sheet.getRow(1).height = 30;

  // ── Generated at row ───────────────────────────────────────────────────────
  sheet.mergeCells(2, 1, 2, columns.length);
  const metaCell = sheet.getCell(2, 1);
  metaCell.value = `Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;
  metaCell.font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: "FF666666" },
  };
  metaCell.alignment = { horizontal: "right" };
  sheet.getRow(2).height = 16;

  // ── Header row ─────────────────────────────────────────────────────────────
  const headerRow = sheet.getRow(3);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: false,
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF1D4ED8" } },
    };
  });
  headerRow.height = 22;

  // ── Data rows ──────────────────────────────────────────────────────────────
  data.forEach((item, rowIndex) => {
    const row = sheet.addRow(
      columns.map((col) => {
        const val = item[col.key];
        if (val === null || val === undefined) return "—";
        return val;
      }),
    );

    // Zebra striping
    const fillColor = rowIndex % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF";
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: "Calibri", size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor },
      };
      cell.alignment = { vertical: "middle", wrapText: false };
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE5E7EB" } },
      };
    });
    row.height = 18;
  });

  // ── Total row ──────────────────────────────────────────────────────────────
  const totalRow = sheet.addRow([]);
  sheet.mergeCells(totalRow.number, 1, totalRow.number, columns.length);
  const totalCell = totalRow.getCell(1);
  totalCell.value = `Total Records: ${data.length}`;
  totalCell.font = { name: "Calibri", size: 10, bold: true };
  totalCell.alignment = { horizontal: "right" };
  totalCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  };
  totalRow.height = 18;

  // ── Auto column widths ─────────────────────────────────────────────────────
  columns.forEach((col, i) => {
    const colObj = sheet.getColumn(i + 1);
    const maxLen = Math.max(
      col.header.length,
      ...data.map((row) => String(row[col.key] ?? "").length).slice(0, 100),
    );
    colObj.width = Math.min(Math.max(maxLen + 4, 12), 40);
  });

  // ── Freeze header rows ─────────────────────────────────────────────────────
  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 3 }];

  return workbook.xlsx.writeBuffer();
}
