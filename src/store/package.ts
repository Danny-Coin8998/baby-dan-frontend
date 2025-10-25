import { create } from "zustand";
import axios from "axios";
import { usdtTransferService } from "@/services/usdtTransferService";

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

  // USDT Payment State
  isProcessingPayment: boolean;
  transactionHash: string | null;
  paymentError: string | null;
  estimatedGasCost: string | null;
  bnbBalance: string | null;

  // API Methods
  getPackages: () => Promise<ApiResponse<PackageApiResponse["data"]>>;
  buyPackage: (
    packageId: number
  ) => Promise<ApiResponse<{ message?: string; success?: boolean }>>;

  // Actions
  fetchPackages: () => Promise<void>;
  purchasePackage: (
    packageId: number
  ) => Promise<{ success: boolean; error?: string; paymentError?: string }>;
  setSelectedPackage: (packageId: number) => void;
  setSelectedAccount: (accountId: string) => void;
  setCurrentIndex: (index: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  clearError: () => void;
  clearPaymentError: () => void;
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

  // USDT Payment State
  isProcessingPayment: false,
  transactionHash: null,
  paymentError: null,
  estimatedGasCost: null,
  bnbBalance: null,

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
    const { packages } = get();
    const selectedPkg = packages.find(
      (pkg: PackageItem) => pkg.p_id === packageId
    );

    if (!selectedPkg) {
      set({ error: "Package not found" });
      return { success: false, error: "Package not found" };
    }

    set({
      buyingPackage: true,
      error: null,
      paymentError: null,
      transactionHash: null,
      estimatedGasCost: null,
      bnbBalance: null,
    });

    try {
      // Step 1: Process USDT payment
      set({ isProcessingPayment: true });

      console.log(`Processing USDT payment: ${selectedPkg.p_amount} USDT`);

      // Ensure wallet is properly connected before proceeding
      let userAddress: string;
      try {
        userAddress = await usdtTransferService.ensureWalletConnected();
        console.log("Wallet connected successfully:", userAddress);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to connect wallet. Please ensure MetaMask is installed and unlocked.";
        set({
          paymentError: errorMsg,
          isProcessingPayment: false,
          buyingPackage: false,
        });
        return { success: false, paymentError: errorMsg };
      }

      // Check USDT balance before attempting transfer
      console.log(`Checking USDT balance for address: ${userAddress}`);
      console.log(`Required amount: ${selectedPkg.p_amount} USDT`);

      // Debug USDT token info
      try {
        const debugInfo = await usdtTransferService.debugUSDTInfo();
        console.log("USDT Debug Info:", debugInfo);
      } catch (debugError) {
        console.error("Failed to get USDT debug info:", debugError);
      }

      // Check for pending transactions
      try {
        const pendingCheck = await usdtTransferService.checkPendingTransactions(
          userAddress
        );
        console.log("Pending transactions check:", pendingCheck);
        if (pendingCheck.hasPending) {
          console.warn(
            `Warning: ${pendingCheck.pendingCount} pending transactions detected. This might affect your balance.`
          );
        }
      } catch (pendingError) {
        console.error("Failed to check pending transactions:", pendingError);
      }

      // Add a small delay to ensure blockchain state consistency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const balanceCheck = await usdtTransferService.checkUSDTBalance(
        userAddress,
        selectedPkg.p_amount
      );

      console.log("Balance check result:", balanceCheck);

      if (!balanceCheck.sufficient) {
        // Check if this is due to a user cancellation during balance check
        if (
          balanceCheck.currentBalance === 0 &&
          balanceCheck.formattedBalance === "0.00"
        ) {
          set({
            paymentError: "Transaction cancelled by user",
            isProcessingPayment: false,
            buyingPackage: false,
          });
          return {
            success: false,
            paymentError: "Transaction cancelled by user",
          };
        }

        const errorMsg = `Insufficient USDT balance. Required: ${selectedPkg.p_amount} USDT, Available: ${balanceCheck.formattedBalance} USDT`;
        set({
          paymentError: errorMsg,
          isProcessingPayment: false,
          buyingPackage: false,
        });
        return { success: false, paymentError: errorMsg };
      }

      console.log(
        `USDT balance check passed: ${balanceCheck.formattedBalance} USDT available`
      );

      console.log(`Initiating USDT transfer: ${selectedPkg.p_amount} USDT`);

      const transferResult = await usdtTransferService.transferUSDT(
        selectedPkg.p_amount,
        userAddress
      );

      if (!transferResult.success) {
        const errorMsg = transferResult.error || "USDT payment failed";

        // Check if it's a user cancellation
        if (
          errorMsg.includes("cancelled by user") ||
          errorMsg.includes("user rejected")
        ) {
          set({
            paymentError: "Transaction cancelled by user",
            isProcessingPayment: false,
            buyingPackage: false,
          });
          return {
            success: false,
            paymentError: "Transaction cancelled by user",
          };
        }

        set({
          paymentError: errorMsg,
          isProcessingPayment: false,
          buyingPackage: false,
        });
        return { success: false, paymentError: errorMsg };
      }

      console.log("USDT payment successful:", transferResult.transactionHash);
      console.log(`Gas used: ${transferResult.gasUsed?.toString() || "N/A"}`);

      set({
        transactionHash: transferResult.transactionHash,
        isProcessingPayment: false,
      });

      // Step 2: Call backend API to record the package purchase
      console.log(
        `Recording package purchase in backend for package ${packageId}`
      );
      const result = await get().buyPackage(packageId);

      if (result.success) {
        console.log("Package purchase recorded successfully in backend");
        // Refresh packages to update user balance and package availability
        await get().fetchPackages();
        set({
          paymentError: null,
          error: null,
        });
        return { success: true };
      } else {
        const errorMsg = result.error || "Failed to record package purchase";
        console.error("Backend API error:", errorMsg);

        // Even if backend fails, the USDT payment was successful
        // Show a warning but don't treat it as complete failure
        set({
          error: `Payment successful but failed to record purchase: ${errorMsg}. Please contact support with transaction hash: ${transferResult.transactionHash}`,
        });

        return {
          success: false,
          error: errorMsg,
          paymentError: `Payment completed but system error occurred. Transaction: ${transferResult.transactionHash}`,
        };
      }
    } catch (error) {
      console.error("Package purchase error:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Purchase failed";
      set({
        error: errorMsg,
        paymentError: null,
      });
      return { success: false, error: errorMsg };
    } finally {
      set({
        buyingPackage: false,
        isProcessingPayment: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  clearPaymentError: () => set({ paymentError: null }),
}));

export const usePackage = () => usePackageStore();
