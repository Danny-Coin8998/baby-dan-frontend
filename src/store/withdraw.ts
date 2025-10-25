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

interface BalanceData {
  userid: number;
  baby_dan_balance: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface WithdrawData {
  dan_amount: number;
  txn_hash: string;
}

interface PreWithdrawData {
  dan_amount: number;
}

interface PreWithdrawResponse {
  can_withdraw: boolean;
  attempted: number;
  limit_24h: number;
  used_last_24h: number;
  remaining_allowance: number;
  projected_total: number;
  balance: {
    current: number;
    after: number;
    insufficient: boolean;
    shortfall: number;
  };
  cap: {
    exceeded: boolean;
  };
}

interface WithdrawStore {
  // State
  balance: BalanceData | null;
  loading: boolean;
  error: string | null;

  // API Methods
  getBalance: () => Promise<ApiResponse<BalanceData>>;
  preWithdrawCheck: (
    data: PreWithdrawData
  ) => Promise<ApiResponse<PreWithdrawResponse>>;
  submitWithdraw: (
    data: WithdrawData
  ) => Promise<ApiResponse<{ message: string }>>;

  // Actions
  fetchBalance: () => Promise<void>;
  clearError: () => void;
}

export const useWithdrawStore = create<WithdrawStore>((set, get) => ({
  // Initial state
  balance: null,
  loading: false,
  error: null,

  // API Methods
  getBalance: async () => {
    return apiClient
      .get("/get-balance")
      .then((response) => {
        return { success: true, data: response.data.data || response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || "Failed to fetch balance",
        };
      });
  },

  preWithdrawCheck: async (data: PreWithdrawData) => {
    return apiClient
      .post("/withdraw/pre", data)
      .then((response) => {
        return { success: true, data: response.data.data || response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error:
            error?.response?.data?.error || "Failed to check withdrawal limits",
        };
      });
  },

  submitWithdraw: async (data: WithdrawData) => {
    return apiClient
      .post("/withdraw", data)
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || "Failed to submit withdrawal",
        };
      });
  },

  // Actions
  fetchBalance: async () => {
    set({ loading: true, error: null });

    const result = await get().getBalance();

    if (!result.success || !result.data) {
      const errorMessage = result.error || "Failed to fetch balance";
      set({
        balance: null,
        loading: false,
        error: errorMessage,
      });
      return;
    }

    console.log("Fetched balance data:", result.data);
    set({
      balance: result.data,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export const useWithdraw = () => useWithdrawStore();
