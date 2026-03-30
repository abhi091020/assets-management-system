// client/src/pages/settings/SettingsPage.jsx
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  getMeApi,
  updateMeApi,
  changeMyPasswordApi,
} from "../../api/settingsApi";
import useAuthStore from "../../store/authStore";
import { resolvePhotoUrl } from "../../utils/userHelpers";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#8B1A1A",
  primaryLight: "#FFF5F5",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
};

const S = {
  page: { fontFamily: "'Segoe UI', sans-serif" },
  pageHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  titleAccent: { display: "flex", alignItems: "center", gap: "10px" },
  accentBar: {
    width: "4px",
    height: "32px",
    borderRadius: "4px",
    background: "linear-gradient(180deg, #8B1A1A 0%, #C0392B 100%)",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: C.primary,
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: { fontSize: "13px", color: C.textLight, marginTop: "4px" },
  card: {
    backgroundColor: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "0",
    border: "1px solid rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  tabBar: {
    display: "flex",
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: "#FAFAFA",
  },
  tabBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    background: "none",
    borderBottom: active
      ? `2.5px solid ${C.primary}`
      : "2.5px solid transparent",
    color: active ? C.primary : C.textLight,
    backgroundColor: active ? C.white : "transparent",
    transition: "all 0.15s",
    marginBottom: "-1px",
  }),
  tabContent: { padding: "28px 28px" },
  avatarCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#FAFAFA",
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    marginBottom: "24px",
  },
  avatarWrapper: { position: "relative", flexShrink: 0, cursor: "pointer" },
  avatarCircle: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #C21807 0%, #8B1A1A 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: C.white,
    fontSize: "22px",
    fontWeight: "700",
    flexShrink: 0,
    overflow: "hidden",
    border: "3px solid rgba(139,26,26,0.15)",
    transition: "border-color 0.2s",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s",
    pointerEvents: "none",
  },
  avatarOverlayIcon: { fontSize: "18px", lineHeight: 1 },
  avatarOverlayText: {
    fontSize: "8px",
    fontWeight: "700",
    color: "#fff",
    marginTop: "2px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  avatarMeta: { flex: 1, minWidth: 0 },
  avatarPhotoActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
    flexWrap: "wrap",
  },
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 14px",
    border: `1.5px solid ${C.primary}`,
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "600",
    color: C.primary,
    backgroundColor: C.white,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  removePhotoBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 14px",
    border: "1.5px solid #E5E7EB",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "600",
    color: C.textLight,
    backgroundColor: C.white,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  photoHint: { fontSize: "11px", color: C.textLight, marginTop: "4px" },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: C.text,
    marginBottom: "6px",
  },
  fieldHint: { fontSize: "11px", color: C.textLight, marginTop: "4px" },
  input: (disabled, error) => ({
    width: "100%",
    padding: "10px 16px",
    border: `1.5px solid ${error ? "#EF4444" : C.border}`,
    borderRadius: "10px",
    fontSize: "14px",
    color: disabled ? C.textLight : C.text,
    backgroundColor: disabled ? "#F9FAFB" : C.white,
    outline: "none",
    boxSizing: "border-box",
    cursor: disabled ? "not-allowed" : "text",
    transition: "border-color 0.2s, box-shadow 0.2s",
  }),
  inputError: { fontSize: "12px", color: "#EF4444", marginTop: "4px" },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "24px",
  },
  infoCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#FAFAFA",
    borderRadius: "10px",
    border: `1px solid ${C.border}`,
  },
  saveBtn: (disabled) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: disabled
      ? "#D1D5DB"
      : "linear-gradient(135deg, #8B1A1A 0%, #6E1515 100%)",
    color: C.white,
    border: "none",
    borderRadius: "50px",
    padding: "10px 28px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 4px 14px rgba(139,26,26,0.35)",
    transition: "all 0.2s",
  }),
  securityNote: {
    padding: "14px 18px",
    backgroundColor: "#FFFBEB",
    border: "1px solid #FDE68A",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  passwordWrapper: { position: "relative", marginBottom: "4px" },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: C.textLight,
    fontSize: "16px",
    padding: "4px",
  },
  strengthBar: (color) => ({
    height: "6px",
    borderRadius: "50px",
    backgroundColor: color,
    transition: "width 0.3s",
  }),
  strengthTrack: {
    height: "6px",
    backgroundColor: "#E5E7EB",
    borderRadius: "50px",
    overflow: "hidden",
    marginTop: "6px",
  },
};

const ROLE_BADGE = {
  SuperAdmin: { bg: "#FEE2E2", color: "#B91C1C" },
  Admin: { bg: "#DBEAFE", color: "#1D4ED8" },
  AssetManager: { bg: "#EDE9FE", color: "#6D28D9" },
  Auditor: { bg: "#F0FDFA", color: "#0F766E" },
  Viewer: { bg: "#F3F4F6", color: "#4B5563" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDisplayDate(str) {
  if (!str) return "—";
  // Strip trailing Z — SQL Server GETDATE() returns IST, not UTC
  const normalized = typeof str === "string" ? str.replace(/Z$/, "") : str;
  return new Date(normalized).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
function formatDateOnly(str) {
  if (!str) return "—";
  // Strip trailing Z — SQL Server GETDATE() returns IST, not UTC
  const normalized = typeof str === "string" ? str.replace(/Z$/, "") : str;
  return new Date(normalized).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function validatePhone(phone) {
  if (!phone) return null;
  if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, "")))
    return "Enter a valid 10-digit Indian mobile number";
  return null;
}
function passwordStrength(p) {
  if (!p) return null;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const map = [
    null,
    { label: "Weak", color: "#EF4444", w: "25%" },
    { label: "Fair", color: "#F59E0B", w: "50%" },
    { label: "Good", color: "#3B82F6", w: "75%" },
    { label: "Strong", color: "#22C55E", w: "100%" },
  ];
  return map[score] || map[1];
}

// ── PasswordInput ─────────────────────────────────────────────────────────────
function PasswordInput({ label, value, onChange, show, onToggleShow, hint }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={S.fieldLabel}>{label}</label>
      <div style={S.passwordWrapper}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          style={{ ...S.input(false, false), paddingRight: "44px" }}
          onFocus={(e) => {
            e.target.style.borderColor = C.primary;
            e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.border;
            e.target.style.boxShadow = "none";
          }}
        />
        <button type="button" onClick={onToggleShow} style={S.eyeBtn}>
          {show ? "🙈" : "👁️"}
        </button>
      </div>
      {hint && <div style={S.fieldHint}>{hint}</div>}
    </div>
  );
}

// ── Photo Viewer Modal (WhatsApp style) ───────────────────────────────────────
function PhotoViewer({ src, name, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C21807, #8B1A1A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            {(name || "?")
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: "600", fontSize: "15px" }}>
              {name}
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>
              Profile Photo
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            fontSize: "18px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Photo */}
      <img
        src={src}
        alt="Profile"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(90vw, 500px)",
          maxHeight: "80vh",
          borderRadius: "4px",
          objectFit: "contain",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, onSaved }) {
  const updateUser = useAuthStore((s) => s.updateUser);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoHovered, setPhotoHovered] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      // ── resolvePhotoUrl converts "/uploads/..." → full absolute URL ──
      setPhotoPreview(resolvePhotoUrl(user.profile_photo_url));
      setPhotoFile(null);
    }
  }, [user]);

  const isDirty =
    fullName !== (user?.full_name || "") ||
    phone !== (user?.phone || "") ||
    !!photoFile ||
    (photoPreview === null && !!user?.profile_photo_url);

  const initials = (user?.full_name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleBadge = ROLE_BADGE[user?.role] || ROLE_BADGE.Viewer;

  const handlePhoneChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    setPhoneError(validatePhone(digits));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setPhotoFile(file);
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    const pErr = validatePhone(phone);
    if (pErr) {
      setPhoneError(pErr);
      return;
    }

    setSaving(true);
    try {
      const res = await updateMeApi({
        fullName: fullName.trim(),
        phone: phone.trim(),
        photoFile: photoFile || undefined,
        removePhoto: photoPreview === null && !!user?.profile_photo_url,
      });

      if (res.success) {
        toast.success("Profile updated successfully");
        setPhotoFile(null);

        const freshUser = res.data.user;
        onSaved(freshUser);

        // Sync authStore so Navbar updates immediately
        updateUser({
          full_name: freshUser.full_name,
          phone: freshUser.phone,
          profile_photo_url: freshUser.profile_photo_url ?? null,
        });
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      {/* WhatsApp-style photo viewer */}
      {viewerOpen && photoPreview && (
        <PhotoViewer
          src={photoPreview}
          name={user.full_name}
          onClose={() => setViewerOpen(false)}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Avatar card */}
      <div style={S.avatarCard}>
        <div
          style={S.avatarWrapper}
          onClick={handleAvatarClick}
          onMouseEnter={() => setPhotoHovered(true)}
          onMouseLeave={() => setPhotoHovered(false)}
          title="Click to change photo"
        >
          <div
            style={{
              ...S.avatarCircle,
              borderColor: photoHovered
                ? "rgba(139,26,26,0.45)"
                : "rgba(139,26,26,0.15)",
            }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" style={S.avatarImg} />
            ) : (
              initials
            )}
          </div>
          <div style={{ ...S.avatarOverlay, opacity: photoHovered ? 1 : 0 }}>
            <span style={S.avatarOverlayIcon}>📷</span>
            <span style={S.avatarOverlayText}>Change</span>
          </div>
        </div>

        <div style={S.avatarMeta}>
          <div
            style={{ fontWeight: "700", fontSize: "17px", color: C.primary }}
          >
            {user.full_name}
          </div>
          <div
            style={{ fontSize: "13px", color: C.textLight, marginTop: "2px" }}
          >
            {user.email}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: roleBadge.bg,
                color: roleBadge.color,
              }}
            >
              {user.role}
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: user.is_active ? "#DCFCE7" : "#FEE2E2",
                color: user.is_active ? "#15803D" : "#B91C1C",
              }}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div style={S.avatarPhotoActions}>
            {photoPreview && (
              <button
                onClick={() => setViewerOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 14px",
                  border: "1.5px solid #6B7280",
                  borderRadius: "50px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6B7280",
                  backgroundColor: C.white,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#374151";
                  e.currentTarget.style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#6B7280";
                  e.currentTarget.style.color = "#6B7280";
                }}
              >
                👁 View
              </button>
            )}
            <button
              onClick={handleAvatarClick}
              style={S.uploadBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = C.primaryLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = C.white;
              }}
            >
              📷 {photoPreview ? "Change Photo" : "Upload Photo"}
            </button>
            {photoPreview && (
              <button
                onClick={handleRemovePhoto}
                style={S.removePhotoBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#EF4444";
                  e.currentTarget.style.color = "#EF4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.color = C.textLight;
                }}
              >
                🗑 Remove
              </button>
            )}
          </div>
          <div style={S.photoHint}>
            JPG, PNG or GIF · Max 5 MB · Click avatar or button to change
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div style={S.grid2}>
        <div>
          <label style={S.fieldLabel}>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            style={S.input(false, false)}
            onFocus={(e) => {
              e.target.style.borderColor = C.primary;
              e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = C.border;
              e.target.style.boxShadow = "none";
            }}
          />
          <div style={S.fieldHint}>Appears in audit logs and notifications</div>
        </div>
        <div>
          <label style={S.fieldLabel}>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="e.g. 9876543210"
            maxLength={10}
            style={S.input(false, !!phoneError)}
            onFocus={(e) => {
              e.target.style.borderColor = phoneError ? "#EF4444" : C.primary;
              e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = phoneError ? "#EF4444" : C.border;
              e.target.style.boxShadow = "none";
            }}
          />
          {phoneError ? (
            <div style={S.inputError}>{phoneError}</div>
          ) : (
            <div style={S.fieldHint}>10-digit Indian mobile number</div>
          )}
        </div>
        <div>
          <label style={S.fieldLabel}>Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled
            style={S.input(true, false)}
          />
          <div style={S.fieldHint}>Contact Admin to change email</div>
        </div>
        <div>
          <label style={S.fieldLabel}>Role</label>
          <input
            type="text"
            value={user.role}
            disabled
            style={S.input(true, false)}
          />
          <div style={S.fieldHint}>Role can only be changed by an Admin</div>
        </div>
      </div>

      {/* Account info */}
      <div style={S.infoGrid}>
        {[
          { label: "Account Created", value: formatDateOnly(user.created_at) },
          { label: "Last Login", value: formatDisplayDate(user.last_login_at) },
        ].map(({ label, value }) => (
          <div key={label} style={S.infoCard}>
            <span
              style={{
                fontSize: "12px",
                color: C.textLight,
                fontWeight: "500",
              }}
            >
              {label}
            </span>
            <span
              style={{ fontSize: "12px", color: C.text, fontWeight: "600" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={!isDirty || saving || !!phoneError}
          style={S.saveBtn(!isDirty || saving || !!phoneError)}
          onMouseEnter={(e) => {
            if (isDirty && !saving) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(139,26,26,0.45)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(139,26,26,0.35)";
          }}
        >
          {saving && (
            <span
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }}
            />
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Password Tab ──────────────────────────────────────────────────────────────
function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);

  const strength = passwordStrength(newPass);
  const toggleShow = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async () => {
    if (!current || !newPass || !confirm) {
      toast.error("All fields are required");
      return;
    }
    if (newPass.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPass !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPass === current) {
      toast.error("New password must be different from current");
      return;
    }
    setSaving(true);
    try {
      const res = await changeMyPasswordApi({
        current_password: current,
        new_password: newPass,
        confirm_password: confirm,
      });
      if (res.success) {
        toast.success("Password changed successfully");
        setCurrent("");
        setNewPass("");
        setConfirm("");
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "460px" }}>
      <div style={S.securityNote}>
        <div style={{ fontWeight: "600", fontSize: "13px", color: "#92400E" }}>
          🔒 Security Note
        </div>
        <div style={{ fontSize: "12px", color: "#92400E", marginTop: "4px" }}>
          After changing your password, you'll stay logged in on this device.
        </div>
      </div>
      <PasswordInput
        label="Current Password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        show={show.current}
        onToggleShow={() => toggleShow("current")}
      />
      <div style={{ marginBottom: "16px" }}>
        <PasswordInput
          label="New Password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          show={show.new}
          onToggleShow={() => toggleShow("new")}
          hint="Min 6 characters. Use uppercase, numbers & symbols for stronger security."
        />
        {strength && (
          <div>
            <div style={S.strengthTrack}>
              <div
                style={{ ...S.strengthBar(strength.color), width: strength.w }}
              />
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: strength.color,
                marginTop: "4px",
              }}
            >
              {strength.label} password
            </div>
          </div>
        )}
      </div>
      <PasswordInput
        label="Confirm New Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        show={show.confirm}
        onToggleShow={() => toggleShow("confirm")}
      />
      {confirm && newPass && (
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: newPass === confirm ? "#16A34A" : "#DC2626",
            marginBottom: "20px",
            marginTop: "-8px",
          }}
        >
          {newPass === confirm
            ? "✓ Passwords match"
            : "✗ Passwords do not match"}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={S.saveBtn(saving)}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(139,26,26,0.45)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(139,26,26,0.35)";
          }}
        >
          {saving && (
            <span
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }}
            />
          )}
          {saving ? "Changing…" : "Change Password"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile", label: "My Profile", icon: "👤" },
  { id: "password", label: "Change Password", icon: "🔒" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeApi()
      .then((res) => {
        if (res.success) setUser(res.data.user);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={S.pageHeaderRow}>
        <div style={S.titleAccent}>
          <div style={S.accentBar} />
          <div>
            <h1 style={S.pageTitle}>Settings</h1>
            <p style={S.pageSubtitle}>
              Manage your profile and security preferences
            </p>
          </div>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={S.tabBtn(activeTab === tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={S.tabContent}>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px",
                color: C.textLight,
              }}
            >
              Loading…
            </div>
          ) : (
            <>
              {activeTab === "profile" && (
                <ProfileTab user={user} onSaved={setUser} />
              )}
              {activeTab === "password" && <PasswordTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
