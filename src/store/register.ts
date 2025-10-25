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
export interface RegisterRequest {
  ref?: string;
  side?: string;
  firstname: string;
  lastname: string;
  wallet_address: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    userid: number;
    username: string;
    firstname: string;
    lastname: string;
    wallet_address: string;
    registration_date: string;
  };
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RegisterStore {
  // State
  isLoading: boolean;
  error: string | null;
  success: boolean;
  formData: RegisterRequest;

  // API Methods
  signUp: (
    registerData: RegisterRequest
  ) => Promise<ApiResponse<RegisterResponse>>;

  // Actions
  setFormData: (data: Partial<RegisterRequest>) => void;
  clearError: () => void;
  clearSuccess: () => void;
  resetForm: () => void;
  setRefAndSide: (ref?: string, side?: string) => void;
  setSuccess: (success: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFormData: RegisterRequest = {
  ref: "",
  side: "",
  firstname: "",
  lastname: "",
  wallet_address: "",
};

export const useRegisterStore = create<RegisterStore>((set) => ({
  // Initial state
  isLoading: false,
  error: null,
  success: false,
  formData: initialFormData,

  // API Methods
  signUp: async (registerData: RegisterRequest) => {
    return apiClient
      .post("/auth/sign-up", registerData)
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

  // Actions
  setFormData: (data: Partial<RegisterRequest>) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  clearError: () => set({ error: null }),

  clearSuccess: () => set({ success: false }),

  resetForm: () =>
    set({ formData: initialFormData, error: null, success: false }),

  setRefAndSide: (ref?: string, side?: string) => {
    set((state) => ({
      formData: {
        ...state.formData,
        ref: ref || "",
        side: side || "",
      },
    }));
  },

  setSuccess: (success: boolean) => set({ success }),

  setError: (error: string | null) => set({ error }),
}));

export const useRegister = () => useRegisterStore();
