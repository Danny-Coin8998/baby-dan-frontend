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

interface Transaction {
  t_id: number;
  userid: number;
  tran_type: string;
  coin_name: string;
  in_amount_thb: string;
  in_ex_rate: string;
  in_amount: string;
  out_amount: string;
  out_ex_rate: string;
  out_amount_thb: string;
  vat_amount: string;
  fee_amount: string;
  detail: string;
  created_datetime: string;
  admin_username: string;
  admin_status: string;
  admin_withdraw_status: string;
  admin_datetime: string;
  admin_msg: string;
  slip_url: string | null;
  deposit_date: string | null;
  deposit_time: string | null;
  wd_bank_name: string | null;
  wd_acc_no: string | null;
  wd_acc_name: string | null;
  otp_ref: string | null;
  otp_text: string | null;
  to_userid: number | null;
  inv_id: number;
  provider_amount: string;
  want_dan: string;
  out_amount_dan: string;
  fee_dan: string;
  is_show: string;
}

interface HistoryData {
  transactions: Transaction[];
  total_count: number;
  type: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface HistoryStore {
  // State
  transactions: Transaction[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  selectedType: string;
  filteredTransactions: Transaction[];
  currentPage: number;
  itemsPerPage: number;

  // API Methods
  getHistory: () => Promise<ApiResponse<HistoryData>>;

  // Actions
  fetchHistory: () => Promise<void>;
  setSelectedType: (type: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  clearError: () => void;
  filterTransactions: () => void;
  getPaginatedTransactions: () => Transaction[];
  getTotalPages: () => number;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  // Initial state
  transactions: [],
  totalCount: 0,
  loading: false,
  error: null,
  selectedType: "all",
  filteredTransactions: [],
  currentPage: 1,
  itemsPerPage: 10,

  // API Methods
  getHistory: async () => {
    return apiClient
      .get("/history")
      .then((response) => {
        return { success: true, data: response.data.data || response.data };
      })
      .catch((error) => {
        return {
          success: false,
          error: error?.response?.data?.error || "Failed to fetch history",
        };
      });
  },

  // Actions
  fetchHistory: async () => {
    set({ loading: true, error: null });

    const result = await get().getHistory();

    if (!result.success || !result.data) {
      const errorMessage = result.error || "Failed to fetch history";
      set({
        transactions: [],
        totalCount: 0,
        filteredTransactions: [],
        loading: false,
        error: errorMessage,
      });
      return;
    }

    console.log("Fetched history data:", result.data);
    set({
      transactions: result.data.transactions,
      totalCount: result.data.total_count,
      loading: false,
      error: null,
    });

    // Apply initial filtering
    get().filterTransactions();
  },

  setSelectedType: (type: string) => {
    set({ selectedType: type, currentPage: 1 });
    get().filterTransactions();
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setItemsPerPage: (items: number) => {
    set({ itemsPerPage: items, currentPage: 1 });
    get().filterTransactions();
  },

  clearError: () => set({ error: null }),

  filterTransactions: () => {
    const { transactions, selectedType } = get();

    let filtered = transactions;

    if (selectedType !== "all") {
      filtered = transactions.filter(
        (transaction) =>
          transaction.tran_type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    set({ filteredTransactions: filtered });
  },

  getPaginatedTransactions: () => {
    const { filteredTransactions, currentPage, itemsPerPage } = get();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  },

  getTotalPages: () => {
    const { filteredTransactions, itemsPerPage } = get();
    return Math.ceil(filteredTransactions.length / itemsPerPage);
  },
}));

export const useHistory = () => useHistoryStore();
