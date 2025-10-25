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

interface ProfileData {
  userid: number;
  username: string;
  firstname: string;
  lastname: string;
  wallet_address: string;
  registration_date: string;
  last_login: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ProfileStore {
  // State
  profile: ProfileData;
  loading: boolean;
  updating: boolean;
  error: string | null;

  // API Methods
  getProfile: () => Promise<ApiResponse<ProfileData>>;
  updateProfile: (
    firstname: string,
    lastname: string
  ) => Promise<ApiResponse<{ message?: string; success?: boolean }>>;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfileData: (firstname: string, lastname: string) => Promise<void>;
  clearError: () => void;
  setProfile: (profile: ProfileData) => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profile: {
    userid: 0,
    username: "",
    firstname: "",
    lastname: "",
    wallet_address: "",
    registration_date: "",
    last_login: "",
  },
  loading: false,
  updating: false,
  error: null,

  // API Methods
  getProfile: async () => {
    return apiClient
      .get("/profile")
      .then((response) => {
        return { success: true, data: response.data.data || response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || "Failed to fetch profile",
        };
      });
  },

  updateProfile: async (firstname: string, lastname: string) => {
    return apiClient
      .put("/profile/fullname", { firstname, lastname })
      .then((response) => {
        return { success: true, data: response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || "Failed to update profile",
        };
      });
  },

  // Actions
  fetchProfile: async () => {
    set({ loading: true, error: null });

    const result = await get().getProfile();

    if (!result.success || !result.data) {
      const errorMessage = result.error || "Failed to fetch profile";
      set({
        profile: {
          userid: 0,
          username: "",
          firstname: "",
          lastname: "",
          wallet_address: "",
          registration_date: "",
          last_login: "",
        },
        loading: false,
        error: errorMessage,
      });
      return;
    }

    console.log("Fetched profile data:", result.data);
    set({
      profile: result.data,
      loading: false,
      error: null,
    });
  },

  updateProfileData: async (firstname: string, lastname: string) => {
    set({ updating: true, error: null });

    const result = await get().updateProfile(firstname, lastname);

    if (result.success) {
      // Update local profile state
      set((state) => ({
        profile: {
          ...state.profile,
          firstname: firstname,
          lastname: lastname,
        },
        updating: false,
        error: null,
      }));
    } else {
      set({
        updating: false,
        error: result.error || "Failed to update profile",
      });
    }
  },

  clearError: () => set({ error: null }),

  setProfile: (profile: ProfileData) => set({ profile }),
}));

export const useProfile = () => useProfileStore();
