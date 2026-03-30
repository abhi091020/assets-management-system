// client/src/components/assets/AssetPhotoPanel.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  getAssetPhotosApi,
  uploadAssetPhotoApi,
  deleteAssetPhotoApi,
} from "../../api/assetApi";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  rowZebra: "#FAFAFA",
  rowHover: "#FDF8F8",
};

// ── Fix Windows backslash paths from DB ───────────────────────────────────────
const toImgUrl = (filePath) => {
  if (!filePath) return "";
  return "/" + filePath.replace(/\\/g, "/");
};

// ── Photo type config ─────────────────────────────────────────────────────────
const PHOTO_TYPES = [
  {
    value: "AssetPhoto",
    label: "Asset Photo",
    bg: "#DBEAFE",
    color: "#1D4ED8",
  },
  {
    value: "InvoiceScan",
    label: "Invoice Scan",
    bg: "#EDE9FE",
    color: "#6D28D9",
  },
  {
    value: "DamagePhoto",
    label: "Damage Photo",
    bg: "#FEE2E2",
    color: "#B91C1C",
  },
  {
    value: "VerificationPhoto",
    label: "Verification Photo",
    bg: "#DCFCE7",
    color: "#15803D",
  },
];

const getTypeStyle = (value) =>
  PHOTO_TYPES.find((t) => t.value === value) || {
    bg: "#F3F4F6",
    color: "#4B5563",
  };

const getTypeLabel = (value) =>
  PHOTO_TYPES.find((t) => t.value === value)?.label || value;

// ── Fallback SVG when image fails ─────────────────────────────────────────────
const FALLBACK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='52' text-anchor='middle' fill='%239ca3af' font-size='10' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ photo, photos, onClose, onPrev, onNext }) => {
  if (!photo) return null;
  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const total = photos.length;
  const typeStyle = getTypeStyle(photo.photo_type);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
            {currentIndex + 1} / {total}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {photo.photo_type && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "3px 10px",
                  borderRadius: "50px",
                  backgroundColor: typeStyle.bg,
                  color: typeStyle.color,
                }}
              >
                {getTypeLabel(photo.photo_type)}
              </span>
            )}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                cursor: "pointer",
                borderRadius: "8px",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                color: "white",
              }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Image row */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              borderRadius: "50%",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              opacity: currentIndex === 0 ? 0.3 : 1,
              color: "white",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <img
            src={toImgUrl(photo.file_path)}
            alt={photo.caption || "Asset photo"}
            style={{
              maxHeight: "75vh",
              maxWidth: "100%",
              borderRadius: "12px",
              objectFit: "contain",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              background: "#1a1a1a",
            }}
            onError={(e) => {
              e.target.src = FALLBACK_SRC;
            }}
          />

          <button
            onClick={onNext}
            disabled={currentIndex === total - 1}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              cursor: currentIndex === total - 1 ? "not-allowed" : "pointer",
              borderRadius: "50%",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              opacity: currentIndex === total - 1 ? 0.3 : 1,
              color: "white",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Caption */}
        {photo.caption && (
          <p
            style={{
              marginTop: "12px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.65)",
              textAlign: "center",
            }}
          >
            {photo.caption}
          </p>
        )}

        {/* Thumbnails */}
        {total > 1 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {photos.map((p) => (
              <button
                key={p.id}
                onClick={() => onClose(p)}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border:
                    p.id === photo.id
                      ? "2px solid white"
                      : "2px solid transparent",
                  opacity: p.id === photo.id ? 1 : 0.5,
                  flexShrink: 0,
                  cursor: "pointer",
                  padding: 0,
                  background: "none",
                  transform: p.id === photo.id ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.15s",
                }}
              >
                <img
                  src={toImgUrl(p.file_path)}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = FALLBACK_SRC;
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Spinner SVG ───────────────────────────────────────────────────────────────
const Spinner = ({ size = 16, color = "white" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: "spin 0.8s linear infinite" }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="4"
      opacity="0.25"
    />
    <path fill={color} opacity="0.75" d="M4 12a8 8 0 018-8v8H4z" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────
const AssetPhotoPanel = ({ assetId, canManage = false }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [fetched, setFetched] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoType, setPhotoType] = useState("AssetPhoto");
  const [caption, setCaption] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPhotos = useCallback(async () => {
    if (!assetId) return;
    setLoading(true);
    const res = await getAssetPhotosApi(assetId);
    if (res.success) setPhotos(res.data || []);
    else toast.error(res.message);
    setLoading(false);
    setFetched(true);
  }, [assetId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // ── File select / drag ────────────────────────────────────────────────────
  const handleFileSelect = (file) => {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
        file.type,
      )
    ) {
      toast.error("Only JPG, PNG or WEBP allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB.");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }
    setUploading(true);
    const res = await uploadAssetPhotoApi(
      assetId,
      selectedFile,
      photoType,
      caption,
    );
    if (res.success) {
      toast.success("Photo uploaded.");
      setSelectedFile(null);
      setPreview(null);
      setCaption("");
      setPhotoType("AssetPhoto");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPhotos();
    } else toast.error(res.message);
    setUploading(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (photoId) => {
    if (!window.confirm("Delete this photo?")) return;
    setDeletingId(photoId);
    const res = await deleteAssetPhotoApi(assetId, photoId);
    if (res.success) {
      toast.success("Photo deleted.");
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      if (lightboxPhoto?.id === photoId) setLightboxPhoto(null);
    } else toast.error(res.message);
    setDeletingId(null);
  };

  // ── Lightbox nav ──────────────────────────────────────────────────────────
  const currentIndex = photos.findIndex((p) => p.id === lightboxPhoto?.id);
  const handlePrev = () => {
    if (currentIndex > 0) setLightboxPhoto(photos[currentIndex - 1]);
  };
  const handleNext = () => {
    if (currentIndex < photos.length - 1)
      setLightboxPhoto(photos[currentIndex + 1]);
  };

  // ── Upload zone style ─────────────────────────────────────────────────────
  const dropZoneBorder = dragOver
    ? "2px dashed #3B82F6"
    : selectedFile
      ? "2px dashed #10B981"
      : `2px dashed ${C.border}`;
  const dropZoneBg = dragOver
    ? "#EFF6FF"
    : selectedFile
      ? "#F0FDF4"
      : C.rowZebra;

  return (
    <>
      <Lightbox
        photo={lightboxPhoto}
        photos={photos}
        onClose={(p) => setLightboxPhoto(p?.id ? p : null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* ── Upload section ─────────────────────────────────────────── */}
        {canManage && (
          <div
            style={{
              background: C.white,
              borderRadius: "12px",
              border: `1px solid ${C.border}`,
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
              Upload Photo
            </div>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: dropZoneBorder,
                background: dropZoneBg,
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
              {preview ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px",
                  }}
                >
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "72px",
                      height: "72px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: `1px solid ${C.border}`,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#059669",
                      }}
                    >
                      {selectedFile.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: C.textLight,
                        marginTop: "2px",
                      }}
                    >
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#3B82F6",
                        marginTop: "4px",
                      }}
                    >
                      Click to change
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "28px", textAlign: "center" }}>
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    stroke="#D1D5DB"
                    viewBox="0 0 24 24"
                    style={{ margin: "0 auto 8px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div style={{ fontSize: "13px", color: C.textLight }}>
                    Drag & drop or{" "}
                    <span style={{ color: "#3B82F6", fontWeight: "600" }}>
                      browse
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#C0C0C0",
                      marginTop: "4px",
                    }}
                  >
                    JPG, PNG, WEBP — Max 5MB
                  </div>
                </div>
              )}
            </div>

            {/* Type + caption */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: C.textLight,
                    marginBottom: "5px",
                  }}
                >
                  Photo Type
                </label>
                <select
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "13px",
                    border: `1.5px solid ${C.border}`,
                    borderRadius: "8px",
                    background: C.white,
                    color: C.text,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {PHOTO_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: C.textLight,
                    marginBottom: "5px",
                  }}
                >
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Front view"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "13px",
                    border: `1.5px solid ${C.border}`,
                    borderRadius: "8px",
                    background: C.white,
                    color: C.text,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.primary)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>
            </div>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{
                width: "100%",
                padding: "10px",
                background:
                  !selectedFile || uploading
                    ? "#E5E7EB"
                    : "linear-gradient(135deg, #8B1A1A 0%, #6E1515 100%)",
                color: !selectedFile || uploading ? "#9CA3AF" : C.white,
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: !selectedFile || uploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
                boxShadow:
                  !selectedFile || uploading
                    ? "none"
                    : "0 4px 12px rgba(139,26,26,0.3)",
              }}
            >
              {uploading ? (
                <>
                  <Spinner size={15} color="#9CA3AF" /> Uploading…
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Upload Photo
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Gallery ────────────────────────────────────────────────── */}
        <div>
          {/* Gallery header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
              Photos{" "}
              {photos.length > 0 && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "400",
                    color: C.textLight,
                  }}
                >
                  ({photos.length})
                </span>
              )}
            </div>
            {fetched && (
              <button
                onClick={fetchPhotos}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#3B82F6",
                  padding: 0,
                }}
              >
                Refresh
              </button>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px",
              }}
            >
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "1",
                      background: "#F3F4F6",
                      borderRadius: "10px",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      height: "10px",
                      background: "#F3F4F6",
                      borderRadius: "4px",
                      width: "60%",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && photos.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 16px",
                textAlign: "center",
                border: `2px dashed ${C.border}`,
                borderRadius: "12px",
                background: C.rowZebra,
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: C.white,
                  border: `1.5px dashed ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <svg
                  width="26"
                  height="26"
                  fill="none"
                  stroke="#D1D5DB"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: C.textLight,
                }}
              >
                No photos uploaded yet
              </div>
              {canManage && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#C0C0C0",
                    marginTop: "4px",
                  }}
                >
                  Upload the first photo above
                </div>
              )}
            </div>
          )}

          {/* Photo grid */}
          {!loading && photos.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "14px",
              }}
            >
              {photos.map((photo) => {
                const ts = getTypeStyle(photo.photo_type);
                return (
                  <div
                    key={photo.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {/* Square image card */}
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: `1px solid ${C.border}`,
                        background: C.rowZebra,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        cursor: "pointer",
                      }}
                      onClick={() => setLightboxPhoto(photo)}
                      onMouseEnter={(e) => {
                        e.currentTarget.querySelector(
                          ".photo-overlay",
                        ).style.opacity = "1";
                        e.currentTarget.querySelector("img").style.transform =
                          "scale(1.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.querySelector(
                          ".photo-overlay",
                        ).style.opacity = "0";
                        e.currentTarget.querySelector("img").style.transform =
                          "scale(1)";
                      }}
                    >
                      <img
                        src={toImgUrl(photo.file_path)}
                        alt={photo.caption || "Asset photo"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                          display: "block",
                        }}
                        onError={(e) => {
                          e.target.src = FALLBACK_SRC;
                        }}
                      />

                      {/* Hover overlay */}
                      <div
                        className="photo-overlay"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.45)",
                          opacity: 0,
                          transition: "opacity 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* View btn */}
                        <button
                          onClick={() => setLightboxPhoto(photo)}
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: C.white,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          }}
                          title="View"
                        >
                          <svg
                            width="15"
                            height="15"
                            fill="none"
                            stroke={C.text}
                            viewBox="0 0 24 24"
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
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        {/* Delete btn */}
                        {canManage && (
                          <button
                            onClick={() => handleDelete(photo.id)}
                            disabled={deletingId === photo.id}
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              background: C.white,
                              border: "none",
                              cursor:
                                deletingId === photo.id
                                  ? "not-allowed"
                                  : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                              opacity: deletingId === photo.id ? 0.6 : 1,
                            }}
                            title="Delete"
                          >
                            {deletingId === photo.id ? (
                              <Spinner size={14} color="#EF4444" />
                            ) : (
                              <svg
                                width="14"
                                height="14"
                                fill="none"
                                stroke="#EF4444"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Type badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "7px",
                          left: "7px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            padding: "2px 8px",
                            borderRadius: "50px",
                            backgroundColor: ts.bg,
                            color: ts.color,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                          }}
                        >
                          {getTypeLabel(photo.photo_type)}
                        </span>
                      </div>
                    </div>

                    {/* Caption — BUG FIX: removed duplicate color property */}
                    <div
                      style={{
                        fontSize: "11px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        paddingLeft: "2px",
                        fontStyle: photo.caption ? "normal" : "italic",
                        color: photo.caption ? C.textLight : "#C0C0C0",
                      }}
                    >
                      {photo.caption || "No caption"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </>
  );
};

export default AssetPhotoPanel;
