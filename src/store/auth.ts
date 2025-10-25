import { create } from "zustand";
import axios from "axios";
import { ethers } from "ethers";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

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

interface User {
  userid: number;
  wallet_address: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AuthStore {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  connectedAddress: string | null;
  jwtToken: string | null;
  user: User | null;

  // API Methods
  getNonce: (walletAddress: string) => Promise<ApiResponse<{ nonce: string }>>;
  walletLogin: (
    walletAddress: string,
    signature: string,
    message: string
  ) => Promise<ApiResponse<{ token: string; user: User }>>;
  verifyToken: (token: string) => Promise<ApiResponse>;
  logout: (token: string) => Promise<ApiResponse>;
  getDashboard: () => Promise<ApiResponse>;
  getInvestment: () => Promise<ApiResponse>;
  getDirectRefs: () => Promise<ApiResponse>;
  getReferralLinks: () => Promise<ApiResponse>;
  getTeam: () => Promise<ApiResponse>;
  getHistory: () => Promise<ApiResponse>;

  // Auth Actions
  connectWallet: () => Promise<string>;
  authenticate: (
    walletAddress: string,
    signature: string,
    message: string
  ) => Promise<void>;
  login: () => Promise<void>;
  signout: () => Promise<void>;
  clearError: () => void;
  setConnectedAddress: (address: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  isLoading: false,
  error: null,
  connectedAddress: null,
  jwtToken: null,
  user: null,

  // API Methods
  getNonce: async (walletAddress: string) => {
    return apiClient
      .get(`/auth/nonce/${walletAddress}`)
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  walletLogin: async (
    walletAddress: string,
    signature: string,
    message: string
  ) => {
    return apiClient
      .post("/auth/wallet-login", { walletAddress, signature, message })
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  verifyToken: async (token: string) => {
    return apiClient
      .get("/auth/verify", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  logout: async (token: string) => {
    return apiClient
      .post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  getDashboard: async () => {
    return apiClient
      .get("/dashboard")
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  getInvestment: async () => {
    return apiClient
      .get("/my-investment")
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  getDirectRefs: async () => {
    return apiClient
      .get("/my-direct-ref/direct")
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  getReferralLinks: async () => {
    return apiClient
      .get("/ref-link/link")
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  getTeam: async () => {
    return apiClient
      .get("/my-team/team")
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  getHistory: async () => {
    return apiClient
      .get("/history")
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return { success: false, data: error?.response?.data };
      });
  },

  // Auth Actions
  connectWallet: async (): Promise<string> => {
    if (!window.ethereum) {
      throw new Error("No wallet provider found. Please install MetaMask.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);

    if (accounts.length === 0) {
      throw new Error("No accounts found. Please connect your wallet.");
    }

    const address = accounts[0];
    set({ connectedAddress: address, error: null });
    return address;
  },

  authenticate: async (
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<void> => {
    set({ isLoading: true, error: null });

    const result = await get().walletLogin(walletAddress, signature, message);

    if (!result.success || !result.data?.token) {
      const errorMessage = result.error || "Authentication failed";
      set({
        isAuthenticated: false,
        jwtToken: null,
        user: null,
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }

    localStorage.setItem("authToken", result.data.token);
    set({
      isAuthenticated: true,
      jwtToken: result.data.token,
      user: result.data.user || null,
      isLoading: false,
      error: null,
    });
  },

  login: async (): Promise<void> => {
    const state = get();

    if (state.jwtToken) {
      const result = await get().verifyToken(state.jwtToken);
      if (result.success) return;
    }

    set({ isLoading: true, error: null });

    let walletAddress = state.connectedAddress;
    if (!walletAddress) {
      walletAddress = await get().connectWallet();
    }

    const nonceResult = await get().getNonce(walletAddress);
    if (!nonceResult.success || !nonceResult.data?.nonce) {
      const errorMessage = nonceResult.error || "Failed to get nonce";
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }

    if (!window.ethereum) {
      throw new Error("No wallet provider found. Please install MetaMask.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(nonceResult.data.nonce);

    await get().authenticate(walletAddress, signature, nonceResult.data.nonce);
    set({ isLoading: false });
  },

  signout: async (): Promise<void> => {
    const { jwtToken } = get();

    if (jwtToken) {
      await get().logout(jwtToken);
    }

    localStorage.removeItem("authToken");
    set({
      isAuthenticated: false,
      jwtToken: null,
      user: null,
      connectedAddress: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  setConnectedAddress: (address: string | null) =>
    set({ connectedAddress: address }),
}));

export const useAuth = () => useAuthStore();
