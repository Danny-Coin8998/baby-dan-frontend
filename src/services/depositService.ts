import { ethers } from "ethers";
import { useDepositStore, DepositRequest } from "@/store/deposit";

// ERC-20 ABI for token operations
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

// Network Configuration (BSC Mainnet)
const NETWORK_CONFIG = {
  CHAIN_ID: 56, // BSC Mainnet
  RPC_URL: "https://bsc-dataseed.binance.org/",
  CHAIN_NAME: "BSC Mainnet",
  NATIVE_CURRENCY: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  BLOCK_EXPLORER: "https://bscscan.com",
} as const;

// DAN Token Address (you'll need to set this)
const DAN_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_DAN_TOKEN_ADDRESS ||
  "0xaDEe649f3Df682f3735bFE7BADFfE3AA95bfDE81";

// Deposit wallet address
const DEPOSIT_WALLET_ADDRESS = "0x469bc9606e510EED0541Eb3E2D2405924126aEdB";

// Types and Interfaces
export interface DepositResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: bigint;
}

export interface BalanceCheckResult {
  sufficient: boolean;
  currentBalance: number;
  formattedBalance: string;
}

export interface DepositApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Custom Error Classes
class MetaMaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetaMaskError";
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Deposit Service
 * Handles DAN token deposits and API communication
 */
class DepositService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * Initialize provider and signer
   */
  private async initializeProvider(): Promise<void> {
    if (!window.ethereum) {
      throw new MetaMaskError("MetaMask is not installed");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    // Verify network
    const network = await this.provider.getNetwork();
    if (Number(network.chainId) !== NETWORK_CONFIG.CHAIN_ID) {
      throw new NetworkError(`Please switch to ${NETWORK_CONFIG.CHAIN_NAME}`);
    }
  }

  /**
   * Get token contract instance
   */
  private async getTokenContract(): Promise<ethers.Contract> {
    if (!this.signer) {
      await this.initializeProvider();
    }

    return new ethers.Contract(DAN_TOKEN_ADDRESS, ERC20_ABI, this.signer!);
  }

  /**
   * Convert token amount to wei
   */
  private async convertToWei(amount: number): Promise<bigint> {
    const tokenContract = await this.getTokenContract();

    let decimals: number = 18; // Default to 18 decimals for most tokens

    try {
      const contractDecimals = await tokenContract.decimals();
      decimals = Number(contractDecimals);
      console.log(`Token decimals: ${decimals}`);
    } catch (error) {
      console.warn(
        "Failed to get decimals from contract, using default 18:",
        error
      );
    }

    return ethers.parseUnits(amount.toString(), decimals);
  }

  /**
   * Convert wei to token amount
   */
  private async convertFromWei(amountWei: bigint): Promise<number> {
    const tokenContract = await this.getTokenContract();

    let decimals: number = 18; // Default to 18 decimals for most tokens

    try {
      const contractDecimals = await tokenContract.decimals();
      decimals = Number(contractDecimals);
    } catch (error) {
      console.warn(
        "Failed to get decimals from contract, using default 18:",
        error
      );
    }

    return parseFloat(ethers.formatUnits(amountWei, decimals));
  }

  /**
   * Handle transaction execution with proper error handling
   */
  private async executeTransaction(
    transactionPromise: Promise<ethers.ContractTransactionResponse>,
    context: string
  ): Promise<DepositResult> {
    try {
      console.log(`${context}: Initiating transaction...`);
      const transaction = await transactionPromise;

      console.log(`${context}: Transaction sent, waiting for confirmation...`);
      const receipt = await transaction.wait();

      if (!receipt) {
        throw new Error("Transaction receipt not available");
      }
      console.log(`${context}: Transaction confirmed - ${receipt.hash}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      console.error(`${context}: Transaction failed`, error);

      let errorMessage = "Transaction failed";
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient balance for transaction";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction cancelled by user";
        } else if (error.message.includes("gas")) {
          errorMessage = "Gas estimation failed or out of gas";
        } else if (error.message.includes("CALL_EXCEPTION")) {
          errorMessage =
            "Contract call failed - please check your connection and try again";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if user has sufficient balance for deposit
   */
  public async checkSufficientBalance(
    userAddress: string,
    requiredAmount: number
  ): Promise<BalanceCheckResult> {
    const tokenContract = await this.getTokenContract();
    const balanceWei = await tokenContract.balanceOf(userAddress);
    const currentBalance = await this.convertFromWei(balanceWei);

    return {
      sufficient: currentBalance >= requiredAmount,
      currentBalance,
      formattedBalance: currentBalance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      }),
    };
  }

  /**
   * Transfer DAN tokens to deposit wallet
   */
  public async transferToDepositWallet(
    amount: number,
    fromAddress: string
  ): Promise<DepositResult> {
    console.log(
      `Starting deposit transfer for ${amount} DAN from ${fromAddress}`
    );

    // Validate addresses
    if (!ethers.isAddress(fromAddress)) {
      return { success: false, error: "Invalid user address" };
    }
    if (!ethers.isAddress(DEPOSIT_WALLET_ADDRESS)) {
      return { success: false, error: "Invalid deposit wallet address" };
    }

    // Check user balance
    const balanceCheck = await this.checkSufficientBalance(fromAddress, amount);
    if (!balanceCheck.sufficient) {
      return {
        success: false,
        error: `Insufficient balance. Required: ${amount} DAN, Available: ${balanceCheck.formattedBalance} DAN`,
      };
    }

    const amountInWei = await this.convertToWei(amount);
    console.log(`Amount in Wei: ${amountInWei.toString()}`);

    // Get token contract and execute transfer
    const tokenContract = await this.getTokenContract();

    console.log(`Token contract address: ${await tokenContract.getAddress()}`);
    console.log(`From address: ${fromAddress}`);
    console.log(`To address: ${DEPOSIT_WALLET_ADDRESS}`);
    console.log(`Amount in Wei: ${amountInWei.toString()}`);

    // Estimate gas before transfer
    try {
      const gasEstimate = await tokenContract.transfer.estimateGas(
        DEPOSIT_WALLET_ADDRESS,
        amountInWei,
        { from: fromAddress }
      );
      console.log(`Estimated gas: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.warn("Gas estimation failed:", gasError);
    }

    console.log(
      `Transferring ${amount} DAN from ${fromAddress} to ${DEPOSIT_WALLET_ADDRESS}`
    );

    return await this.executeTransaction(
      tokenContract.transfer(DEPOSIT_WALLET_ADDRESS, amountInWei),
      `Deposit Transfer (${amount} DAN to deposit wallet)`
    );
  }

  /**
   * Send deposit data to API using Zustand store
   */
  public async sendDepositToApi(
    danAmount: number,
    transactionHash: string
  ): Promise<DepositApiResponse> {
    const depositData: DepositRequest = {
      dan_amount: danAmount,
      txn_hash: transactionHash,
    };

    const depositStore = useDepositStore.getState();
    const response = await depositStore.sendDeposit(depositData);

    if (response.success && response.data) {
      // Add to local history
      depositStore.addDepositToHistory(response.data);
    }

    return {
      success: response.success,
      message: response.data?.message || "Deposit recorded successfully",
      error: response.error,
    };
  }

  /**
   * Complete deposit process: transfer tokens and notify API
   */
  public async processDeposit(
    amount: number,
    userAddress: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
    apiSuccess?: boolean;
    apiMessage?: string;
  }> {
    // Step 1: Transfer tokens
    const transferResult = await this.transferToDepositWallet(
      amount,
      userAddress
    );

    if (!transferResult.success) {
      return {
        success: false,
        error: transferResult.error,
      };
    }

    // Step 2: Notify API
    const apiResult = await this.sendDepositToApi(
      amount,
      transferResult.transactionHash!
    );

    return {
      success: true,
      transactionHash: transferResult.transactionHash,
      apiSuccess: apiResult.success,
      apiMessage: apiResult.success ? apiResult.message : apiResult.error,
    };
  }

  /**
   * Get user's wallet address
   */
  public async getUserAddress(): Promise<string> {
    if (!this.signer) {
      await this.initializeProvider();
    }
    return await this.signer!.getAddress();
  }

  /**
   * Test API connectivity
   */
  public async testApiConnection(): Promise<boolean> {
    const depositStore = useDepositStore.getState();
    const response = await depositStore.testConnection();
    return response.success && response.data === true;
  }

  /**
   * Reset provider and signer (useful for wallet changes)
   */
  public reset(): void {
    this.provider = null;
    this.signer = null;
  }
}

// Export singleton instance
export const depositService = new DepositService();
