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

// Types based on actual API response
export interface InvestmentDataItem {
  inv_id: number;
  inv_date: string;
  inv_amount: string;
  p_amount: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING" | "CANCELLED";
  coin_name: string;
}

export interface InvestmentApiResponse {
  success: boolean;
  data?: {
    investments: InvestmentDataItem[];
    total_count: number;
  };
  error?: string;
  message?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface InvestmentStore {
  // State
  investmentData: InvestmentDataItem[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // API Methods
  fetchInvestments: () => Promise<ApiResponse<InvestmentDataItem[]>>;
  refreshInvestments: () => Promise<void>;

  // Actions
  clearError: () => void;
  reset: () => void;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  // Initial state
  investmentData: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  // API Methods
  fetchInvestments: async () => {
    const state = get();

    // Prevent multiple simultaneous requests
    if (state.isLoading) {
      return { success: false, error: "Request already in progress" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get("/my-investment");

      if (response.data?.success && response.data?.data?.investments) {
        set({
          investmentData: response.data.data.investments,
          totalCount: response.data.data.total_count || 0,
          isLoading: false,
          error: null,
          lastFetched: Date.now(),
        });
        return { success: true, data: response.data.data.investments };
      } else {
        const errorMessage =
          response.data?.error || "Failed to fetch investment data";
        set({
          investmentData: [],
          totalCount: 0,
          isLoading: false,
          error: errorMessage,
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while fetching investments";

      set({
        investmentData: [],
        totalCount: 0,
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  refreshInvestments: async () => {
    const state = get();

    // Force refresh by clearing lastFetched
    set({ lastFetched: null });
    await state.fetchInvestments();
  },

  // Actions
  clearError: () => set({ error: null }),

  reset: () =>
    set({
      investmentData: [],
      totalCount: 0,
      isLoading: false,
      error: null,
      lastFetched: null,
    }),
}));

export const useInvestment = () => useInvestmentStore();
