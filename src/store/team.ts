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

interface TeamMember {
  userid: number;
  firstname: string;
  s_pv: number;
  l_pv: number;
  r_pv: number;
}

interface Sponsor {
  userid: string;
  name: string;
}

interface Upline {
  userid: string;
  name: string;
}

interface Children {
  left: TeamMember[];
  right: TeamMember[];
}

interface User {
  userid: number;
  firstname: string;
  ref_code: string;
  s_pv: number;
  l_pv: number;
  r_pv: number;
}

interface TeamData {
  user: User;
  sponsor: Sponsor;
  upline: Upline;
  children: Children;
  total_referrals: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TeamStore {
  // State
  teamData: TeamData | null;
  loading: boolean;
  error: string | null;

  // API Methods
  getTeamData: () => Promise<ApiResponse<TeamData>>;

  // Actions
  fetchTeamData: () => Promise<void>;
  clearError: () => void;
  setTeamData: (teamData: TeamData) => void;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  // Initial state
  teamData: null,
  loading: false,
  error: null,

  // API Methods
  getTeamData: async () => {
    return apiClient
      .get("/my-team")
      .then((response) => {
        return { success: true, data: response.data.data || response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || "Failed to fetch team data",
        };
      });
  },

  // Actions
  fetchTeamData: async () => {
    set({ loading: true, error: null });

    const result = await get().getTeamData();

    if (!result.success || !result.data) {
      const errorMessage = result.error || "Failed to fetch team data";
      set({
        teamData: null,
        loading: false,
        error: errorMessage,
      });
      return;
    }

    console.log("Fetched team data:", result.data);
    set({
      teamData: result.data,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  setTeamData: (teamData: TeamData) => set({ teamData }),
}));

export const useTeam = () => useTeamStore();
