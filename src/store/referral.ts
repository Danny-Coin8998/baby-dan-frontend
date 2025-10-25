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

interface ReferralLinks {
  left_side: string;
  right_side: string;
}

interface ReferralData {
  ref_code: string;
  referral_links: ReferralLinks;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ReferralStore {
  // State
  refCode: string;
  leftSideLink: string;
  rightSideLink: string;
  loading: boolean;
  error: string | null;

  // API Methods
  getReferralData: () => Promise<ApiResponse<ReferralData>>;

  // Actions
  fetchReferralData: () => Promise<void>;
  clearError: () => void;
}

export const useReferralStore = create<ReferralStore>((set, get) => ({
  // Initial state
  refCode: "",
  leftSideLink: "",
  rightSideLink: "",
  loading: false,
  error: null,

  // API Methods
  getReferralData: async () => {
    return apiClient
      .get("/ref-link")
      .then((response) => {
        return { success: true, data: response.data.data || response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error:
            error?.response?.data?.error || "Failed to fetch referral data",
        };
      });
  },

  // Actions
  fetchReferralData: async () => {
    set({ loading: true, error: null });

    const result = await get().getReferralData();

    if (!result.success || !result.data) {
      const errorMessage = result.error || "Failed to fetch referral data";
      set({
        refCode: "",
        leftSideLink: "",
        rightSideLink: "",
        loading: false,
        error: errorMessage,
      });
      return;
    }

    console.log("Fetched referral data:", result.data);
    set({
      refCode: result.data.ref_code,
      leftSideLink: result.data.referral_links.left_side,
      rightSideLink: result.data.referral_links.right_side,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
