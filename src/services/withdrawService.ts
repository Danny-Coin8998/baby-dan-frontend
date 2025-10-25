import { ethers } from "ethers";
import { useWithdrawStore } from "@/store/withdraw";

// Environment variables
const PAYMENT_WALLET_PRIVATE_KEY =
  process.env.NEXT_PUBLIC_PAYMENT_WALLET_PRIVATE_KEY;
const DAN_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_DAN_TOKEN_ADDRESS;
const BSC_RPC_URL =
  process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed.binance.org/";

// ERC-20 ABI for token operations
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

interface WithdrawRequest {
  amount: number;
  wallet_address: string;
}

interface WithdrawResponse {
  success: boolean;
  data?: {
    amount: number;
    recipient: string;
    transactionHash: string;
    blockNumber: number;
  };
  error?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
}

class WithdrawService {
  private async getProvider(): Promise<ethers.JsonRpcProvider> {
    return new ethers.JsonRpcProvider(BSC_RPC_URL);
  }

  private async getWallet(): Promise<ethers.Wallet> {
    if (!PAYMENT_WALLET_PRIVATE_KEY) {
      throw new Error("Payment wallet private key not configured");
    }

    const provider = await this.getProvider();
    return new ethers.Wallet(PAYMENT_WALLET_PRIVATE_KEY, provider);
  }

  private async getTokenContract(): Promise<ethers.Contract> {
    if (!DAN_TOKEN_ADDRESS) {
      throw new Error("DAN token address not configured");
    }

    const wallet = await this.getWallet();
    const checksummedTokenAddress = ethers.getAddress(DAN_TOKEN_ADDRESS);

    return new ethers.Contract(checksummedTokenAddress, ERC20_ABI, wallet);
  }

  async withdrawTokens(request: WithdrawRequest): Promise<WithdrawResponse> {
    try {
      console.log("=== WITHDRAW SERVICE DEBUG ===");
      console.log("Withdraw request:", request);

      // Validate required fields
      if (!request.amount || !request.wallet_address) {
        return {
          success: false,
          error: "Missing required fields: amount, wallet_address",
        };
      }

      // Validate addresses
      try {
        ethers.getAddress(request.wallet_address);
        ethers.getAddress(DAN_TOKEN_ADDRESS!);
      } catch (addressError) {
        return {
          success: false,
          error: "Invalid wallet or token address format",
        };
      }

      // Get token contract and wallet
      const tokenContract = await this.getTokenContract();
      const wallet = await this.getWallet();

      // Get token decimals
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.parseUnits(
        request.amount.toString(),
        decimals
      );

      // Check payment wallet balance
      const paymentWalletBalance = await tokenContract.balanceOf(
        wallet.address
      );
      console.log(
        `Payment wallet balance: ${ethers.formatUnits(
          paymentWalletBalance,
          decimals
        )} DAN`
      );

      if (paymentWalletBalance < amountInWei) {
        return {
          success: false,
          error: "Insufficient balance in payment wallet",
        };
      }

      // Properly checksum the recipient address
      const checksummedRecipientAddress = ethers.getAddress(
        request.wallet_address
      );

      console.log(
        `Transferring ${
          request.amount
        } DAN (${amountInWei.toString()} wei) to ${checksummedRecipientAddress}`
      );

      // Execute the token transfer
      const transferTx = await tokenContract.transfer(
        checksummedRecipientAddress,
        amountInWei
      );

      console.log("Transfer transaction submitted:", transferTx.hash);

      // Wait for transaction confirmation
      const receipt = await transferTx.wait();
      console.log("Transfer confirmed in block:", receipt.blockNumber);

      // Send withdrawal data to API using store
      try {
        const { submitWithdraw } = useWithdrawStore.getState();
        const apiResponse = await submitWithdraw({
          dan_amount: request.amount,
          txn_hash: transferTx.hash,
        });
        console.log("Withdrawal data sent to API:", apiResponse.data);
      } catch (apiError) {
        console.error("Failed to send withdrawal data to API:", apiError);
        // Don't fail the withdrawal if API call fails
      }

      return {
        success: true,
        data: {
          amount: request.amount,
          recipient: checksummedRecipientAddress,
          transactionHash: transferTx.hash,
          blockNumber: receipt.blockNumber,
        },
        transactionHash: transferTx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("Withdraw service error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getPaymentWalletBalance(): Promise<{
    balance: number;
    symbol: string;
  } | null> {
    try {
      const tokenContract = await this.getTokenContract();
      const wallet = await this.getWallet();

      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();
      const balance = await tokenContract.balanceOf(wallet.address);

      return {
        balance: parseFloat(ethers.formatUnits(balance, decimals)),
        symbol: symbol,
      };
    } catch (error) {
      console.error("Error getting payment wallet balance:", error);
      return null;
    }
  }
}

export const withdrawService = new WithdrawService();
