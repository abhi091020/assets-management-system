// client/src/api/notificationApi.js
import axiosInstance from "./axiosInstance";

export const getNotificationsApi = (limit = 30) =>
  axiosInstance.get(`/notifications?limit=${limit}`).then((r) => r.data);

export const markNotificationsReadApi = () =>
  axiosInstance.put("/notifications/mark-read").then((r) => r.data);

export const clearNotificationsApi = () =>
  axiosInstance.put("/notifications/clear").then((r) => r.data);
