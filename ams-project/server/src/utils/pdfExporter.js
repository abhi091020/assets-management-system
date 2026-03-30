import PDFDocument from "pdfkit";

/**
 * Generate a PDF buffer for a report.
 * @param {string} title   - Report title
 * @param {Array}  columns - [{ header: 'Column Name', key: 'row_key' }, ...]
 * @param {Array}  data    - Array of row objects
 * @returns {Promise<Buffer>}
 */
export function generatePdf(title, columns, data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape",
      info: { Title: title, Author: "AMS System" },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Colours & Fonts ──────────────────────────────────────────────────────
    const BRAND_DARK = "#1E3A5F";
    const BRAND_BLUE = "#2563EB";
    const HEADER_TEXT = "#FFFFFF";
    const ROW_ALT = "#F9FAFB";
    const TEXT_DARK = "#111827";
    const TEXT_MUTED = "#6B7280";
    const BORDER = "#E5E7EB";

    const PAGE_W = doc.page.width;
    const PAGE_H = doc.page.height;
    const MARGIN = 30;
    const CONTENT_W = PAGE_W - MARGIN * 2;

    // ── Header Banner ────────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 60).fill(BRAND_DARK);
    doc
      .fillColor(HEADER_TEXT)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(title, MARGIN, 18, { width: CONTENT_W * 0.7 });
    doc
      .fillColor("#94A3B8")
      .font("Helvetica")
      .fontSize(8)
      .text(
        `Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}   |   Total Records: ${data.length}`,
        MARGIN,
        44,
        { width: CONTENT_W },
      );

    let y = 75;

    // ── Column layout ────────────────────────────────────────────────────────
    // Distribute widths proportionally; cap each at max 120
    const BASE_W = Math.floor(CONTENT_W / columns.length);
    const colWidths = columns.map(() => Math.min(BASE_W, 120));
    const totalColW = colWidths.reduce((a, b) => a + b, 0);
    // Scale to fit exactly
    const scale = CONTENT_W / totalColW;
    const finalWidths = colWidths.map((w) => Math.floor(w * scale));

    const ROW_H = 18;
    const HEADER_H = 22;

    function drawRow(rowData, rowY, isHeader = false, isAlt = false) {
      // Row background
      if (isHeader) {
        doc.rect(MARGIN, rowY, CONTENT_W, HEADER_H).fill(BRAND_BLUE);
      } else if (isAlt) {
        doc.rect(MARGIN, rowY, CONTENT_W, ROW_H).fill(ROW_ALT);
      }

      // Bottom border
      doc
        .moveTo(MARGIN, rowY + (isHeader ? HEADER_H : ROW_H))
        .lineTo(MARGIN + CONTENT_W, rowY + (isHeader ? HEADER_H : ROW_H))
        .strokeColor(BORDER)
        .lineWidth(0.5)
        .stroke();

      let x = MARGIN;
      rowData.forEach((cell, i) => {
        const w = finalWidths[i] || 60;
        const cellText =
          cell === null || cell === undefined ? "—" : String(cell);

        doc
          .fillColor(isHeader ? HEADER_TEXT : TEXT_DARK)
          .font(isHeader ? "Helvetica-Bold" : "Helvetica")
          .fontSize(isHeader ? 8 : 7.5)
          .text(cellText, x + 3, rowY + (isHeader ? 7 : 5), {
            width: w - 6,
            height: isHeader ? HEADER_H - 4 : ROW_H - 4,
            ellipsis: true,
            lineBreak: false,
          });

        x += w;
      });
    }

    // ── Table Header ─────────────────────────────────────────────────────────
    drawRow(
      columns.map((c) => c.header),
      y,
      true,
    );
    y += HEADER_H;

    // ── Table Rows ────────────────────────────────────────────────────────────
    data.forEach((item, idx) => {
      // New page if needed
      if (y + ROW_H > PAGE_H - 40) {
        doc.addPage();
        y = MARGIN;
        drawRow(
          columns.map((c) => c.header),
          y,
          true,
        );
        y += HEADER_H;
      }

      const rowData = columns.map((col) => item[col.key]);
      drawRow(rowData, y, false, idx % 2 !== 0);
      y += ROW_H;
    });

    // ── Footer ───────────────────────────────────────────────────────────────
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.rect(0, PAGE_H - 25, PAGE_W, 25).fill("#F1F5F9");
      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          `Asset Management System  •  ${title}  •  Page ${i + 1} of ${pageCount}`,
          MARGIN,
          PAGE_H - 16,
          { width: CONTENT_W, align: "center" },
        );
    }

    doc.end();
  });
}
