"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Separator } from "@radix-ui/react-separator";
import { ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import History from "@/images/icons/history.png";
import { Button } from "../ui/button";
import { useHistoryStore } from "@/store/history";

// Import Transaction type from the store
type Transaction = Parameters<
  Parameters<typeof useHistoryStore>[0]
>[0]["transactions"][0];

interface HistoryOption {
  value: string;
  label: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string): string => {
    const statusUpper = status?.toUpperCase();

    switch (statusUpper) {
      case "COMPLETED":
      case "SUCCESS":
      case "APPROVED":
        return "text-green-400";
      case "PENDING":
      case "PROCESSING":
        return "text-yellow-400";
      case "CANCELLED":
      case "FAILED":
      case "REJECTED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 rounded-full text-xs font-medium duration-200 ${getStatusStyle(
        status
      )}`}
    >
      {status}
    </span>
  );
};

// History filter options
const historyOptions: HistoryOption[] = [
  { value: "all", label: "All Transactions" },
  { value: "deposit", label: "Deposits" },
  { value: "withdraw", label: "Withdrawals" },
  { value: "referral bonus", label: "Referral Bonus" },
  { value: "invest", label: "Investments" },
  { value: "apr", label: "APR Earnings" },
  { value: "pairing", label: "Pairing" },
  // { value: "referral apr", label: "Referral APR" },
];

const getTableHeaders = () => {
  return ["Date", "Type", "Amount", "Coin", "Status", "Details"];
};

export default function HistoryPage() {
  const {
    loading,
    error,
    selectedType,
    currentPage,
    fetchHistory,
    setSelectedType,
    setCurrentPage,
    getPaginatedTransactions,
    getTotalPages,
    clearError,
  } = useHistoryStore();

  const currentData = getPaginatedTransactions();
  const totalPages = getTotalPages();

  // Fetch history data on component mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 4;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, 4);
      } else if (currentPage >= totalPages - 1) {
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2
        );
      }
    }

    return pages;
  };

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowClick = (transaction: Transaction): void => {
    console.log("Transaction clicked:", transaction);
  };

  const handleHistoryChange = (value: string) => {
    setSelectedType(value);
  };

  return (
    <>
      <div className="w-full space-y-3 sm:space-y-4 px-2 sm:px-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className=" text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex items-baseline gap-2 md:gap-4">
              History
              <Image
                src={History}
                alt="History"
                width={18}
                height={18}
                className="object-contain sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]"
              />
            </h1>
          </div>
        </div>

        <Separator className="bg-[#989898] h-px mb-2 sm:mb-3 md:mb-5" />

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* History Type */}
        <div className="flex justify-center items-center mb-6">
          <Select value={selectedType} onValueChange={handleHistoryChange}>
            <SelectTrigger className="w-full max-w-md bg-white text-[#9058FE] cursor-pointer">
              <SelectValue placeholder="Select History" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {historyOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-[#9058FE] hover:bg-violet-100 focus:bg-[#9058FE] focus: cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className=" text-lg">Loading transactions...</div>
          </div>
        ) : currentData.length > 0 ? (
          <div className="w-full space-y-3 sm:space-y-4">
            <div className="block lg:hidden space-y-3">
              {currentData.map((transaction, index) => {
                const date = new Date(transaction.created_datetime);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString();

                return (
                  <div
                    key={`${transaction.t_id}-${index}`}
                    className="rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg p-4 cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(180deg, #343967 0%, #263450 100%)",
                    }}
                    onClick={() => handleRowClick(transaction)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className=" text-sm font-medium">
                          {formattedDate}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {formattedTime}
                        </div>
                      </div>
                      <StatusBadge status={transaction.admin_status} />
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-xs">Type:</span>
                        <span className=" text-sm font-medium">
                          {transaction.tran_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-xs">Amount:</span>
                        <span className=" text-sm font-medium">
                          {transaction.in_amount || transaction.out_amount}{" "}
                          {transaction.coin_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-xs">Details:</span>
                        <span className=" text-sm text-right flex-1 ml-2 truncate">
                          {transaction.detail}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {totalPages > 1 && (
                <div
                  className="rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg p-4"
                  style={{
                    background:
                      "linear-gradient(180deg, #343967 0%, #263450 100%)",
                  }}
                >
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 !rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                          page === currentPage
                            ? "!bg-gradient-to-r from-[#9058FE] to-[#563598] ! shadow-lg transform scale-105"
                            : "bg-transparent border-2 border-[#9058FE] !text-gray-300 hover:!"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}

                    {currentPage < totalPages && (
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="w-8 h-8 sm:w-10 sm:h-10 !rounded-full bg-transparent border-2 border-[#9058FE] text-gray-300 hover:bg-gray-500/60 hover: transition-all duration-200 flex items-center justify-center ml-1 cursor-pointer"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              <div
                className="rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, #343967 0%, #263450 100%)",
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="relative">
                        {getTableHeaders().map((header, index) => (
                          <th
                            key={index}
                            className={` text-sm lg:text-base xl:text-lg font-semibold py-3 lg:py-4 px-3 lg:px-6 ${
                              index === 0 ? "text-left" : "text-center"
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((transaction, index) => {
                        const date = new Date(transaction.created_datetime);
                        const formattedDate = date.toLocaleDateString();
                        const formattedTime = date.toLocaleTimeString();

                        return (
                          <tr
                            key={`${transaction.t_id}-${index}`}
                            className="hover:bg-slate-700/20 cursor-pointer transition-colors relative"
                            onClick={() => handleRowClick(transaction)}
                          >
                            <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6">
                              <div className="space-y-1">
                                <div className=" text-sm lg:text-base">
                                  {formattedDate}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {formattedTime}
                                </div>
                              </div>
                            </td>
                            <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                              <div className=" text-sm lg:text-base font-medium">
                                {transaction.tran_type}
                              </div>
                            </td>
                            <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                              <div className=" text-sm lg:text-base font-medium">
                                {transaction.in_amount ||
                                  transaction.out_amount}
                              </div>
                            </td>
                            <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                              <div className=" text-sm lg:text-base font-medium">
                                {transaction.coin_name}
                              </div>
                            </td>
                            <td className="py-3 lg:py-4 px-3 lg:px-6 text-center">
                              <StatusBadge status={transaction.admin_status} />
                            </td>
                            <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                              <div className=" text-sm lg:text-base truncate max-w-[200px]">
                                {transaction.detail}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center justify-center p-3 lg:p-6 space-y-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                      {getPageNumbers().map((page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 !rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                            page === currentPage
                              ? "!bg-gradient-to-r from-[#9058FE] to-[#563598] ! shadow-lg transform scale-105"
                              : "bg-transparent border-2 border-[#9058FE] !text-gray-300 hover:!"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}

                      {currentPage < totalPages && (
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 !rounded-full bg-transparent border-2 border-[#9058FE] text-gray-300 hover:bg-gray-500/60 hover: transition-all duration-200 flex items-center justify-center ml-1 cursor-pointer"
                        >
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className=" text-lg">No transactions found</div>
          </div>
        )}
      </div>
    </>
  );
}
