"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileStore } from "@/store/profile";
import { useWithdrawStore } from "@/store/withdraw";
import { withdrawService } from "@/services/withdrawService";

import Withdraw from "@/images/icons/withdraw.png";
import Wallet from "@/images/wallet.png";

export default function WithdrawPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<{
    transactionHash: string;
    amount: number;
  } | null>(null);
  const [withdrawWarning, setWithdrawWarning] = useState<string | null>(null);
  const [isCheckingLimits, setIsCheckingLimits] = useState(false);

  const { profile, fetchProfile } = useProfileStore();
  const {
    balance,
    fetchBalance,
    loading: balanceLoading,
    preWithdrawCheck,
  } = useWithdrawStore();

  // Fetch profile data and set wallet address
  useEffect(() => {
    fetchProfile();
    fetchBalance();
  }, [fetchProfile, fetchBalance]);

  // Set wallet address when profile data is loaded
  useEffect(() => {
    if (profile.wallet_address) {
      setWalletAddress(profile.wallet_address);
    }
  }, [profile.wallet_address]);

  const handleWithdraw = async () => {
    if (!walletAddress || !withdrawAmount) {
      setWithdrawError("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount");
      return;
    }

    if (balance && amount > balance.baby_dan_balance) {
      setWithdrawError("Insufficient balance for withdrawal");
      return;
    }

    // Clear previous messages
    setWithdrawError(null);
    setWithdrawSuccess(null);
    setWithdrawWarning(null);

    // First, check withdrawal limits
    setIsCheckingLimits(true);
    try {
      console.log("Checking withdrawal limits for amount:", amount);

      const preCheckResult = await preWithdrawCheck({
        baby_dan_amount: amount,
      });

      if (!preCheckResult.success || !preCheckResult.data) {
        setWithdrawError(
          preCheckResult.error || "Failed to check withdrawal limits"
        );
        return;
      }

      const {
        can_withdraw,
        attempted,
        limit_24h,
        used_last_24h,
        remaining_allowance,
        cap,
      } = preCheckResult.data;

      if (!can_withdraw) {
        let warningMessage = "Withdrawal not allowed. ";

        if (cap.exceeded) {
          warningMessage += `Daily withdrawal limit exceeded. You have used ${used_last_24h.toLocaleString()} DAN out of ${limit_24h.toLocaleString()} DAN limit. `;
          warningMessage += `Remaining allowance: ${remaining_allowance.toLocaleString()} DAN. `;
          warningMessage += `You attempted to withdraw ${attempted.toLocaleString()} DAN.`;
        } else {
          warningMessage += "Please check your withdrawal limits.";
        }

        setWithdrawWarning(warningMessage);
        return;
      }

      // If can_withdraw is true, proceed with the withdrawal
      console.log("✅ Pre-withdrawal check passed, proceeding with withdrawal");
    } catch (error) {
      console.error("❌ Error checking withdrawal limits:", error);
      setWithdrawError("Failed to check withdrawal limits. Please try again.");
      return;
    } finally {
      setIsCheckingLimits(false);
    }

    // Proceed with actual withdrawal
    setIsProcessingWithdraw(true);

    try {
      console.log("Processing withdrawal:", {
        amount,
        walletAddress,
      });

      const result = await withdrawService.withdrawTokens({
        amount,
        wallet_address: walletAddress,
      });

      if (result.success && result.data) {
        console.log("✅ Withdrawal successful!");
        console.log("Transaction Hash:", result.transactionHash);
        console.log("Block Number:", result.blockNumber);

        setWithdrawSuccess({
          transactionHash: result.transactionHash || "",
          amount: amount,
        });

        // Clear form
        setWithdrawAmount("");

        // Refresh balance
        fetchBalance();

        // Clear success message after 10 seconds
        setTimeout(() => {
          setWithdrawSuccess(null);
        }, 10000);
      } else {
        console.error("❌ Withdrawal failed:", result.error);
        setWithdrawError(result.error || "Withdrawal failed");
      }
    } catch (error) {
      console.error("❌ Error processing withdrawal:", error);
      setWithdrawError(
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-4 sm:space-y-6 sm:px-4">
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h1 className=" text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex items-center gap-2 sm:gap-3 md:gap-4">
            Withdraw fund
            <Image
              src={Withdraw}
              alt="withdraw"
              width={18}
              height={18}
              className="object-contain sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]"
            />
          </h1>
        </div>

        <Separator className="bg-[#989898] h-px mb-3 sm:mb-4 md:mb-5" />

        <div className="dashboard-gradient rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-10 mb-4 sm:mb-6 ">
            <div
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-center backdrop-blur-sm"
              style={{
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 235, 0.85) 60%, rgba(255, 240, 214, 0.9) 100%)",
                backdropFilter: "blur(20px)",
                boxShadow: "0px 0px 5px 0px #FFD700",
              }}
            >
              <h3 className=" text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2">
                Account Balance
              </h3>
              <p className=" text-2xl sm:text-3xl md:text-4xl font-semibold">
                {balanceLoading
                  ? "Loading..."
                  : balance
                  ? `${balance.baby_dan_balance.toLocaleString()} BBD`
                  : "0 BBD "}
              </p>
            </div>
            {/* <div
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-center backdrop-blur-sm"
              style={{
                background: "#9058FE",
                backdropFilter: "blur(20px)",
                boxShadow: "0px 0px 15px 0px #9058FE",
              }}
            >
              <h3 className=" text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2">
                Pending Withdrawals
              </h3>
              <p className=" text-2xl sm:text-3xl md:text-4xl font-semibold">
                {pendingWithdrawals}
              </p>
            </div> */}
          </div>

          <div className=" rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
            <h2 className="text-gray-800 text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              Withdraw fund
              <Image
                src={Wallet}
                alt="Wallet"
                width={16}
                height={16}
                className="object-contain sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]"
              />
            </h2>
            <Separator className="bg-[#989898] h-px mb-4 sm:mb-5" />

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-gray-800 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                  Wallet address
                </label>
                <Input
                  disabled={true}
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="bg-white border-none text-black text-sm sm:text-base focus-visible:ring-0 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl h-10 sm:h-12"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                  Withdrawal amount (BBD)
                </label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-white border-none text-black text-sm sm:text-base focus-visible:ring-0 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl h-10 sm:h-12"
                />
              </div>

              <div className="flex justify-end pt-3 sm:pt-4">
                <Button
                  onClick={handleWithdraw}
                  disabled={
                    !walletAddress ||
                    !withdrawAmount ||
                    isProcessingWithdraw ||
                    isCheckingLimits
                  }
                  size="lg"
                  className="bg-[#9058FE]  py-3 px-6 sm:py-4 sm:px-8 md:py-5 md:px-10 text-sm sm:text-base md:text-lg lg:text-xl font-normal rounded-2xl sm:rounded-3xl border-0 shadow-lg w-full sm:w-auto cursor-pointer h-12 sm:h-14 md:h-16 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingLimits ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Checking limits...
                    </>
                  ) : isProcessingWithdraw ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Error Display */}
        {withdrawError && (
          <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-900/50 rounded-lg border border-red-500">
            <p className="text-red-200 text-sm text-center">
              ⚠️ {withdrawError}
            </p>
          </div>
        )}

        {/* Warning Display */}
        {withdrawWarning && (
          <div className="max-w-2xl mx-auto mb-4 p-4 bg-yellow-900/50 rounded-lg border border-yellow-500">
            <p className="text-yellow-200 text-sm text-center">
              ⚠️ {withdrawWarning}
            </p>
          </div>
        )}

        {/* Success Display */}
        {withdrawSuccess && (
          <div className="max-w-2xl mx-auto mb-4 p-4 bg-green-900/50 rounded-lg border border-green-500">
            <p className="text-green-200 text-sm text-center">
              ✅ Withdrawal successful! {withdrawSuccess.amount} DAN sent to
              withdraw wallet
              <br />
              <span className="text-xs opacity-75">
                Transaction: {withdrawSuccess.transactionHash.substring(0, 10)}
                ...
                {withdrawSuccess.transactionHash.substring(-8)}
              </span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
