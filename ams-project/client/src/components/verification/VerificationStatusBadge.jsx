// client/src/components/verification/VerificationStatusBadge.jsx

// ── Batch Status Badge ────────────────────────────────────────────────────────
export function BatchStatusBadge({ status }) {
  const config = {
    Open: {
      dot: "#3B82F6",
      bg: "#EFF6FF",
      color: "#1D4ED8",
      border: "#BFDBFE",
      label: "Open",
      // Animated pulsing dot to show "active"
      pulse: true,
    },
    Closed: {
      dot: "#9CA3AF",
      bg: "#F3F4F6",
      color: "#4B5563",
      border: "#E5E7EB",
      label: "Closed",
      pulse: false,
      // Lock icon
      icon: (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    Cancelled: {
      dot: "#EF4444",
      bg: "#FEF2F2",
      color: "#B91C1C",
      border: "#FECACA",
      label: "Cancelled",
      pulse: false,
    },
  };

  const c = config[status] || config.Closed;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px 3px 7px",
        borderRadius: "99px",
        fontSize: "11.5px",
        fontWeight: "600",
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
      }}
    >
      {/* Icon (Closed) OR dot (Open/others) */}
      {c.icon ? (
        c.icon
      ) : c.pulse ? (
        // Pulsing dot for Open
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            width: "8px",
            height: "8px",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: c.dot,
              opacity: 0.4,
              animation: "verif-ping 1.4s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: c.dot,
            }}
          />
        </span>
      ) : (
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: c.dot,
            flexShrink: 0,
          }}
        />
      )}
      {c.label}

      {/* Inline keyframe for pulse animation */}
      <style>{`
        @keyframes verif-ping {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
      `}</style>
    </span>
  );
}

// ── Item Status Badge ─────────────────────────────────────────────────────────
export function ItemStatusBadge({ status }) {
  const config = {
    Pending: {
      bg: "#FFFBEB",
      color: "#92400E",
      border: "#FDE68A",
      dot: "#F59E0B",
      label: "Pending",
    },
    Verified: {
      bg: "#F0FDF4",
      color: "#166534",
      border: "#BBF7D0",
      dot: "#22C55E",
      label: "Verified",
      // Checkmark icon
      icon: (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    NotFound: {
      bg: "#FEF2F2",
      color: "#991B1B",
      border: "#FECACA",
      dot: "#EF4444",
      label: "Not Found",
      // X icon
      icon: (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
  };

  const c = config[status] || config.Pending;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px 3px 7px",
        borderRadius: "99px",
        fontSize: "11.5px",
        fontWeight: "600",
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
      }}
    >
      {c.icon ? (
        c.icon
      ) : (
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: c.dot,
            flexShrink: 0,
          }}
        />
      )}
      {c.label}
    </span>
  );
}
