// src/components/auth/LoginCard.jsx
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import boschLogo from "../../assets/images/boschlogo.png";

const BASE = {
  padTop: 21,
  padRight: 26,
  padBottom: 26,
  padLeft: 34,
  titleSize: 18,
  titleGap: 20,
};

const TITLE_LINES = [
  { text: "Welcome To", delay: "0ms" },
  { text: "Asset Management System", delay: "180ms" },
];

const KEYFRAMES = `
  @keyframes ams_title_in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes ams_logo_in {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
`;

const LoginCard = ({
  onSubmit,
  loading,
  serverError,
  serverErrorCode,
  scale = 1,
}) => {
  const s = Math.min(scale, 1);
  const px = (n) => `${n * s}px`;

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          background: "#fff",
          borderRadius: px(20),
          boxShadow: "2px 4px 17.4px rgba(0,0,0,0.25)",
          padding: `${BASE.padTop * s}px ${BASE.padRight * s}px ${BASE.padBottom * s}px ${BASE.padLeft * s}px`,
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Bosch Logo */}
        <div
          style={{
            marginBottom: px(16),
            opacity: ready ? 1 : 0,
            animation: ready
              ? "ams_logo_in 0.4s cubic-bezier(0.22,1,0.36,1) both"
              : "none",
          }}
        >
          <img
            src={boschLogo}
            alt="Bosch"
            style={{
              height: `${44 * s}px`,
              width: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background:
              "linear-gradient(90deg, rgba(202,0,0,0.2) 0%, transparent 100%)",
            marginBottom: px(14),
          }}
        />

        {/* Title */}
        <div style={{ marginBottom: px(BASE.titleGap) }}>
          {TITLE_LINES.map(({ text, delay }) => (
            <p
              key={text}
              style={{
                margin: 0,
                fontWeight: 700,
                lineHeight: 1.3,
                fontSize: px(BASE.titleSize),
                background: "linear-gradient(90deg, #CA0000 0%, #740707 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                opacity: ready ? 1 : 0,
                animation: ready
                  ? `ams_title_in 0.45s cubic-bezier(0.22,1,0.36,1) ${delay} both`
                  : "none",
              }}
            >
              {text}
            </p>
          ))}
        </div>

        <LoginForm
          onSubmit={onSubmit}
          loading={loading}
          serverError={serverError}
          serverErrorCode={serverErrorCode}
          scale={s}
        />
      </div>
    </>
  );
};

export default LoginCard;
