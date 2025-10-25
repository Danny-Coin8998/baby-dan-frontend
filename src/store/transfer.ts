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

interface TransferData {
  dan_amount: number;
  to_wallet_address: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TransferStore {
  // State
  loading: boolean;
  error: string | null;

  // API Methods
  transferTokens: (
    data: TransferData
  ) => Promise<ApiResponse<{ message: string }>>;

  // Actions
  clearError: () => void;
}

export const useTransferStore = create<TransferStore>((set, get) => ({
  // Initial state
  loading: false,
  error: null,

  // API Methods
  transferTokens: async (data: TransferData) => {
    set({ loading: true, error: null });

    return apiClient
      .post("/transfer", data)
      .then((response) => {
        set({ loading: false, error: null });
        return { success: true, data: response.data };
      })
      .catch((error) => {
        const errorMessage =
          error?.response?.data?.error || "Failed to transfer tokens";
        set({ loading: false, error: errorMessage });
        return {
          success: false,
          error: errorMessage,
        };
      });
  },

  // Actions
  clearError: () => set({ error: null }),
}));

export const useTransfer = () => useTransferStore();
