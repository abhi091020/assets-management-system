// src/store/authStore.js
import { create } from "zustand";
import { getMyPermissionsApi } from "../api/permissionApi.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const TOKEN_KEY = "ams_token";
const USER_KEY = "ams_user";
const PERMISSIONS_KEY = "ams_permissions";

function saveToStorage(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage full or private mode — silent fail
  }
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PERMISSIONS_KEY);
}

function loadFromStorage() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const rawPerms = localStorage.getItem(PERMISSIONS_KEY);
    if (!token || !raw) return { token: null, user: null, permissions: {} };
    return {
      token,
      user: JSON.parse(raw),
      permissions: rawPerms ? JSON.parse(rawPerms) : {},
    };
  } catch {
    return { token: null, user: null, permissions: {} };
  }
}

function savePermissionsToStorage(permissions) {
  try {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
  } catch {
    /* silent */
  }
}

// ── Role hierarchy (higher index = more permissions) ──────────────────────────
const ROLE_RANK = {
  Viewer: 0,
  Auditor: 1,
  AssetManager: 2,
  Admin: 3,
  SuperAdmin: 4,
};

// ── Store ─────────────────────────────────────────────────────────────────────
const useAuthStore = create((set, get) => {
  // Initialise from localStorage on store creation
  const { token, user, permissions } = loadFromStorage();

  return {
    // ── State ──────────────────────────────────────────────────────────────
    token,
    user,
    isAuthenticated: !!token && !!user,
    isInitialised: true, // sync init — always true after creation

    // ── Permission state ───────────────────────────────────────────────────
    // Map: moduleKey → { can_view, can_add, can_edit, can_delete, can_approve, can_export }
    permissions,
    permissionsLoaded: Object.keys(permissions).length > 0,

    // ── Auth Actions ───────────────────────────────────────────────────────

    /** Called after successful login API response */
    async login(token, user) {
      saveToStorage(token, user);
      set({ token, user, isAuthenticated: true });
      // Fetch permissions immediately after login
      await get().fetchMyPermissions();
    },

    /** Called on logout button or 401 interceptor */
    logout() {
      clearStorage();
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        permissions: {},
        permissionsLoaded: false,
      });
    },

    /** Update stored user profile (e.g. after profile edit) */
    updateUser(updatedUser) {
      const merged = { ...get().user, ...updatedUser };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(merged));
      } catch {
        /* silent */
      }
      set({ user: merged });
    },

    // ── Permission Actions ─────────────────────────────────────────────────

    /** Fetch permissions from API — called on login + app mount */
    async fetchMyPermissions() {
      const { user } = get();
      if (!user) return;

      // SuperAdmin always has full access — skip API call
      if (user.role === "SuperAdmin") {
        set({ permissionsLoaded: true });
        return;
      }

      try {
        const res = await getMyPermissionsApi();
        const perms = res.data?.data?.permissions ?? {};
        savePermissionsToStorage(perms);
        set({ permissions: perms, permissionsLoaded: true });
      } catch {
        // Keep existing cached permissions on failure — silent
        set({ permissionsLoaded: true });
      }
    },

    /** Directly set permissions (used after SuperAdmin matrix changes) */
    setPermissions(permissions) {
      savePermissionsToStorage(permissions);
      set({ permissions, permissionsLoaded: true });
    },

    // ── Permission Helpers (DB-driven) ─────────────────────────────────────

    /**
     * Primary check — use this everywhere in components
     * hasPermission("assets", "can_add") → true / false
     */
    hasPermission(moduleKey, action) {
      const { user, permissions } = get();
      if (!user) return false;
      if (user.role === "SuperAdmin") return true;
      return !!permissions?.[moduleKey]?.[action];
    },

    /** Can the user see this page / sidebar item at all? */
    canView(moduleKey) {
      return get().hasPermission(moduleKey, "can_view");
    },
    canAdd(moduleKey) {
      return get().hasPermission(moduleKey, "can_add");
    },
    canEdit(moduleKey) {
      return get().hasPermission(moduleKey, "can_edit");
    },
    canDelete(moduleKey) {
      return get().hasPermission(moduleKey, "can_delete");
    },
    canApprove(moduleKey) {
      return get().hasPermission(moduleKey, "can_approve");
    },
    canExport(moduleKey) {
      return get().hasPermission(moduleKey, "can_export");
    },

    // ── Legacy Role Helpers (unchanged — keep all existing code working) ───

    /** Check if current user has one of the given roles */
    hasRole(...roles) {
      const { user } = get();
      if (!user) return false;
      return roles.includes(user.role);
    },

    /** Check if current user's role rank >= minRole rank */
    hasMinRole(minRole) {
      const { user } = get();
      if (!user) return false;
      return (ROLE_RANK[user.role] ?? -1) >= (ROLE_RANK[minRole] ?? 999);
    },

    /** Convenience getters */
    isSuperAdmin() {
      return get().user?.role === "SuperAdmin";
    },
    isAdmin() {
      return get().hasMinRole("Admin");
    },
    isManager() {
      return get().hasMinRole("AssetManager");
    },
  };
});

export default useAuthStore;
