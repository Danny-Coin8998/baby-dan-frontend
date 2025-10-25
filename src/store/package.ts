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

interface PackageItem {
  p_id: number;
  p_name: string;
  p_percent: number;
  p_period: string;
  p_amount: number;
  p_order: number;
  required_dan: number;
  can_afford: boolean;
  user_balance: number;
  dan_price: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PackageApiResponse {
  success: boolean;
  data: {
    packages: PackageItem[];
    total_count: number;
    dan_price: number;
    user_balance: number;
  };
}

interface PackageStore {
  // State
  packages: PackageItem[];
  userBalance: number;
  danPrice: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
  selectedPackage: number;
  selectedAccount: string;
  currentIndex: number;
  buyingPackage: boolean;

  // API Methods
  getPackages: () => Promise<ApiResponse<PackageApiResponse["data"]>>;
  buyPackage: (
    packageId: number
  ) => Promise<ApiResponse<{ message?: string; success?: boolean }>>;

  // Actions
  fetchPackages: () => Promise<void>;
  purchasePackage: (packageId: number) => Promise<void>;
  setSelectedPackage: (packageId: number) => void;
  setSelectedAccount: (accountId: string) => void;
  setCurrentIndex: (index: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  clearError: () => void;
}

export const usePackageStore = create<PackageStore>((set, get) => ({
  // Initial state
  packages: [],
  userBalance: 0,
  danPrice: 0,
  totalCount: 0,
  loading: false,
  error: null,
  selectedPackage: 1,
  selectedAccount: "account-balance",
  currentIndex: 0,
  buyingPackage: false,

  // API Methods
  getPackages: async () => {
    return apiClient
      .get("/get-packages")
      .then((response) => {
        return { success: true, data: response.data.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || "Failed to fetch packages",
        };
      });
  },

  buyPackage: async (packageId: number) => {
    return apiClient
      .post("/buy-package", { p_id: packageId })
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || "Failed to buy package",
        };
      });
  },

  // Actions
  fetchPackages: async () => {
    set({ loading: true, error: null });

    const result = await get().getPackages();

    if (!result.success || !result.data) {
      const errorMessage = result.error || "Failed to fetch packages";
      set({
        packages: [],
        userBalance: 0,
        danPrice: 0,
        totalCount: 0,
        loading: false,
        error: errorMessage,
      });
      return;
    }

    console.log("Fetched packages data:", result.data);
    set({
      packages: result.data.packages,
      userBalance: result.data.user_balance,
      danPrice: result.data.dan_price,
      totalCount: result.data.total_count,
      loading: false,
      error: null,
    });
  },

  setSelectedPackage: (packageId: number) => {
    set({ selectedPackage: packageId });
  },

  setSelectedAccount: (accountId: string) => {
    set({ selectedAccount: accountId });
  },

  setCurrentIndex: (index: number) => {
    set({ currentIndex: index });
  },

  handlePrevious: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  handleNext: () => {
    const { currentIndex, packages } = get();
    if (currentIndex < packages.length - 3) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  purchasePackage: async (packageId: number) => {
    set({ buyingPackage: true, error: null });

    const result = await get().buyPackage(packageId);

    if (result.success) {
      // Refresh packages to update user balance and package availability
      await get().fetchPackages();
    } else {
      set({ error: result.error || "Failed to purchase package" });
    }

    set({ buyingPackage: false });
  },

  clearError: () => set({ error: null }),
}));

export const usePackage = () => usePackageStore();
