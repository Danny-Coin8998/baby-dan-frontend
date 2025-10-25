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

export interface DirectReferralItem {
  no: number;
  userid: number;
  name: string;
  email: string;
  status: "VERIFIED" | "UNVERIFIED" | "PENDING";
  register_date: string;
  wallet_address?: string;
}

interface DirectReferralData {
  referrals: DirectReferralItem[];
  total_count: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface DirectStore {
  // State
  referrals: DirectReferralItem[];
  totalCount: number;
  loading: boolean;
  error: string | null;

  // API Methods
  getDirectReferrals: () => Promise<ApiResponse<DirectReferralData>>;

  // Actions
  fetchDirectReferrals: () => Promise<void>;
  clearError: () => void;
}

export const useDirectStore = create<DirectStore>((set, get) => ({
  // Initial state
  referrals: [],
  totalCount: 0,
  loading: false,
  error: null,

  // API Methods
  getDirectReferrals: async () => {
    return apiClient
      .get("/my-direct-ref")
      .then((response) => {
        return { success: true, data: response.data.data || response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error:
            error?.response?.data?.error || "Failed to fetch direct referrals",
        };
      });
  },

  // Actions
  fetchDirectReferrals: async () => {
    set({ loading: true, error: null });

    const result = await get().getDirectReferrals();

    if (!result.success || !result.data) {
      const errorMessage = result.error || "Failed to fetch direct referrals";
      set({
        referrals: [],
        totalCount: 0,
        loading: false,
        error: errorMessage,
      });
      return;
    }

    console.log("Fetched direct referrals:", result.data);
    set({
      referrals: result.data.referrals,
      totalCount: result.data.total_count,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export const useDirect = () => useDirectStore();
