import { create } from "zustand";
import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Types based on the API response
interface Member {
  created_at: string;
  has_invested: boolean;
  countdown_end: string | null;
}

interface Balances {
  account_balance: number;
  total_deposit: number;
  total_earned: string;
  total_withdraw: number;
  total_investment_active: string;
  total_investment: string;
  total_commission: string;
  total_transfer_in: number;
  total_transfer_out: number;
  total_referrals: number;
  earned_percentage: number;
}

interface DashboardData {
  member: Member;
  balances: Balances;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface DashboardStore {
  // State
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  data: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  // Actions
  fetchDashboard: async () => {
    const state = get();

    // Prevent multiple simultaneous requests
    if (state.isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get("/dashboard");

      if (response.data?.success && response.data?.data) {
        set({
          data: response.data.data,
          isLoading: false,
          error: null,
          lastFetched: Date.now(),
        });
      } else {
        set({
          data: null,
          isLoading: false,
          error: "Failed to fetch dashboard data",
        });
      }
    } catch (error) {
      set({
        data: null,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      data: null,
      isLoading: false,
      error: null,
      lastFetched: null,
    }),
}));

export const useDashboard = () => useDashboardStore();
