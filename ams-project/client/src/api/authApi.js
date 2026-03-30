// src/api/authApi.js
import axiosInstance from "./axiosInstance";

/**
 * Normalise any axios error into a plain { code, message } object
 * so callers never need to inspect error.response themselves.
 */
function parseError(error) {
  // Network / CORS / DNS failure — no response at all
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return {
        code: "TIMEOUT",
        message:
          "Request timed out. Please check your connection and try again.",
      };
    }
    return {
      code: "NETWORK",
      message:
        "Cannot reach the server. Please check your internet connection.",
    };
  }

  const status = error.response.status;
  const data = error.response.data;

  // Server sent a structured error message — prefer it
  const serverMsg = data?.message || data?.error || null;

  switch (status) {
    case 400:
      return {
        code: "BAD_REQUEST",
        message: serverMsg || "Invalid request. Please check your input.",
      };
    case 401:
      return {
        code: "UNAUTHORIZED",
        message: "Incorrect email or password. Please try again.",
      };
    case 403:
      return {
        code: "FORBIDDEN",
        message:
          serverMsg ||
          "Your account has been deactivated. Please contact your administrator.",
      };
    case 404:
      return {
        code: "NOT_FOUND",
        message: "Authentication service not found. Please contact support.",
      };
    case 422:
      return {
        code: "VALIDATION",
        message: serverMsg || "Validation failed. Please check your input.",
      };
    case 429:
      return {
        code: "RATE_LIMITED",
        message: "Too many login attempts. Please wait a moment and try again.",
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        code: "SERVER_ERROR",
        message: "A server error occurred. Please try again in a few moments.",
      };
    default:
      return {
        code: "UNKNOWN",
        message: serverMsg || "An unexpected error occurred. Please try again.",
      };
  }
}

/**
 * Login API call.
 * Returns  { success: true,  data: { token, user } }
 *       or { success: false, code, message }          — never throws
 */
export const loginApi = async ({ email, password }) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    // Handle non-standard 2xx responses where server sets success:false
    if (response.data?.success === false) {
      return {
        success: false,
        code: "API_ERROR",
        message: response.data?.message || "Login failed. Please try again.",
      };
    }

    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    const { code, message } = parseError(error);
    return { success: false, code, message };
  }
};
