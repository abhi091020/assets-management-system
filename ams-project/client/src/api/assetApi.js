// client/src/api/assetApi.js
import axiosInstance from "./axiosInstance";

function parseError(err) {
  if (!err.response) {
    return err.code === "ECONNABORTED" || err.message?.includes("timeout")
      ? { code: "TIMEOUT", message: "Request timed out. Please try again." }
      : { code: "NETWORK", message: "Cannot reach the server." };
  }
  const msg = err.response.data?.message || null;
  const s = err.response.status;
  if (s === 400)
    return { code: "BAD_REQUEST", message: msg || "Invalid request." };
  if (s === 401)
    return { code: "UNAUTHORIZED", message: msg || "Unauthorized." };
  if (s === 403) return { code: "FORBIDDEN", message: msg || "Access denied." };
  if (s === 404)
    return { code: "NOT_FOUND", message: msg || "Asset not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

// ── Asset CRUD ────────────────────────────────────────────────────────────────

export const getAssetsApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/assets", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getAssetByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/assets/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const createAssetApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/assets", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateAssetApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/assets/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateAssetStatusApi = async (id, status, statusReason = "") => {
  try {
    const res = await axiosInstance.put(`/assets/${id}/status`, {
      status,
      statusReason,
    });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteAssetApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/assets/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Photos ────────────────────────────────────────────────────────────────────

export const getAssetPhotosApi = async (assetId) => {
  try {
    const res = await axiosInstance.get(`/assets/${assetId}/photos`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const uploadAssetPhotoApi = async (
  assetId,
  file,
  photoType = "AssetPhoto",
  caption = "",
) => {
  try {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("photoType", photoType);
    if (caption) formData.append("caption", caption);

    const res = await axiosInstance.post(
      `/assets/${assetId}/photos`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteAssetPhotoApi = async (assetId, photoId) => {
  try {
    const res = await axiosInstance.delete(
      `/assets/${assetId}/photos/${photoId}`,
    );
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
