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

// Types
export interface DepositRequest {
  dan_amount: number;
  txn_hash: string;
}

export interface DepositResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    dan_amount: number;
    txn_hash: string;
    timestamp: string;
  };
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface DepositStore {
  // State
  isLoading: boolean;
  error: string | null;
  depositHistory: DepositResponse[];

  // API Methods
  sendDeposit: (
    depositData: DepositRequest
  ) => Promise<ApiResponse<DepositResponse>>;
  getDepositHistory: () => Promise<ApiResponse<DepositResponse[]>>;
  testConnection: () => Promise<ApiResponse<boolean>>;

  // Actions
  clearError: () => void;
  addDepositToHistory: (deposit: DepositResponse) => void;
  clearDepositHistory: () => void;
}

export const useDepositStore = create<DepositStore>((set) => ({
  // Initial state
  isLoading: false,
  error: null,
  depositHistory: [],

  // API Methods
  sendDeposit: async (depositData: DepositRequest) => {
    return apiClient
      .post("/deposit", depositData)
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || error.message,
        };
      });
  },

  getDepositHistory: async () => {
    return apiClient
      .get("/deposit/history")
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || error.message,
        };
      });
  },

  testConnection: async () => {
    return apiClient
      .get("/deposit", { timeout: 5000 })
      .then(() => {
        return { success: true, data: true };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || error.message,
        };
      });
  },

  // Actions
  clearError: () => set({ error: null }),

  addDepositToHistory: (deposit: DepositResponse) => {
    set((state) => ({
      depositHistory: [deposit, ...state.depositHistory],
    }));
  },

  clearDepositHistory: () => set({ depositHistory: [] }),
}));

export const useDeposit = () => useDepositStore();
