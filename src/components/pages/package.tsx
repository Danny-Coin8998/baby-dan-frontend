"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import Swal from "sweetalert2";

import { ChevronLeft, ChevronRight } from "lucide-react";
import PackageIcon from "@/images/icons/package.png";
import SelectPackage from "@/images/choose package.png";
import { usePackage } from "../../store/package";
import { usdtTransferService } from "../../services/usdtTransferService";
import { AlertTriangle } from "lucide-react";

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

// interface AccountItem {
//   id: string;
//   label: string;
//   value: string;
//   color: string;
// }

// Account data - will be updated with user balance from API
// const getAccounts = (userBalance: number): AccountItem[] => [
//   {
//     id: "account-balance",
//     label: "Account Balance",
//     value: `${userBalance} DAN`,
//     color: "#9058FE",
//   },
//   // { id: "wallet", label: "Wallet", value: "0.00 USDT", color: "#FECA58" },
// ];

const canInvest = true;

export default function PackagePage() {
  const {
    packages,
    loading,
    error,
    selectedPackage,
    currentIndex,
    buyingPackage,
    isProcessingPayment,
    transactionHash,
    paymentError,
    fetchPackages,
    purchasePackage,
    setSelectedPackage,
    handlePrevious,
    handleNext,
    clearPaymentError,
  } = usePackage();

  // Track number of cards to show based on screen size
  const [cardsToShow, setCardsToShow] = useState(3);

  // Track wallet connection status
  const [walletConnected, setWalletConnected] = useState(false);

  // Track USDT balance
  const [usdtBalance, setUsdtBalance] = useState<{
    balance: number;
    formatted: string;
    loading: boolean;
    error: string | null;
  }>({
    balance: 0,
    formatted: "0.00",
    loading: false,
    error: null,
  });

  // Track BNB balance for gas
  const [bnbBalance, setBnbBalance] = useState<{
    balance: number;
    formatted: string;
    loading: boolean;
  }>({
    balance: 0,
    formatted: "0.00",
    loading: false,
  });

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Function to fetch USDT balance
  const fetchUSDTBalance = async (userAddress: string) => {
    setUsdtBalance((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const balanceCheck = await usdtTransferService.checkUSDTBalance(
        userAddress,
        0
      );
      setUsdtBalance({
        balance: balanceCheck.currentBalance,
        formatted: balanceCheck.formattedBalance,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch USDT balance:", error);
      setUsdtBalance({
        balance: 0,
        formatted: "0.00",
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch balance",
      });
    }
  };

  // Function to fetch BNB balance for gas estimation
  const fetchBNBBalance = async (userAddress: string) => {
    setBnbBalance((prev) => ({ ...prev, loading: true }));

    try {
      if (window.ethereum) {
        const provider = new (await import("ethers")).BrowserProvider(
          window.ethereum
        );
        const balanceWei = await provider.getBalance(userAddress);
        const balanceFormatted = (await import("ethers")).ethers.formatEther(
          balanceWei
        );
        const balanceNumber = parseFloat(balanceFormatted);

        setBnbBalance({
          balance: balanceNumber,
          formatted: balanceNumber.toFixed(6),
          loading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch BNB balance:", error);
      setBnbBalance({
        balance: 0,
        formatted: "0.00",
        loading: false,
      });
    }
  };

  // Check wallet connection status on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = (await window.ethereum.request({
            method: "eth_accounts",
          })) as string[];
          if (accounts.length === 0) {
            console.log("No wallet connected");
            setWalletConnected(false);
            setUsdtBalance({
              balance: 0,
              formatted: "0.00",
              loading: false,
              error: "Wallet not connected",
            });
          } else {
            console.log("Wallet already connected:", accounts[0]);
            setWalletConnected(true);
            // Fetch USDT and BNB balance when wallet is connected
            await fetchUSDTBalance(accounts[0]);
            await fetchBNBBalance(accounts[0]);
          }
        } else {
          setWalletConnected(false);
          setUsdtBalance({
            balance: 0,
            formatted: "0.00",
            loading: false,
            error: "MetaMask not installed",
          });
        }
      } catch (error) {
        console.log("Wallet connection check failed:", error);
        setWalletConnected(false);
        setUsdtBalance({
          balance: 0,
          formatted: "0.00",
          loading: false,
          error: "Connection failed",
        });
      }
    };

    checkWalletConnection();
  }, []);

  // Handle responsive card count
  useEffect(() => {
    const handleResize = () => {
      // Show 1 card on mobile (< 768px), 3 cards on larger screens
      if (window.innerWidth < 768) {
        setCardsToShow(1);
      } else {
        setCardsToShow(3);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const handleAccountSelect = (accountId: string) => {
  //   setSelectedAccount(accountId);
  // };

  const handleInvest = async () => {
    const selectedPkg = packages.find(
      (pkg: PackageItem) => pkg.p_id === selectedPackage
    );

    if (!selectedPkg) {
      Swal.fire({
        icon: "warning",
        title: "No Package Selected",
        text: "Please select a package to invest in",
        confirmButtonColor: "#9058FE",
        confirmButtonText: "OK",
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Confirm Investment",
      text: `Are you sure you want to invest in ${selectedPkg.p_name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#9058FE",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, invest!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const result = await purchasePackage(selectedPackage);

      if (result.success) {
        // Refresh USDT balance after successful purchase
        if (window.ethereum) {
          try {
            const accounts = (await window.ethereum.request({
              method: "eth_accounts",
            })) as string[];
            if (accounts.length > 0) {
              await fetchUSDTBalance(accounts[0]);
              await fetchBNBBalance(accounts[0]);
            }
          } catch (error) {
            console.error("Failed to refresh balance after purchase:", error);
          }
        }

        Swal.fire({
          icon: "success",
          title: "Investment Successful!",
          text: `You have successfully purchased package: ${selectedPkg.p_name}`,
          confirmButtonColor: "#9058FE",
          confirmButtonText: "Great!",
        });
      } else {
        const errorMessage =
          result.paymentError || result.error || "Unknown error occurred";

        // Show different icon and title for user cancellation
        const isUserCancellation =
          errorMessage.includes("cancelled by user") ||
          errorMessage.includes("user rejected");

        Swal.fire({
          icon: isUserCancellation ? "info" : "error",
          title: isUserCancellation
            ? "Transaction Cancelled"
            : "Investment Failed",
          text: errorMessage,
          confirmButtonColor: "#9058FE",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error buying package:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while buying the package",
        confirmButtonColor: "#9058FE",
        confirmButtonText: "OK",
      });
    }
  };

  // Helper function to get package colors based on amount
  const getPackageColors = (amount: number) => {
    switch (amount) {
      case 10:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#3B82F6", // blue-500
        };
      case 100:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#10B981", // green-500
        };
      case 300:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#F97316", // orange-500
        };
      case 500:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#EF4444", // purple-500
        };
      case 1000:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#FFD700", // red-500
        };
      case 3000:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#6366F1", // indigo-500
        };
      case 5000:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#EC4899", // pink-500
        };
      case 10000:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#EAB308", // yellow-500
        };
      default:
        return {
          bgColor: "bg-white/10",
          textColor: "",
          amountColor: "",
          borderColor: "#6B7280", // gray-500
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className=" text-xl">Loading packages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Wallet Connection Status */}
      {!walletConnected && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-yellow-900/50 rounded-lg border border-yellow-500">
          <p className="text-yellow-200 text-sm text-center">
            ⚠️ Please connect your MetaMask wallet to purchase packages
          </p>
        </div>
      )}

      {/* Payment Error Display */}
      {paymentError && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-900/50 rounded-lg border border-red-500">
          <p className="text-red-200 text-lg text-center">
            ⚠️ Payment Error: {paymentError}
          </p>
          {paymentError.includes("Insufficient USDT balance") && (
            <div className="mt-3 p-3 bg-blue-900/30 rounded border border-blue-500/30">
              <p className="text-blue-200 text-md text-center">
                1. กรณีใช้งานบนคอมพิวเตอร์ กรุณาเปิด Metamask ให้ Metamask
                และรอจนกว่า Metamask จะโหลดข้อมูลเสร็จ แล้วขึงกด กด &quot;Buy
                Package&quot; อีกครั้ง <br />
                2. หากยังไม่สามารถซื้อได้ ให้กดปุ่ม &quot;Refresh Page&quot;
                สีแดง
                <br />
                3. ติดต่อทีมงานเพื่อรับการช่วยเหลือ
              </p>
            </div>
          )}
          <button
            onClick={clearPaymentError}
            className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transaction Success Display */}
      {transactionHash && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-green-900/50 rounded-lg border border-green-500">
          <p className="text-green-200 text-sm text-center mb-2">
            ✅ Payment successful!
          </p>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs opacity-75">
              Transaction: {transactionHash.substring(0, 10)}...
              {transactionHash.substring(transactionHash.length - 8)}
            </span>
            <a
              href={`https://bscscan.com/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-300 hover:text-green-100 underline flex items-center gap-1"
            >
              View on BSCScan
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      )}

      <div className="mb-4 md:mb-6">
        <h1 className=" text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold flex items-baseline gap-2 md:gap-4">
          Buy a package
          <Image
            src={PackageIcon}
            alt="Package"
            width={18}
            height={18}
            className="object-contain sm:w-[24px] sm:h-[24px] md:w-[30px] md:h-[30px]"
          />
        </h1>
      </div>

      <Separator className="bg-[#989898] h-px mb-3 md:mb-5" />

      {/* USDT Balance Display */}
      {walletConnected && (
        <div className="max-w-full mx-auto mb-4 flex items-center justify-center gap-3">
          {/* USDT Balance Card */}
          <div
            className={`p-4 rounded-lg border mb-3 w-[70%] ${
              usdtBalance.error
                ? "bg-red-900/50 border-red-500"
                : usdtBalance.balance > 0
                ? "bg-yellow-700/50 border-yellow-500"
                : "bg-blue-900/50 border-blue-500"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    usdtBalance.error
                      ? "bg-red-500"
                      : usdtBalance.balance > 0
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                >
                  <span className="text-white text-sm font-bold">$</span>
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      usdtBalance.error
                        ? "text-red-200"
                        : usdtBalance.balance > 0
                        ? "text-green-200"
                        : "text-blue-200"
                    }`}
                  >
                    USDT Balance
                  </p>
                  {usdtBalance.loading ? (
                    <p className="text-blue-100 text-lg font-semibold">
                      Loading...
                    </p>
                  ) : usdtBalance.error ? (
                    <p className="text-red-300 text-sm">{usdtBalance.error}</p>
                  ) : (
                    <p
                      className={`text-lg font-semibold ${
                        usdtBalance.balance > 0
                          ? "text-green-100"
                          : "text-blue-100"
                      }`}
                    >
                      {usdtBalance.formatted} USDT
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {/* <button
                  onClick={() => {
                    if (window.ethereum) {
                      window.ethereum.request({
                        method: "wallet_requestPermissions",
                      });
                    } else {
                      window.open("https://metamask.io/download/", "_blank");
                    }
                  }}
                  className="px-4 py-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                >
                  Open MetaMask
                </button> */}
                <button
                  onClick={async () => {
                    if (window.ethereum) {
                      try {
                        const accounts = (await window.ethereum.request({
                          method: "eth_accounts",
                        })) as string[];
                        if (accounts.length > 0) {
                          await fetchUSDTBalance(accounts[0]);
                          await fetchBNBBalance(accounts[0]);
                        }
                      } catch (error) {
                        console.error("Failed to refresh balance:", error);
                      }
                    }
                  }}
                  disabled={usdtBalance.loading}
                  className="px-4 py-2 cursor-pointer bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                >
                  {usdtBalance.loading ? "Loading..." : "Refresh Balance"}
                </button>
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  <AlertTriangle />
                  Refresh Page
                </button>
              </div>
            </div>
          </div>

          {/* BNB Balance Card for Gas */}
          <div className="p-4 rounded-lg border bg-blue-500/60 border-blue-500/30 w-[30%] mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">B</span>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">BNB Balance (for gas)</p>
                  {bnbBalance.loading ? (
                    <p className="text-blue-100 text-lg font-semibold">
                      Loading...
                    </p>
                  ) : (
                    <p
                      className={`text-lg font-semibold ${
                        bnbBalance.balance > 0.001
                          ? "text-green-100"
                          : "text-red-300"
                      }`}
                    >
                      {bnbBalance.formatted} BNB
                    </p>
                  )}
                </div>
              </div>
              {bnbBalance.balance < 0.001 && !bnbBalance.loading && (
                <div className="text-xs text-yellow-300">⚠️ Low BNB</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Main Package */}
      <div className="dashboard-gradient rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className=" text-xl sm:text-2xl md:text-5xl font-normal flex items-center justify-center gap-3">
            Select a package
            <Image
              src={SelectPackage}
              alt="Select Package"
              width={55}
              height={55}
              className="object-contain sm:w-[35px] sm:h-[35px] md:w-[55px] md:h-[55px]"
            />
          </h2>
        </div>
        <Separator className="bg-[#ffffff] h-px mb-3 md:mb-5" />

        <div className="relative mb-8">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {canInvest && (
              <>
                <Button
                  onClick={handlePrevious}
                  disabled={!packages || currentIndex === 0}
                  className="shadow-lg bg-white/80 hover:bg-white/30  border-none p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft
                    style={{ width: "35px", height: "35px" }}
                    className="text-black"
                  />
                </Button>
                {/* Package Cards */}
                <div className="flex gap-3 sm:gap-5 md:gap-6 flex-1 justify-center max-w-2xl sm:max-w-3xl md:max-w-5xl">
                  {packages && packages.length > 0 ? (
                    packages
                      .slice(currentIndex, currentIndex + cardsToShow)
                      .map((pkg: PackageItem) => {
                        const colors = getPackageColors(pkg.p_amount);
                        const isSelected = selectedPackage === pkg.p_id;

                        return (
                          <div key={pkg.p_id} className="relative">
                            <div
                              onClick={() => setSelectedPackage(pkg.p_id)}
                              className={`${
                                colors.bgColor
                              } rounded-2xl p-5 sm:p-6 md:p-8 transition-all duration-300 min-w-[110px] sm:min-w-[150px] md:min-w-[180px] flex-1 max-w-[150px] sm:max-w-[180px] md:max-w-[250px] relative overflow-hidden border-6 h-[180px] sm:h-[200px] md:h-[220px] flex flex-col justify-center cursor-pointer hover:scale-105 ${
                                isSelected ? "shadow-lg scale-105 pb-8" : ""
                              }`}
                              style={{
                                borderColor: isSelected
                                  ? "#FFD700"
                                  : colors.borderColor,
                              }}
                            >
                              {/* Content */}
                              <div className="text-center my-auto">
                                <div
                                  className={`${colors.amountColor} text-md sm:text-xl md:text-3xl font-bold mb-1 sm:mb-2`}
                                >
                                  {/* {pkg.required_dan.toFixed(2)} DAN */}
                                  {pkg.p_name}
                                </div>
                                {/* <div className="text-gray-400 text-xs sm:text-sm md:text-lg opacity-80">
                                  ({pkg.p_name})
                                </div> */}
                                <div
                                  className={`${colors.textColor} text-xs sm:text-sm md:text-lg opacity-80`}
                                >
                                  {pkg.p_percent}% for {pkg.p_period} days
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div
                                className="absolute bottom-0 left-0 right-0 text-center py-1"
                                style={{
                                  backgroundColor: "#FFD700",
                                  marginTop: "-1px",
                                }}
                              >
                                <span className=" text-xs font-medium">
                                  Selected
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className=" text-center col-span-3">
                      No packages available
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={
                    !packages || currentIndex >= packages.length - cardsToShow
                  }
                  className="shadow-lg bg-white/80 hover:bg-white/30  border-none p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight
                    style={{ width: "35px", height: "35px" }}
                    className="text-black"
                  />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Invest by */}
        <div className="mb-6">
          {/* <div className="flex items-center gap-2 mb-4">
            <h3 className=" text-lg sm:text-3xl font-medium flex items-center gap-2 md:gap-2">
              Invest by
              <Image
                src={Dollar}
                alt="Dollar"
                width={20}
                height={20}
                className="object-contain sm:w-[24px] sm:h-[24px] md:w-[30px] md:h-[30px]"
              />
            </h3>
          </div> */}
          <Separator className="bg-[#ffffff] h-px mb-3 md:mb-5" />
          {/* {canInvest ? (
            <div className="space-y-4">
              {getAccounts(userBalance).map((account) => (
                <div key={account.id} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="account-selection"
                    id={account.id}
                    checked={selectedAccount === account.id}
                    className={`w-3 h-3 appearance-none rounded-full cursor-pointer relative ${
                      selectedAccount === account.id
                        ? "border-2 border-white"
                        : "border-0"
                    }`}
                    style={{
                      backgroundColor: account.color,
                    }}
                    onChange={() => handleAccountSelect(account.id)}
                  />
                  <label
                    htmlFor={account.id}
                    className=" font-medium cursor-pointer flex-1 flex items-center gap-2"
                  >
                    {account.label}
                    <span className="/70">{account.value}</span>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className=" text-center">
              You cannot invest right now the pool was empty please contact
              admin
            </div>
          )} */}
        </div>

        {/* Invest Button */}
        {canInvest && (
          <div className="flex justify-center">
            <Button
              onClick={handleInvest}
              disabled={buyingPackage || isProcessingPayment}
              className="bg-yellow-500 hover:bg-yellow-600/40 px-8 sm:px-12 py-8 sm:py-6 text-lg sm:text-xl font-medium rounded-2xl border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500"
              style={{
                boxShadow: "3px 0px 4px 0px #00000040",
              }}
            >
              {isProcessingPayment
                ? "Processing Payment..."
                : buyingPackage
                ? "Confirming Purchase..."
                : "Buy Package"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
