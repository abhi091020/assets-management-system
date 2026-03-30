// server/src/utils/qrGenerator.js

import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Resolve uploads/qrcodes directory ───────────────────────────────────────
const QR_DIR = path.resolve(__dirname, "../../../uploads/qrcodes");

// Ensure directory exists at startup (no crash if missing)
if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

// ─── QR Generation Options ────────────────────────────────────────────────────
const QR_OPTIONS = {
  type: "png",
  width: 600, // 600px = ~2 inches at 300 DPI — industry standard label size
  margin: 4, // 4 module quiet zone — ISO 18004 standard
  color: {
    dark: "#000000", // Pure black — best scanner readability
    light: "#ffffff",
  },
  errorCorrectionLevel: "H", // 30% damage recovery — required for physical asset labels
};
/**
 * generateQRCode
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a UUID v4 token + QR PNG image for a new asset.
 *
 * The QR encodes the PUBLIC scan URL:
 *   {CLIENT_URL}/scan/{token}
 *
 * This URL opens the public asset view page (no login required).
 *
 * @returns {Promise<{ qrToken: string, qrCodeImagePath: string }>}
 *   qrToken          — UUID stored in DB (used to look up asset)
 *   qrCodeImagePath  — Relative path stored in DB e.g. "uploads/qrcodes/abc.png"
 *
 * @throws {Error} if QR generation or file write fails
 */
export const generateQRCode = async () => {
  try {
    // 1. Generate unique token
    const qrToken = uuidv4();

    // 2. Build the scan URL that the QR will encode
    //    Falls back to localhost if CLIENT_URL not set
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")[0]
      .trim();
    const scanUrl = `${clientUrl}/scan/${qrToken}`;

    // 3. Build file path for PNG
    const fileName = `${qrToken}.png`;
    const absolutePath = path.join(QR_DIR, fileName);
    const relativePath = `uploads/qrcodes/${fileName}`; // stored in DB

    // 4. Generate + write QR PNG to disk
    await QRCode.toFile(absolutePath, scanUrl, QR_OPTIONS);

    return {
      qrToken,
      qrCodeImagePath: relativePath,
    };
  } catch (err) {
    // Rethrow with context so controller can log properly
    throw new Error(`QR generation failed: ${err.message}`);
  }
};

/**
 * deleteQRFile
 * ─────────────────────────────────────────────────────────────────────────────
 * Deletes a QR PNG file from disk.
 * Called when an asset is hard-deleted (SuperAdmin only, future use).
 * Silently ignores missing files — no crash.
 *
 * @param {string} relativePath  — e.g. "uploads/qrcodes/abc.png"
 */
export const deleteQRFile = (relativePath) => {
  try {
    if (!relativePath) return;
    const absolutePath = path.resolve(__dirname, "../../../", relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch {
    // Non-critical — log but never crash the request
    console.warn(`[QR] Could not delete file: ${relativePath}`);
  }
};
