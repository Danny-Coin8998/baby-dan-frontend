import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminAuthStore {
  // State
  isAdminAuthenticated: boolean;
  adminUsername: string | null;
  adminLoginTime: number | null;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  checkAdminSession: () => boolean;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

// Session timeout: 24 hours
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAdminAuthenticated: false,
      adminUsername: null,
      adminLoginTime: null,
      error: null,
      _hasHydrated: false,

      // Admin login (server-side validation via API)
      adminLogin: async (username: string, password: string): Promise<boolean> => {
        try {
          const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              isAdminAuthenticated: true,
              adminUsername: username,
              adminLoginTime: Date.now(),
              error: null,
            });
            return true;
          } else {
            set({
              isAdminAuthenticated: false,
              adminUsername: null,
              adminLoginTime: null,
              error: data.message || "Invalid username or password",
            });
            return false;
          }
        } catch (error) {
          console.error("Login error:", error);
          set({
            isAdminAuthenticated: false,
            adminUsername: null,
            adminLoginTime: null,
            error: "An error occurred during login",
          });
          return false;
        }
      },

      // Admin logout
      adminLogout: () => {
        set({
          isAdminAuthenticated: false,
          adminUsername: null,
          adminLoginTime: null,
          error: null,
        });
      },

      // Check if session is still valid
      checkAdminSession: (): boolean => {
        const { isAdminAuthenticated, adminLoginTime } = get();

        if (!isAdminAuthenticated || !adminLoginTime) {
          return false;
        }

        const now = Date.now();
        const sessionAge = now - adminLoginTime;

        // Check if session has expired
        if (sessionAge > SESSION_TIMEOUT) {
          get().adminLogout();
          return false;
        }

        return true;
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set hydration state
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: "admin-auth-storage", // localStorage key
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminUsername: state.adminUsername,
        adminLoginTime: state.adminLoginTime,
      }),
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated after rehydration completes
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useAdminAuth = () => useAdminAuthStore();
