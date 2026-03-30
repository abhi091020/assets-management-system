// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import LoginCard from "../../components/auth/LoginCard";
import loginBg from "../../assets/images/login-bg.svg";
import loginIllustration from "../../assets/images/login-illustration.svg";
import boschLogo from "../../assets/images/boschlogo.png";
import { loginApi } from "../../api/authApi";
import useAuthStore from "../../store/authStore";

const BP_DESKTOP = 1024;
const BP_TABLET = 600;
const SVG_W = 1512,
  SVG_H = 820;
const CARD_CX = 756,
  CARD_CY = 431.5,
  CARD_W = 336;

function getMode(vw) {
  if (vw >= BP_DESKTOP) return "desktop";
  if (vw >= BP_TABLET) return "tablet";
  return "mobile";
}

function calcDesktopLayout(vw, vh) {
  const s = Math.max(vw / SVG_W, vh / SVG_H);
  const ox = (vw - SVG_W * s) / 2;
  const oy = (vh - SVG_H * s) / 2;
  return {
    cardStyle: {
      position: "absolute",
      left: `${ox + CARD_CX * s}px`,
      top: `${oy + CARD_CY * s}px`,
      width: `${CARD_W * s}px`,
    },
    scale: s,
  };
}

function getLayout() {
  const vw = window.innerWidth,
    vh = window.innerHeight;
  const mode = getMode(vw);
  if (mode === "desktop") return { mode, ...calcDesktopLayout(vw, vh) };
  return { mode, cardStyle: null, scale: 1 };
}

const KEYFRAMES = `
  @keyframes ams_fadeslide {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes ams_fadeslide_desktop {
    from { opacity: 0; transform: translate(-50%, calc(-50% + 22px)); }
    to   { opacity: 1; transform: translate(-50%, -50%);              }
  }
  @keyframes ams_fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes ams_blur_clear {
    from { filter: blur(18px); opacity: 0.4; }
    to   { filter: blur(0px);  opacity: 1;   }
  }
`;

const CARD_ANIM = "ams_fadeslide 0.55s cubic-bezier(0.22,1,0.36,1) both";
const BG_ANIM = "ams_fadein 0.6s ease both";
const SVG_ANIM = "ams_blur_clear 1.2s cubic-bezier(0.22,1,0.36,1) forwards";

const LoginPage = () => {
  const [layout, setLayout] = useState(getLayout);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverErrorCode, setServerErrorCode] = useState("");
  const [ready, setReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    const onResize = () => setLayout(getLayout());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogin = async (formData) => {
    setLoading(true);
    setServerError("");
    setServerErrorCode("");
    const result = await loginApi(formData);
    if (result.success) {
      login(result.data.token, result.data.user);
      toast.success("Login successful! Welcome back.");
      navigate("/dashboard", { replace: true });
    } else {
      setServerError(result.message);
      setServerErrorCode(result.code);
      if (result.code !== "UNAUTHORIZED") {
        toast.error(result.message, { autoClose: 5000 });
      }
    }
    setLoading(false);
  };

  const cardProps = {
    onSubmit: handleLogin,
    loading,
    serverError,
    serverErrorCode,
    scale: layout.scale,
  };

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (layout.mode === "mobile") {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F8F8",
          padding: "24px 20px",
          boxSizing: "border-box",
        }}
      >
        <style>{KEYFRAMES}</style>
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            opacity: ready ? 1 : 0,
            animation: ready ? CARD_ANIM : "none",
          }}
        >
          <LoginCard {...cardProps} scale={1} />
        </div>
      </div>
    );
  }

  // ── TABLET ────────────────────────────────────────────────────────────────
  if (layout.mode === "tablet") {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <style>{KEYFRAMES}</style>

        {/* Red left panel */}
        <div
          style={{
            flex: "0 0 42%",
            background: "#CA0000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            position: "relative",
            overflow: "hidden",
            opacity: ready ? 1 : 0,
            animation: ready ? BG_ANIM : "none",
          }}
        >
          {/* Watermark text */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              textAlign: "center",
              fontSize: "clamp(36px,8vw,80px)",
              fontWeight: 900,
              color: "rgba(255,255,255,0.08)",
              lineHeight: 1.1,
              pointerEvents: "none",
              userSelect: "none",
              padding: "16px 0",
            }}
          >
            ASSET
            <br />
            MANAGEMENT
          </div>

          {/* ── Bosch logo — top left of red panel ── */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
            }}
          >
            <img
              src={boschLogo}
              alt="Bosch"
              style={{
                height: "36px",
                width: "auto",
                filter: "brightness(0) invert(1)", // white version on red
                opacity: 0.92,
              }}
            />
          </div>

          <img
            src={loginIllustration}
            alt="illustration"
            style={{
              width: "min(85%,300px)",
              height: "auto",
              position: "relative",
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: "5%",
              left: "7%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#fff",
              fontSize: "clamp(13px,2vw,17px)",
              fontWeight: 500,
            }}
          >
            <span>Let&#39;s Go</span>
            <svg width="48" height="12" viewBox="0 0 64 12" fill="none">
              <line
                x1="0"
                y1="6"
                x2="56"
                y2="6"
                stroke="white"
                strokeWidth="2"
              />
              <polyline
                points="48,1 63,6 48,11"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* White right panel */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-8%",
              top: "50%",
              transform: "translateY(-50%)",
              width: "clamp(160px,45%,280px)",
              aspectRatio: "1",
              border: "2px solid rgba(202,0,0,0.2)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "18%",
                background: "rgba(202,0,0,0.1)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "36%",
                background: "rgba(202,0,0,0.35)",
                borderRadius: "50%",
              }}
            />
          </div>
          <div
            style={{
              width: "100%",
              maxWidth: "320px",
              position: "relative",
              zIndex: 1,
              opacity: ready ? 1 : 0,
              animation: ready ? CARD_ANIM : "none",
            }}
          >
            <LoginCard {...cardProps} scale={1} />
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#F8F8F8",
      }}
    >
      <style>{KEYFRAMES}</style>
      <img
        src={loginBg}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          animation: ready ? SVG_ANIM : "none",
          filter: ready ? undefined : "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: layout.cardStyle?.left,
          top: layout.cardStyle?.top,
          width: layout.cardStyle?.width,
          opacity: ready ? 1 : 0,
          animation: ready
            ? "ams_fadeslide_desktop 0.55s cubic-bezier(0.22,1,0.36,1) 0.3s both"
            : "none",
        }}
      >
        <LoginCard {...cardProps} />
      </div>
    </div>
  );
};

export default LoginPage;
