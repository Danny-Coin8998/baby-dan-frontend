"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileStore } from "@/store/profile";
import { useTransferStore } from "@/store/transfer";
import { useWithdrawStore } from "@/store/withdraw";
import { useSearchParams } from "next/navigation";

import MoneyIcon from "@/images/icons/money.png";
import Wallet from "@/images/wallet.png";

export default function TransferPage() {
  const [toWalletAddress, setToWalletAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<{
    amount: number;
    toAddress: string;
  } | null>(null);

  const { profile, fetchProfile } = useProfileStore();
  const { balance, fetchBalance, loading: balanceLoading } = useWithdrawStore();
  const {
    transferTokens,
    loading: transferLoading,
    clearError,
  } = useTransferStore();
  const searchParams = useSearchParams();

  // Fetch profile data and balance
  useEffect(() => {
    fetchProfile();
    fetchBalance();
  }, [fetchProfile, fetchBalance]);

  // Set wallet address from URL parameter
  useEffect(() => {
    const toAddress = searchParams.get("to");
    if (toAddress) {
      setToWalletAddress(decodeURIComponent(toAddress));
    }
  }, [searchParams]);

  const handleTransfer = async () => {
    if (!toWalletAddress || !transferAmount) {
      setTransferError("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransferError("Please enter a valid transfer amount");
      return;
    }

    if (balance && amount > balance.baby_dan_balance) {
      setTransferError("Insufficient balance for transfer");
      return;
    }

    // Basic wallet address validation
    if (!toWalletAddress.startsWith("0x") || toWalletAddress.length !== 42) {
      setTransferError("Please enter a valid wallet address");
      return;
    }

    // Clear previous messages
    setTransferError(null);
    setTransferSuccess(null);
    clearError();

    setIsProcessingTransfer(true);

    try {
      console.log("Processing transfer:", {
        dan_amount: amount,
        to_wallet_address: toWalletAddress,
      });

      const result = await transferTokens({
        dan_amount: amount,
        to_wallet_address: toWalletAddress,
      });

      if (result.success) {
        console.log("✅ Transfer successful!");
        console.log("Transfer data:", result.data);

        setTransferSuccess({
          amount: amount,
          toAddress: toWalletAddress,
        });

        // Clear form
        setTransferAmount("");
        setToWalletAddress("");

        // Refresh balance
        fetchBalance();

        // Clear success message after 10 seconds
        setTimeout(() => {
          setTransferSuccess(null);
        }, 10000);
      } else {
        console.error("❌ Transfer failed:", result.error);
        setTransferError(result.error || "Transfer failed");
      }
    } catch (error) {
      console.error("❌ Error processing transfer:", error);
      setTransferError(
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-4 sm:space-y-6 sm:px-4">
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h1 className=" text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex items-center gap-2 sm:gap-3 md:gap-4">
            Transfer BBD
            <Image
              src={MoneyIcon}
              alt="transfer"
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
          </div>

          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
            <h2 className="text-gray-800 text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              Transfer DAN Tokens
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
                  To Wallet Address
                </label>
                <Input
                  type="text"
                  value={toWalletAddress}
                  onChange={(e) => setToWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="bg-white border-none text-black text-sm sm:text-base focus-visible:ring-0 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl h-10 sm:h-12"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                  Transfer amount (DAN)
                </label>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-white border-none text-black text-sm sm:text-base focus-visible:ring-0 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl h-10 sm:h-12"
                />
              </div>

              <div className="flex justify-end pt-3 sm:pt-4">
                <Button
                  onClick={handleTransfer}
                  disabled={
                    !toWalletAddress ||
                    !transferAmount ||
                    isProcessingTransfer ||
                    transferLoading
                  }
                  size="lg"
                  className="bg-[#9058FE]  py-3 px-6 sm:py-4 sm:px-8 md:py-5 md:px-10 text-sm sm:text-base md:text-lg lg:text-xl font-normal rounded-2xl sm:rounded-3xl border-0 shadow-lg w-full sm:w-auto cursor-pointer h-12 sm:h-14 md:h-16 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingTransfer || transferLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    "Transfer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {transferError && (
          <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-900/50 rounded-lg border border-red-500">
            <p className="text-red-200 text-sm text-center">
              ⚠️ {transferError}
            </p>
          </div>
        )}

        {/* Success Display */}
        {transferSuccess && (
          <div className="max-w-2xl mx-auto mb-4 p-4 bg-green-900/50 rounded-lg border border-green-500">
            <p className="text-green-200 text-sm text-center">
              ✅ Transfer successful! {transferSuccess.amount} DAN sent to
              <br />
              <span className="text-xs opacity-75 font-mono">
                {transferSuccess.toAddress}
              </span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
