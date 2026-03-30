// client/src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from "react";
import {
  getNotificationsApi,
  markNotificationsReadApi,
  clearNotificationsApi,
} from "../api/notificationApi";

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const normalized =
    typeof dateStr === "string" ? dateStr.replace(/Z$/, "") : dateStr;
  const diff = Date.now() - new Date(normalized).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function useNotifications(limit = 30) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotificationsApi(limit);
      if (res.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
        setError(null);
      }
    } catch (err) {
      console.error("useNotifications fetch error:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = useCallback(async () => {
    if (unreadCount === 0) return;
    try {
      await markNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch (err) {
      console.error("markRead error:", err);
    }
  }, [unreadCount]);

  // Clear all — empties the list immediately in UI, persists timestamp to DB
  const clearAll = useCallback(async () => {
    try {
      await clearNotificationsApi();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("clearAll error:", err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markRead,
    clearAll,
  };
}
