import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance for admin API calls
const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token (if backend auth is needed in future)
adminApiClient.interceptors.request.use(
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
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Admin API Error:", error);
    return Promise.reject(error);
  }
);

// Types
export interface DailyInvestment {
  day: string;
  total_amount: number;
}

export interface DailyInvestmentResponse {
  success: boolean;
  data: DailyInvestment[];
}

export interface PackageItem {
  p_id: number;
  p_name: string;
  p_percent: number;
  p_period: string;
  p_amount: number;
  p_order: number;
}

export interface PackagesResponse {
  success: boolean;
  packages: PackageItem[];
}

export interface AddPackagePayload {
  p_id: string;
  wallet_address: string;
}

export interface AddPackageResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

// Admin API Methods
export const adminService = {
  /**
   * Get daily investment data
   */
  getDailyInvestments: async (): Promise<DailyInvestmentResponse> => {
    try {
      const response = await adminApiClient.get<DailyInvestmentResponse>(
        "/admin/daily-invest"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching daily investments:", error);
      throw error;
    }
  },

  /**
   * Get all packages
   */
  getPackages: async (): Promise<PackagesResponse> => {
    try {
      const response = await adminApiClient.get<PackagesResponse>("/packages");
      return response.data;
    } catch (error) {
      console.error("Error fetching packages:", error);
      throw error;
    }
  },

  /**
   * Add package to user (admin action)
   */
  addPackageToUser: async (
    payload: AddPackagePayload
  ): Promise<AddPackageResponse> => {
    try {
      const response = await adminApiClient.post<AddPackageResponse>(
        "/admin/invest",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error adding package to user:", error);
      throw error;
    }
  },
};

export default adminService;

