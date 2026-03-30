// client/src/components/assets/detail/AssetDetailSkeleton.jsx

import { C } from "./detailStyles";

const Box = ({ w, h, mb = "0" }) => (
  <div
    style={{
      width: w,
      height: h,
      backgroundColor: "#F3F4F6",
      borderRadius: "8px",
      marginBottom: mb,
    }}
  />
);

const SkeletonCard = ({ rows = 3 }) => (
  <div
    style={{
      backgroundColor: C.white,
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.04)",
      overflow: "hidden",
      marginBottom: "16px",
    }}
  >
    {/* fake header */}
    <div style={{ height: "46px", backgroundColor: "#E5E7EB" }} />
    <div style={{ padding: "16px 20px" }}>
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          style={{ display: "flex", gap: "16px", marginBottom: "14px" }}
        >
          <Box w="140px" h="14px" />
          <Box w="60%" h="14px" />
        </div>
      ))}
    </div>
  </div>
);

export default function AssetDetailSkeleton() {
  return (
    <div style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
      {/* Header skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <Box w="260px" h="30px" mb="10px" />
          <Box w="160px" h="16px" />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Box w="80px" h="36px" />
          <Box w="110px" h="36px" />
          <Box w="90px" h="36px" />
        </div>
      </div>

      {/* Status strip */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Box w="90px" h="26px" />
        <Box w="70px" h="26px" />
      </div>

      {/* 3-col grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          alignItems: "start",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <SkeletonCard rows={3} />
          <SkeletonCard rows={7} />
          <SkeletonCard rows={4} />
        </div>
        <div>
          <SkeletonCard rows={2} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={2} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
