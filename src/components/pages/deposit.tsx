"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Separator } from "@radix-ui/react-separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { depositService } from "@/services/depositService";
import { useDeposit } from "@/store/deposit";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

import MoneyIcon from "@/images/icons/money.png";

export default function DepositPage() {
  const [depositAmount, setDepositAmount] = useState("");
  const [depositStatus, setDepositStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const { isLoading, clearError } = useDeposit();

  const handleDeposit = async () => {
    if (!depositAmount) {
      setDepositStatus({
        type: "error",
        message: "Please enter deposit amount",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositStatus({
        type: "error",
        message: "Please enter a valid amount",
      });
      return;
    }

    clearError();
    setDepositStatus({ type: null, message: "" });

    try {
      // Get user's wallet address
      const userAddress = await depositService.getUserAddress();

      // Process the deposit (transfer tokens + API call)
      const result = await depositService.processDeposit(amount, userAddress);

      if (result.success) {
        setDepositStatus({
          type: "success",
          message: `Deposit successful! Transaction: ${result.transactionHash}`,
        });
        setDepositAmount(""); // Clear the input
      } else {
        setDepositStatus({
          type: "error",
          message: result.error || "Deposit failed",
        });
      }
    } catch (error) {
      console.error("Deposit error:", error);
      setDepositStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-4 md:mb-6">
        <h1 className=" text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold flex items-center gap-2 md:gap-4">
          <Image
            src={MoneyIcon}
            alt="Deposit"
            width={32}
            height={32}
            className="object-contain sm:w-[32px] sm:h-[32px] md:w-[40px] md:h-[40px]"
          />
          Deposit
        </h1>
      </div>

      <Separator className="bg-white/20 h-px mb-6 md:mb-8" />

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-xl bg-white/10 border-white/20  shadow-lg backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center justify-center">
            <Image
              src="/dancoin.png"
              className="mb-4 w-1/2 h-auto"
              alt="Deposit"
              width={600}
              height={600}
            />
            <CardTitle className="text-4xl font-bold text-center">
              Make a Deposit
            </CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Enter the amount you would like to deposit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                DAN
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isLoading}
                className="bg-black/20 border-white/20  pl-12 text-lg focus:ring-2 focus:ring-offset-0 focus:ring-purple-500 transition-shadow duration-300 disabled:opacity-50"
              />
            </div>

            {/* Status Messages */}
            {depositStatus.type && (
              <div
                className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  depositStatus.type === "success"
                    ? "bg-green-500/20 border border-green-500/30 text-green-300"
                    : "bg-red-500/20 border border-red-500/30 text-red-300"
                }`}
              >
                {depositStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{depositStatus.message}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-yellow-600 hover:bg-yellow-700  py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              onClick={handleDeposit}
              disabled={isLoading || !depositAmount}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Deposit...
                </>
              ) : (
                "Confirm Deposit"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
