// server/src/utils/emailService.js

import nodemailer from "nodemailer";

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Verify connection on startup ──────────────────────────────────────────────
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("✅ Email service connected.");
  } catch (err) {
    console.warn("⚠️  Email service not connected:", err.message);
  }
}

// ── Helper: status badge color ────────────────────────────────────────────────
function getBadgeStyle(daysRemaining) {
  if (daysRemaining < 0) return "background:#fee2e2;color:#dc2626;"; // Expired
  if (daysRemaining <= 30) return "background:#ffedd5;color:#ea580c;"; // Critical
  if (daysRemaining <= 60) return "background:#fef9c3;color:#ca8a04;"; // Warning
  return "background:#dcfce7;color:#16a34a;"; // OK
}

function getStatusLabel(daysRemaining) {
  if (daysRemaining < 0) return "EXPIRED";
  if (daysRemaining <= 30) return "CRITICAL";
  if (daysRemaining <= 60) return "WARNING";
  return "OK";
}

// ── Build HTML table rows ─────────────────────────────────────────────────────
function buildTableRows(assets, dateField, vendorField) {
  return assets
    .map((a) => {
      const daysRemaining = a.days_remaining ?? 0;
      const badgeStyle = getBadgeStyle(daysRemaining);
      const statusLabel = getStatusLabel(daysRemaining);
      const expiryDate = a[dateField]
        ? new Date(a[dateField]).toLocaleDateString("en-IN")
        : "—";
      const vendor = a[vendorField] || "—";

      return `
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 12px;font-size:13px;">${a.asset_code}</td>
          <td style="padding:10px 12px;font-size:13px;">${a.asset_name}</td>
          <td style="padding:10px 12px;font-size:13px;">${vendor}</td>
          <td style="padding:10px 12px;font-size:13px;">${a.location_name || "—"}</td>
          <td style="padding:10px 12px;font-size:13px;">${a.dept_name || "—"}</td>
          <td style="padding:10px 12px;font-size:13px;">${expiryDate}</td>
          <td style="padding:10px 12px;font-size:13px;">
            <span style="padding:3px 8px;border-radius:9999px;font-size:11px;font-weight:600;${badgeStyle}">
              ${daysRemaining < 0 ? "Expired" : `${daysRemaining}d`} — ${statusLabel}
            </span>
          </td>
        </tr>`;
    })
    .join("");
}

// ── AMC Expiry Alert Email ────────────────────────────────────────────────────
export async function sendAMCExpiryAlert(assets) {
  if (!assets || assets.length === 0) return;

  const rows = buildTableRows(assets, "amc_expiry_date", "amc_vendor");
  const expiredCount = assets.filter((a) => a.days_remaining < 0).length;
  const criticalCount = assets.filter(
    (a) => a.days_remaining >= 0 && a.days_remaining <= 30,
  ).length;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;">
      <div style="max-width:900px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:#dc2626;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">⚠️ AMC Expiry Alert</h1>
          <p style="color:#fecaca;margin:4px 0 0;font-size:13px;">
            Bosch AMS — Daily Alert • ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
          </p>
        </div>

        <!-- Summary -->
        <div style="padding:20px 32px;background:#fff7ed;border-bottom:1px solid #fed7aa;">
          <p style="margin:0;font-size:14px;color:#9a3412;">
            <strong>${assets.length}</strong> asset(s) have AMC contracts expiring within 30 days —
            <strong>${expiredCount}</strong> already expired,
            <strong>${criticalCount}</strong> expiring within 30 days.
          </p>
        </div>

        <!-- Table -->
        <div style="padding:24px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">ASSET CODE</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">ASSET NAME</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">AMC VENDOR</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">LOCATION</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">DEPARTMENT</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">EXPIRY DATE</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">STATUS</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            This is an automated alert from Bosch Asset Management System.
            Please log in to AMS to take action.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Bosch AMS" <${process.env.SMTP_USER}>`,
    to: process.env.ALERT_EMAIL_TO,
    subject: `⚠️ AMC Expiry Alert — ${assets.length} asset(s) require attention`,
    html,
  });

  console.log(`📧 AMC expiry alert sent for ${assets.length} asset(s).`);
}

// ── Insurance Expiry Alert Email ──────────────────────────────────────────────
export async function sendInsuranceExpiryAlert(assets) {
  if (!assets || assets.length === 0) return;

  const rows = buildTableRows(
    assets,
    "insurance_expiry_date",
    "insurance_company",
  );
  const expiredCount = assets.filter((a) => a.days_remaining < 0).length;
  const criticalCount = assets.filter(
    (a) => a.days_remaining >= 0 && a.days_remaining <= 30,
  ).length;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;">
      <div style="max-width:900px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background:#7c3aed;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">🛡️ Insurance Expiry Alert</h1>
          <p style="color:#ede9fe;margin:4px 0 0;font-size:13px;">
            Bosch AMS — Daily Alert • ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
          </p>
        </div>

        <!-- Summary -->
        <div style="padding:20px 32px;background:#f5f3ff;border-bottom:1px solid #ddd6fe;">
          <p style="margin:0;font-size:14px;color:#5b21b6;">
            <strong>${assets.length}</strong> asset(s) have insurance policies expiring within 30 days —
            <strong>${expiredCount}</strong> already expired,
            <strong>${criticalCount}</strong> expiring within 30 days.
          </p>
        </div>

        <!-- Table -->
        <div style="padding:24px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">ASSET CODE</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">ASSET NAME</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">INSURER</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">LOCATION</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">DEPARTMENT</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">EXPIRY DATE</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">STATUS</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            This is an automated alert from Bosch Asset Management System.
            Please log in to AMS to take action.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Bosch AMS" <${process.env.SMTP_USER}>`,
    to: process.env.ALERT_EMAIL_TO,
    subject: `🛡️ Insurance Expiry Alert — ${assets.length} asset(s) require attention`,
    html,
  });

  console.log(`📧 Insurance expiry alert sent for ${assets.length} asset(s).`);
}
