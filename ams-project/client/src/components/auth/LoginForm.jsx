// src/components/auth/LoginForm.jsx
import { useState } from "react";

const ERROR_STYLES = {
  UNAUTHORIZED: {
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#DC2626",
    icon: "alert",
  },
  FORBIDDEN: { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C", icon: "ban" },
  RATE_LIMITED: {
    bg: "#FFF7ED",
    border: "#FED7AA",
    text: "#B45309",
    icon: "clock",
  },
  TIMEOUT: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", icon: "wifi" },
  NETWORK: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", icon: "wifi" },
  SERVER_ERROR: {
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#DC2626",
    icon: "server",
  },
  default: { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626", icon: "alert" },
};

const B = {
  labelFs: 12,
  inputFs: 14,
  inputH: 40,
  inputR: 10,
  btnH: 41,
  btnR: 10,
  btnFs: 14,
  eyeSize: 18,
  errFs: 11,
  gapEmail: 18,
  gapPw: 14,
  gapForgot: 32,
  labelMb: 6,
  errMt: 4,
  padX: 12,
};

const Icon = ({ type, size }) => {
  const s = `${size}px`;
  const common = {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    style: { width: s, height: s, flexShrink: 0 },
  };
  const sw = {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
  };
  if (type === "ban")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" {...sw} />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" {...sw} />
      </svg>
    );
  if (type === "clock")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" {...sw} />
        <polyline points="12 6 12 12 16 14" {...sw} />
      </svg>
    );
  if (type === "wifi")
    return (
      <svg {...common}>
        <line x1="1" y1="1" x2="23" y2="23" {...sw} />
        <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" {...sw} />
        <path d="M5 12.55a10.94 10.94 0 015.17-2.39" {...sw} />
        <path d="M10.71 5.05A16 16 0 0122.56 9" {...sw} />
        <path d="M1.42 9a15.91 15.91 0 014.7-2.88" {...sw} />
        <path d="M8.53 16.11a6 6 0 016.95 0" {...sw} />
        <line x1="12" y1="20" x2="12.01" y2="20" {...sw} />
      </svg>
    );
  if (type === "server")
    return (
      <svg {...common}>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" {...sw} />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" {...sw} />
        <line x1="6" y1="6" x2="6.01" y2="6" {...sw} />
        <line x1="6" y1="18" x2="6.01" y2="18" {...sw} />
      </svg>
    );
  return (
    <svg {...common}>
      <path {...sw} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

// ── Animated underline input wrapper ─────────────────────────────────────────
// Replaces the raw <input> — keeps all existing props, adds the sliding underline
const AnimatedInput = ({
  hasError,
  isDisabled,
  scale,
  style: extraStyle,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const s = scale;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        {...props}
        disabled={isDisabled}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        onBlurCapture={(e) => {
          props.onBlurCapture?.(e);
        }}
        style={{
          width: "100%",
          height: `${B.inputH * s}px`,
          // ── Flat bottom corners so underline sits flush ──
          borderRadius: `${B.inputR * s}px ${B.inputR * s}px 0 0`,
          backgroundColor: hasError ? "#FEF2F2" : focused ? "#fff" : "#EEEEEE",
          // Remove bottom border — underline handles it
          border: "1.5px solid transparent",
          borderBottom: "none",
          fontSize: `${B.inputFs * s}px`,
          color: "#374151",
          padding: `0 ${B.padX * s}px`,
          outline: "none",
          transition:
            "background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
          boxSizing: "border-box",
          opacity: isDisabled ? 0.6 : 1,
          cursor: isDisabled ? "not-allowed" : "text",
          ...(hasError ? { borderColor: "#FCA5A5" } : {}),
          ...(focused && !hasError
            ? {
                boxShadow: `0 0 0 ${2 * s}px rgba(202,0,0,0.08)`,
                borderColor: "#CA0000",
              }
            : {}),
          ...(focused && hasError
            ? {
                boxShadow: `0 0 0 ${2 * s}px rgba(239,68,68,0.08)`,
                borderColor: "#EF4444",
              }
            : {}),
          ...extraStyle,
        }}
      />

      {/* ── Underline track (always visible, grey) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: `${1.5 * s}px`,
          background: hasError ? "#FCA5A5" : "#D1D5DB",
          borderRadius: `0 0 ${B.inputR * s}px ${B.inputR * s}px`,
        }}
      />

      {/* ── Underline fill (slides in from left on focus) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: `${2 * s}px`,
          borderRadius: `0 0 ${B.inputR * s}px ${B.inputR * s}px`,
          background: hasError
            ? "#EF4444"
            : "linear-gradient(90deg, #CA0000, #a00000)",
          // Slide from 0% → 100% width on focus, back to 0% on blur
          width: focused ? "100%" : "0%",
          transition: focused
            ? "width 0.35s cubic-bezier(0.22,1,0.36,1)"
            : "width 0.2s ease",
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const LoginForm = ({
  onSubmit,
  loading,
  serverError,
  serverErrorCode,
  scale = 1,
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    if (name === "email") {
      if (!value.trim()) return "Email is required.";
      if (!/\S+@\S+\.\S+/.test(value))
        return "Please enter a valid email address.";
    }
    if (name === "password") {
      if (!value) return "Password is required.";
    }
    return "";
  };

  const validate = () => {
    const e = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };
    return Object.fromEntries(Object.entries(e).filter(([, v]) => v));
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormData((p) => ({ ...p, [name]: value }));
    if (touched[name])
      setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleBlur = ({ target: { name, value } }) => {
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit(formData);
  };

  const s = scale;
  const px = (n) => `${n * s}px`;
  const errStyle = ERROR_STYLES[serverErrorCode] ?? ERROR_STYLES.default;
  const isDisabled = loading;

  const labelStyle = {
    display: "block",
    fontSize: px(B.labelFs),
    fontWeight: 500,
    color: "#4D2B00",
    marginBottom: px(B.labelMb),
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column" }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ams_btn_pulse {
          0%   { box-shadow: 0 2px 8px rgba(202,0,0,0.25), 0 0 0 0   rgba(202,0,0,0.45); }
          60%  { box-shadow: 0 2px 8px rgba(202,0,0,0.25), 0 0 0 ${10 * s}px rgba(202,0,0,0); }
          100% { box-shadow: 0 2px 8px rgba(202,0,0,0.25), 0 0 0 0   rgba(202,0,0,0); }
        }
      `}</style>

      {/* ── Server error banner — unchanged ── */}
      {serverError && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: px(8),
            background: errStyle.bg,
            border: `1px solid ${errStyle.border}`,
            color: errStyle.text,
            borderRadius: px(8),
            padding: `${10 * s}px ${12 * s}px`,
            fontSize: px(B.inputFs),
            marginBottom: px(14),
            lineHeight: 1.4,
          }}
        >
          <Icon type={errStyle.icon} size={16 * s} />
          <span style={{ marginTop: px(0.5) }}>{serverError}</span>
        </div>
      )}

      {/* ── Email ── */}
      <div style={{ marginBottom: px(B.gapEmail) }}>
        <label style={labelStyle}>
          Enter Email<span style={{ color: "#CA0000" }}>*</span>
        </label>
        <AnimatedInput
          type="email"
          name="email"
          id="login-email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="admin@ams.com"
          autoComplete="email"
          hasError={!!errors.email}
          isDisabled={isDisabled}
          scale={s}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p
            id="email-error"
            role="alert"
            style={{
              color: "#DC2626",
              fontSize: px(B.errFs),
              margin: `${B.errMt * s}px 0 0`,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg
              style={{ width: px(11), height: px(11), flexShrink: 0 }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.email}
          </p>
        )}
      </div>

      {/* ── Password ── */}
      <div style={{ marginBottom: px(B.gapPw) }}>
        <label style={labelStyle}>
          Password<span style={{ color: "#CA0000" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <AnimatedInput
            type={showPass ? "text" : "password"}
            name="password"
            id="login-password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="••••••••"
            autoComplete="current-password"
            hasError={!!errors.password}
            isDisabled={isDisabled}
            scale={s}
            style={{ paddingRight: `${40 * s}px` }}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {/* Eye toggle — position unchanged, sits over AnimatedInput */}
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            aria-label={showPass ? "Hide password" : "Show password"}
            disabled={isDisabled}
            style={{
              position: "absolute",
              right: px(10),
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: `0 ${2 * s}px`,
              cursor: isDisabled ? "not-allowed" : "pointer",
              color: "#9CA3AF",
              display: "flex",
              alignItems: "center",
              transition: "color 0.15s",
              lineHeight: 0,
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) e.currentTarget.style.color = "#CA0000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9CA3AF";
            }}
          >
            {showPass ? (
              <svg
                style={{ width: px(B.eyeSize), height: px(B.eyeSize) }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                style={{ width: px(B.eyeSize), height: px(B.eyeSize) }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            role="alert"
            style={{
              color: "#DC2626",
              fontSize: px(B.errFs),
              margin: `${B.errMt * s}px 0 0`,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg
              style={{ width: px(11), height: px(11), flexShrink: 0 }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.password}
          </p>
        )}
      </div>

      {/* ── Forgot password — unchanged ── */}
      <div style={{ marginBottom: px(B.gapForgot) }}>
        <a
          href="/forgot-password"
          style={{
            fontSize: px(B.labelFs),
            color: "#6B7280",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#CA0000")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
        >
          Forgot password?
        </a>
      </div>

      {/* ── Login button — pulse glow unchanged ── */}
      <button
        type="submit"
        disabled={isDisabled}
        style={{
          width: "100%",
          height: px(B.btnH),
          borderRadius: px(B.btnR),
          background: isDisabled
            ? "linear-gradient(135deg, #e57373, #ef9a9a)"
            : "linear-gradient(135deg, #CA0000 0%, #a00000 100%)",
          color: "#fff",
          fontSize: px(B.btnFs),
          fontWeight: 600,
          border: "none",
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: px(8),
          opacity: isDisabled ? 0.8 : 1,
          letterSpacing: "0.3px",
          animation: isDisabled
            ? "none"
            : "ams_btn_pulse 2.5s ease-out infinite",
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(202,0,0,0.35)";
            e.currentTarget.style.animationPlayState = "paused";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "";
          e.currentTarget.style.animationPlayState = "running";
        }}
      >
        {loading ? (
          <>
            <svg
              style={{
                width: px(16),
                height: px(16),
                animation: "spin 1s linear infinite",
              }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
};

export default LoginForm;
