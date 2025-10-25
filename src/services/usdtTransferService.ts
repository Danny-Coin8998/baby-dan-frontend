import { ethers } from "ethers";

// USDT Token Configuration (BSC Mainnet)
const USDT_TOKEN_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // Binance-Peg BSC-USD
const PAYMENT_ADDRESS = "0xAe33F5063c1d05e514dFE8356e3DAC77e58CeFb2";

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

// ERC-20 ABI for USDT token operations
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

// Types and Interfaces
export interface USDTTransferResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: bigint;
}

export interface USDTBalanceCheckResult {
  sufficient: boolean;
  currentBalance: number;
  formattedBalance: string;
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
 * USDT Transfer Service
 * Handles USDT token transfers for package purchases
 */
class USDTTransferService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * Initialize provider and signer
   */
  private async initializeProvider(): Promise<void> {
    if (!window.ethereum) {
      throw new MetaMaskError("MetaMask is not installed");
    }

    // Ensure MetaMask is connected and unlocked
    try {
      // Request account access if not already connected
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      if (error instanceof Error && error.message.includes("user rejected")) {
        throw new MetaMaskError("Please connect your MetaMask wallet");
      }
      throw new MetaMaskError("Failed to connect to MetaMask");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    // Verify network
    const network = await this.provider.getNetwork();
    if (Number(network.chainId) !== NETWORK_CONFIG.CHAIN_ID) {
      // Try to switch to BSC network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }], // 56 in hex
        });

        // Re-initialize after network switch
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();

        const newNetwork = await this.provider.getNetwork();
        if (Number(newNetwork.chainId) !== NETWORK_CONFIG.CHAIN_ID) {
          throw new NetworkError(
            `Please switch to ${NETWORK_CONFIG.CHAIN_NAME}`
          );
        }
      } catch (switchError) {
        // If switching fails, try to add the network
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x38",
                chainName: "BSC Mainnet",
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
                rpcUrls: ["https://bsc-dataseed.binance.org/"],
                blockExplorerUrls: ["https://bscscan.com/"],
              },
            ],
          });

          // Re-initialize after adding network
          this.provider = new ethers.BrowserProvider(window.ethereum);
          this.signer = await this.provider.getSigner();
        } catch (addError) {
          throw new NetworkError(
            `Please switch to ${NETWORK_CONFIG.CHAIN_NAME}. Network switching failed.`
          );
        }
      }
    }
  }

  /**
   * Get USDT token contract instance
   */
  private async getUSDTContract(): Promise<ethers.Contract> {
    if (!this.signer) {
      await this.initializeProvider();
    }

    return new ethers.Contract(USDT_TOKEN_ADDRESS, ERC20_ABI, this.signer!);
  }

  /**
   * Convert USDT amount to wei (USDT has 18 decimals on BSC)
   */
  private async convertToWei(amount: number): Promise<bigint> {
    try {
      const usdtContract = await this.getUSDTContract();
      const decimals = await usdtContract.decimals();
      console.log(`USDT Token Decimals: ${decimals}`);
      return ethers.parseUnits(amount.toString(), Number(decimals));
    } catch (error) {
      console.warn("Failed to get decimals, using default 18:", error);
      return ethers.parseUnits(amount.toString(), 18);
    }
  }

  /**
   * Convert wei to USDT amount
   */
  private async convertFromWei(amountWei: bigint): Promise<number> {
    try {
      const usdtContract = await this.getUSDTContract();
      const decimals = await usdtContract.decimals();
      return parseFloat(ethers.formatUnits(amountWei, Number(decimals)));
    } catch (error) {
      console.warn("Failed to get decimals, using default 18:", error);
      return parseFloat(ethers.formatUnits(amountWei, 18));
    }
  }

  /**
   * Handle transaction execution with proper error handling
   */
  private async executeTransaction(
    transactionPromise: Promise<ethers.ContractTransactionResponse>,
    context: string
  ): Promise<USDTTransferResult> {
    try {
      console.log(`${context}: Initiating transaction...`);
      const transaction = await transactionPromise;

      console.log(`${context}: Transaction sent, hash: ${transaction.hash}`);
      console.log(`${context}: Waiting for confirmation...`);

      const receipt = await transaction.wait();

      if (!receipt) {
        throw new Error("Transaction receipt not available");
      }

      // Verify transaction status
      if (receipt.status === 0) {
        console.error(`${context}: Transaction failed (status 0)`);
        return {
          success: false,
          error:
            "Transaction failed during execution. Please check your wallet and try again.",
        };
      }

      console.log(`${context}: Transaction confirmed successfully!`);
      console.log(`${context}: Block: ${receipt.blockNumber}`);
      console.log(`${context}: Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`${context}: Transaction hash: ${receipt.hash}`);

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
          errorMessage = "Insufficient USDT balance for transaction";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction cancelled by user";
        } else if (error.message.includes("gas")) {
          errorMessage = "Gas estimation failed or out of gas";
        } else if (error.message.includes("CALL_EXCEPTION")) {
          // Check if it's a balance issue
          if (
            error.message.includes("transfer amount exceeds balance") ||
            error.message.includes("BEP20: transfer amount exceeds balance")
          ) {
            errorMessage =
              "Insufficient USDT balance. Please check your wallet and ensure you have enough USDT tokens.";
          } else {
            errorMessage =
              "USDT transfer failed - check your balance and try again";
          }
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
   * Check if user has sufficient USDT balance for transfer
   */
  public async checkUSDTBalance(
    userAddress: string,
    requiredAmount: number
  ): Promise<USDTBalanceCheckResult> {
    try {
      console.log(`Checking USDT balance for ${userAddress}`);
      console.log(`USDT contract address: ${USDT_TOKEN_ADDRESS}`);

      // Check if provider is still connected
      if (!this.provider) {
        console.log("Provider not initialized, reinitializing...");
        await this.initializeProvider();
      }

      const usdtContract = await this.getUSDTContract();
      console.log(`Contract initialized successfully`);

      // Get balance multiple times to ensure consistency
      const balanceWei = await usdtContract.balanceOf(userAddress);
      console.log(`Raw balance (wei): ${balanceWei.toString()}`);

      const currentBalance = await this.convertFromWei(balanceWei);
      console.log(`Converted balance: ${currentBalance} USDT`);
      console.log(`Required amount: ${requiredAmount} USDT`);
      console.log(`Sufficient: ${currentBalance >= requiredAmount}`);

      // Add a small buffer to account for potential rounding issues
      const buffer = 0.000001; // 0.000001 USDT buffer
      const sufficient = currentBalance >= requiredAmount - buffer;

      console.log(
        `Balance check with buffer: ${sufficient} (buffer: ${buffer} USDT)`
      );

      return {
        sufficient,
        currentBalance,
        formattedBalance: currentBalance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    } catch (error) {
      console.error("USDT balance check failed:", error);

      // Provide more specific error information
      if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
          console.log("User rejected transaction during balance check");
        } else if (error.message.includes("network")) {
          console.log("Network error during balance check");
        } else if (error.message.includes("provider")) {
          console.log("Provider error during balance check");
        }
      }

      return {
        sufficient: false,
        currentBalance: 0,
        formattedBalance: "0.00",
      };
    }
  }

  /**
   * Transfer USDT tokens to payment address
   */
  public async transferUSDT(
    amount: number,
    fromAddress: string
  ): Promise<USDTTransferResult> {
    try {
      console.log(
        `Starting USDT transfer: ${amount} USDT from ${fromAddress} to ${PAYMENT_ADDRESS}`
      );

      // Check balance first
      const balanceCheck = await this.checkUSDTBalance(fromAddress, amount);
      if (!balanceCheck.sufficient) {
        return {
          success: false,
          error: `Insufficient USDT balance. Required: ${amount} USDT, Available: ${balanceCheck.formattedBalance} USDT`,
        };
      }

      const amountInWei = await this.convertToWei(amount);
      console.log(`Amount in Wei: ${amountInWei.toString()}`);

      // Get USDT contract and execute transfer
      const usdtContract = await this.getUSDTContract();

      // Log contract details for debugging
      console.log(`USDT contract address: ${await usdtContract.getAddress()}`);
      console.log(`From address: ${fromAddress}`);
      console.log(`To address: ${PAYMENT_ADDRESS}`);
      console.log(`Amount in Wei: ${amountInWei.toString()}`);

      // Estimate gas before transfer with better error handling
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await usdtContract.transfer.estimateGas(
          PAYMENT_ADDRESS,
          amountInWei
        );
        console.log(`Estimated gas: ${gasEstimate.toString()}`);

        // Check if user has enough BNB for gas
        const userBalance = await this.provider!.getBalance(fromAddress);
        const estimatedGasCost = gasEstimate * BigInt(5000000000); // 5 Gwei estimate
        console.log(`User BNB balance: ${ethers.formatEther(userBalance)} BNB`);
        console.log(
          `Estimated gas cost: ${ethers.formatEther(estimatedGasCost)} BNB`
        );

        if (userBalance < estimatedGasCost) {
          return {
            success: false,
            error: `Insufficient BNB for gas fees. You need approximately ${ethers.formatEther(
              estimatedGasCost
            )} BNB for this transaction.`,
          };
        }
      } catch (gasError) {
        console.warn("Gas estimation failed:", gasError);
        if (gasError instanceof Error) {
          // If gas estimation fails, it usually means the transaction would fail
          if (gasError.message.includes("transfer amount exceeds balance")) {
            return {
              success: false,
              error: "Insufficient USDT balance for transfer",
            };
          }
          return {
            success: false,
            error: `Transaction simulation failed: ${gasError.message}`,
          };
        }
      }

      console.log(
        `Transferring ${amount} USDT from ${fromAddress} to ${PAYMENT_ADDRESS}`
      );

      // Double-check balance right before transfer
      const finalBalanceCheck = await this.checkUSDTBalance(
        fromAddress,
        amount
      );
      if (!finalBalanceCheck.sufficient) {
        return {
          success: false,
          error: `Insufficient USDT balance at transfer time. Required: ${amount} USDT, Available: ${finalBalanceCheck.formattedBalance} USDT`,
        };
      }

      console.log(
        `Final balance check passed: ${finalBalanceCheck.formattedBalance} USDT available`
      );

      // Execute transfer with gas limit if estimated
      const transferPromise = gasEstimate
        ? usdtContract.transfer(PAYMENT_ADDRESS, amountInWei, {
            gasLimit: (gasEstimate * BigInt(120)) / BigInt(100),
          }) // Add 20% buffer
        : usdtContract.transfer(PAYMENT_ADDRESS, amountInWei);

      return await this.executeTransaction(
        transferPromise,
        `USDT Transfer (${amount} USDT to ${PAYMENT_ADDRESS})`
      );
    } catch (error) {
      console.error("USDT transfer failed:", error);

      // Enhanced error logging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "USDT transfer failed",
      };
    }
  }

  /**
   * Get USDT token information for debugging
   */
  public async getUSDTInfo(): Promise<{
    symbol: string;
    name: string;
    decimals: number;
    contractAddress: string;
  }> {
    try {
      const usdtContract = await this.getUSDTContract();

      const [symbol, name, decimals] = await Promise.all([
        usdtContract.symbol(),
        usdtContract.name(),
        usdtContract.decimals(),
      ]);

      return {
        symbol,
        name,
        decimals: Number(decimals),
        contractAddress: USDT_TOKEN_ADDRESS,
      };
    } catch (error) {
      console.error("Failed to get USDT info:", error);
      throw error;
    }
  }

  /**
   * Ensure wallet is connected and ready
   */
  public async ensureWalletConnected(): Promise<string> {
    try {
      // Reset provider and signer to ensure fresh connection
      this.provider = null;
      this.signer = null;

      // Initialize with fresh connection
      await this.initializeProvider();

      // Get the address to verify connection
      const address = await this.signer!.getAddress();
      console.log("Wallet connected successfully:", address);
      return address;
    } catch (error) {
      console.error("Failed to ensure wallet connection:", error);
      throw error;
    }
  }

  /**
   * Get current wallet address
   */
  public async getCurrentAddress(): Promise<string> {
    try {
      if (!this.signer) {
        await this.initializeProvider();
      }
      return await this.signer!.getAddress();
    } catch (error) {
      console.error("Failed to get current address:", error);
      throw new Error("Failed to get wallet address");
    }
  }

  /**
   * Debug method to get USDT token information
   */
  public async debugUSDTInfo(): Promise<{
    tokenAddress: string;
    symbol: string;
    name: string;
    decimals: number;
    userAddress: string;
    balance: string;
  }> {
    try {
      const usdtContract = await this.getUSDTContract();
      const userAddress = await this.getCurrentAddress();

      const [symbol, name, decimals, balanceWei] = await Promise.all([
        usdtContract.symbol(),
        usdtContract.name(),
        usdtContract.decimals(),
        usdtContract.balanceOf(userAddress),
      ]);

      const balance = await this.convertFromWei(balanceWei);

      return {
        tokenAddress: USDT_TOKEN_ADDRESS,
        symbol,
        name,
        decimals: Number(decimals),
        userAddress,
        balance: balance.toString(),
      };
    } catch (error) {
      console.error("Failed to get USDT debug info:", error);
      throw error;
    }
  }

  /**
   * Check for pending transactions that might affect balance
   */
  public async checkPendingTransactions(userAddress: string): Promise<{
    hasPending: boolean;
    pendingCount: number;
  }> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      // Note: BrowserProvider doesn't have getPendingTransactions method
      // This is a placeholder for future implementation
      console.log(
        `Checking pending transactions for ${userAddress} (not implemented)`
      );

      return {
        hasPending: false,
        pendingCount: 0,
      };
    } catch (error) {
      console.error("Failed to check pending transactions:", error);
      return {
        hasPending: false,
        pendingCount: 0,
      };
    }
  }

  /**
   * Verify a transaction on BSCScan
   */
  public getTransactionUrl(transactionHash: string): string {
    return `${NETWORK_CONFIG.BLOCK_EXPLORER}/tx/${transactionHash}`;
  }

  /**
   * Get payment address for reference
   */
  public getPaymentAddress(): string {
    return PAYMENT_ADDRESS;
  }

  /**
   * Get network configuration
   */
  public getNetworkConfig() {
    return {
      ...NETWORK_CONFIG,
      usdtTokenAddress: USDT_TOKEN_ADDRESS,
      paymentAddress: PAYMENT_ADDRESS,
    };
  }

  /**
   * Reset provider and signer (useful for wallet changes)
   */
  public reset(): void {
    this.provider = null;
    this.signer = null;
  }

  /**
   * Test USDT contract connectivity
   */
  public async testUSDTConnection(): Promise<{
    success: boolean;
    error?: string;
    details?: {
      symbol?: string;
      decimals: number;
      name?: string;
    };
  }> {
    try {
      const usdtContract = await this.getUSDTContract();

      // Test basic contract calls
      let symbol: string | undefined;
      let name: string | undefined;
      let decimals: number = 18; // Default decimals

      try {
        symbol = await usdtContract.symbol();
      } catch (error) {
        console.warn("Contract doesn't support symbol() function:", error);
      }

      try {
        name = await usdtContract.name();
      } catch (error) {
        console.warn("Contract doesn't support name() function:", error);
      }

      try {
        const contractDecimals = await usdtContract.decimals();
        decimals = Number(contractDecimals);
      } catch (error) {
        console.warn(
          "Contract doesn't support decimals() function, using default 18:",
          error
        );
      }

      // Test the basic transfer function signature exists
      try {
        const transferFunction = usdtContract.interface.getFunction("transfer");
        if (!transferFunction) {
          throw new Error("Contract does not support transfer function");
        }
      } catch (error) {
        console.error("Contract missing essential transfer function:", error);
        return {
          success: false,
          error: "Contract does not implement ERC-20 transfer function",
        };
      }

      return {
        success: true,
        details: {
          symbol,
          decimals,
          name,
        },
      };
    } catch (error) {
      console.error("USDT contract connection test failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "USDT contract connection test failed",
      };
    }
  }
}

// Export singleton instance
export const usdtTransferService = new USDTTransferService();
