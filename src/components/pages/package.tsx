"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import Swal from "sweetalert2";

import { ChevronLeft, ChevronRight } from "lucide-react";
import PackageIcon from "@/images/icons/package.png";
import SelectPackage from "@/images/choose package.png";
import Dollar from "@/images/icons/dollar.png";
import { usePackage } from "../../store/package";

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

interface AccountItem {
  id: string;
  label: string;
  value: string;
  color: string;
}

// Account data - will be updated with user balance from API
const getAccounts = (userBalance: number): AccountItem[] => [
  {
    id: "account-balance",
    label: "Account Balance",
    value: `${userBalance} DAN`,
    color: "#9058FE",
  },
  // { id: "wallet", label: "Wallet", value: "0.00 USDT", color: "#FECA58" },
];

const canInvest = false;

export default function PackagePage() {
  const {
    packages,
    userBalance,
    loading,
    error,
    selectedPackage,
    selectedAccount,
    currentIndex,
    buyingPackage,
    fetchPackages,
    purchasePackage,
    setSelectedPackage,
    setSelectedAccount,
    handlePrevious,
    handleNext,
  } = usePackage();

  // Track number of cards to show based on screen size
  const [cardsToShow, setCardsToShow] = useState(3);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

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

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
  };

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

    if (!selectedPkg.can_afford) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: "You do not have enough balance to buy this package",
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
      await purchasePackage(selectedPackage);

      if (!error) {
        Swal.fire({
          icon: "success",
          title: "Investment Successful!",
          text: `You have successfully purchased package: ${selectedPkg.p_name}`,
          confirmButtonColor: "#9058FE",
          confirmButtonText: "Great!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Investment Failed",
          text: error,
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
  const getPackageColors = (amount: number, canAfford: boolean) => {
    if (!canAfford) {
      return {
        bgColor: "bg-gray-600",
        textColor: "text-gray-300",
        amountColor: "text-gray-300",
        borderColor: "#6B7280", // gray-500
      };
    }

    switch (amount) {
      case 10:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#3B82F6", // blue-500
        };
      case 100:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#10B981", // green-500
        };
      case 300:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#F97316", // orange-500
        };
      case 500:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#EF4444", // purple-500
        };
      case 1000:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#FFD700", // red-500
        };
      case 3000:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#6366F1", // indigo-500
        };
      case 5000:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#EC4899", // pink-500
        };
      case 10000:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#EAB308", // yellow-500
        };
      default:
        return {
          bgColor: "bg-white/10",
          textColor: "text-white",
          amountColor: "text-white",
          borderColor: "#6B7280", // gray-500
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Loading packages...</div>
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
      <div className="mb-4 md:mb-6">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold flex items-baseline gap-2 md:gap-4">
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

      {/* Main Package */}
      <div className="dashboard-gradient rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-white text-xl sm:text-2xl md:text-5xl font-normal flex items-center justify-center gap-3">
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
                  className="bg-white/80 hover:bg-white/30 text-white border-none p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft
                    style={{ width: "35px", height: "35px" }}
                    className="text-black"
                  />
                </Button>
                Package Cards
                <div className="flex gap-3 sm:gap-5 md:gap-6 flex-1 justify-center max-w-2xl sm:max-w-3xl md:max-w-5xl">
                  {packages && packages.length > 0 ? (
                    packages
                      .slice(currentIndex, currentIndex + cardsToShow)
                      .map((pkg: PackageItem) => {
                        const colors = getPackageColors(
                          pkg.p_amount,
                          pkg.can_afford
                        );
                        const isSelected = selectedPackage === pkg.p_id;

                        return (
                          <div key={pkg.p_id} className="relative">
                            <div
                              onClick={() =>
                                pkg.can_afford && setSelectedPackage(pkg.p_id)
                              }
                              className={`${
                                colors.bgColor
                              } rounded-2xl p-5 sm:p-6 md:p-8 transition-all duration-300 min-w-[110px] sm:min-w-[150px] md:min-w-[180px] flex-1 max-w-[150px] sm:max-w-[180px] md:max-w-[250px] relative overflow-hidden border-6 h-[180px] sm:h-[200px] md:h-[220px] flex flex-col justify-center ${
                                isSelected ? "shadow-lg scale-105 pb-8" : ""
                              } ${
                                pkg.can_afford
                                  ? "cursor-pointer hover:scale-105"
                                  : "cursor-not-allowed opacity-60"
                              }`}
                              style={{
                                borderColor: isSelected
                                  ? "#9058FE"
                                  : colors.borderColor,
                              }}
                            >
                              {/* Content */}
                              <div className="text-center my-auto">
                                <div
                                  className={`${colors.amountColor} text-md sm:text-xl md:text-3xl font-bold mb-1 sm:mb-2`}
                                >
                                  {pkg.required_dan.toFixed(2)} DAN
                                  {/* {pkg.p_name} */}
                                </div>
                                <div className="text-gray-400 text-xs sm:text-sm md:text-lg opacity-80">
                                  ({pkg.p_name})
                                </div>
                                <div
                                  className={`${colors.textColor} text-xs sm:text-sm md:text-lg opacity-80`}
                                >
                                  {pkg.p_percent}% for {pkg.p_period} days
                                </div>
                                {!pkg.can_afford && (
                                  <div className="text-red-400 text-xs mt-1 font-medium">
                                    Insufficient Balance
                                  </div>
                                )}
                              </div>
                            </div>

                            {isSelected && pkg.can_afford && (
                              <div
                                className="absolute bottom-0 left-0 right-0 text-center py-1"
                                style={{
                                  backgroundColor: "#9058FE",
                                  marginTop: "-1px",
                                }}
                              >
                                <span className="text-white text-xs font-medium">
                                  Selected
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-white text-center col-span-3">
                      No packages available
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={
                    !packages || currentIndex >= packages.length - cardsToShow
                  }
                  className="bg-white/80 hover:bg-white/30 text-white border-none p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight style={{ width: "35px", height: "35px" }} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Invest by */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-white text-lg sm:text-3xl font-medium flex items-center gap-2 md:gap-2">
              Invest by
              <Image
                src={Dollar}
                alt="Dollar"
                width={20}
                height={20}
                className="object-contain sm:w-[24px] sm:h-[24px] md:w-[30px] md:h-[30px]"
              />
            </h3>
          </div>
          <Separator className="bg-[#ffffff] h-px mb-3 md:mb-5" />
          {canInvest ? (
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
                    className="text-white font-medium cursor-pointer flex-1 flex items-center gap-2"
                  >
                    {account.label}
                    <span className="text-white/70">{account.value}</span>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white text-center">
              You cannot invest right now the pool was empty please contact
              admin
            </div>
          )}
        </div>

        {/* Invest Button */}
        {canInvest && (
          <div className="flex justify-start">
            <Button
              onClick={handleInvest}
              disabled={
                !packages ||
                !packages.find(
                  (pkg: PackageItem) => pkg.p_id === selectedPackage
                )?.can_afford ||
                buyingPackage
              }
              className="bg-[#9058FE] text-white px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-medium rounded-2xl border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500"
              style={{
                boxShadow: "3px 0px 4px 0px #00000040",
              }}
            >
              {buyingPackage ? "Processing..." : "Invest"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
