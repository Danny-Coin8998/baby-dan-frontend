"use client";


import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { JSX, useState, useEffect } from "react";
import Investment from "@/images/icons/investment.png";
import { Separator } from "@radix-ui/react-separator";
import { useInvestment } from "@/store/investment";

interface InvestmentDataItem {
  inv_id: number;
  inv_date: string;
  inv_amount: string;
  p_amount: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING" | "CANCELLED";
  coin_name: string;
}

const Button = ({
  children,
  onClick,
  disabled = false,
  size = "sm",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeStyles = {
    sm: "px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm",
    md: "px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm",
    lg: "px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-600  hover:bg-yellow-700 focus:ring-yellow-500 ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string): string => {
    const statusUpper = status?.toUpperCase();

    switch (statusUpper) {
      case "ACTIVE":
        return "text-green-400";
      case "COMPLETED":
      case "SUCCESS":
        return "text-blue-400";
      case "PENDING":
      case "PROCESSING":
        return "text-yellow-400";
      case "CANCELLED":
      case "FAILED":
      case "ERROR":
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

type InvestmentData = InvestmentDataItem;

export default function InvestmentPage(): JSX.Element {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Use investment store
  const { investmentData, isLoading, error, fetchInvestments, clearError } =
    useInvestment();

  // Fetch investments on component mount
  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const totalPages = Math.ceil(investmentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = investmentData.slice(startIndex, endIndex);

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

  const handleDetailClick = (row: InvestmentData): void => {
    console.log("Detail clicked for:", row);
    router.push(`/investment/${row.inv_id}`);
  };

  const handleRowClick = (row: InvestmentData): void => {
    console.log("Row clicked:", row);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 px-2 sm:px-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className=" text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex items-baseline gap-2 md:gap-4">
              My Investment
              <Image
                src={Investment}
                alt="Investment"
                width={18}
                height={18}
                className="object-contain sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]"
              />
            </h1>
          </div>
        </div>

        <Separator className="bg-[#989898] h-px mb-2 sm:mb-3 md:mb-5" />

        <div className="flex items-center justify-center py-12">
          <div className=" text-lg">Loading investments...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 px-2 sm:px-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className=" text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex items-baseline gap-2 md:gap-4">
              My Investment
              <Image
                src={Investment}
                alt="Investment"
                width={18}
                height={18}
                className="object-contain sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]"
              />
            </h1>
          </div>
        </div>

        <Separator className="bg-[#989898] h-px mb-2 sm:mb-3 md:mb-5" />

        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-red-400 text-lg text-center">{error}</div>
          <Button
            onClick={() => {
              clearError();
              fetchInvestments();
            }}
            className="px-6 py-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-3 sm:space-y-4 px-2 sm:px-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <h1 className=" text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex items-baseline gap-2 md:gap-4">
              My Investment
              <Image
                src={Investment}
                alt="Investment"
                width={18}
                height={18}
                className="object-contain sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]"
              />
            </h1>
            <Button
              onClick={() => fetchInvestments()}
              disabled={isLoading}
              size="sm"
              className="text-xs"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <Separator className="bg-[#989898] h-px mb-2 sm:mb-3 md:mb-5" />

        <div className="block lg:hidden space-y-3">
          {investmentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-gray-400 text-lg text-center">
                No investments found
              </div>
              <div className="text-gray-500 text-sm text-center">
                Your investment history will appear here once you make your
                first investment.
              </div>
            </div>
          ) : (
            currentData.map((row) => (
              <div
                key={row.inv_id}
                className="rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg p-4"
                style={{
                  background:
                    "linear-gradient(180deg, #343967 0%, #263450 100%)",
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className=" text-sm font-medium">
                      ID: {row.inv_id}
                    </div>
                    <div className="text-gray-300 text-xs mt-1">
                      {new Date(row.inv_date).toLocaleDateString()}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {new Date(row.inv_date).toLocaleTimeString()}
                    </div>
                  </div>
                  <StatusBadge status={row.status} />
                </div>

                <div className="flex justify-between items-center">
                  <div className=" text-sm font-medium">
                    {row.inv_amount}
                    {/* {row.coin_name} */}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleDetailClick(row);
                    }}
                    className="shadow-lg hover:shadow-purple-600/25 cursor-pointer"
                  >
                    Detail
                  </Button>
                </div>
              </div>
            ))
          )}

          {investmentData.length > 0 && totalPages > 1 && (
            <div
              className="rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg p-4"
              style={{
                background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
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
                  <Button className="w-8 h-8 sm:w-10 sm:h-10 !rounded-full bg-transparent border-2 border-[#9058FE] text-gray-300 hover:bg-gray-500/60 hover: transition-all duration-200 flex items-center justify-center ml-1 cursor-pointer">
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          {investmentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-gray-400 text-lg text-center">
                No investments found
              </div>
              <div className="text-gray-500 text-sm text-center">
                Your investment history will appear here once you make your
                first investment.
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] relative">
                  <thead>
                    <tr className="relative border-b border-white/20">
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        InvID
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Date
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Amount
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Status
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Detail
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((row) => (
                      <tr
                        key={row.inv_id}
                        className={`hover:bg-slate-700/20 cursor-pointer transition-colors ${
                          currentData.indexOf(row) < currentData.length - 1
                            ? "border-b border-white/10"
                            : ""
                        }`}
                        onClick={() => handleRowClick(row)}
                      >
                        <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                          {row.inv_id}
                        </td>
                        <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                          <div className="space-y-1">
                            <div className=" text-sm lg:text-base text-center">
                              {new Date(row.inv_date).toLocaleDateString()}{" "}
                              {new Date(row.inv_date).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6">
                          <div className=" text-sm lg:text-base font-medium text-center">
                            {row.inv_amount} BBD
                            {/* {row.coin_name} */}
                          </div>
                        </td>
                        <td className="py-3 lg:py-4 px-3 lg:px-6 text-center">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-3 lg:py-4 px-3 lg:px-6 text-center">
                          {/* <Button
                            size="sm"
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>
                            ) => {
                              e.stopPropagation();
                              handleDetailClick(row);
                            }}
                            className="shadow-lg hover:shadow-purple-600/25 cursor-pointer"
                          >
                            Detail
                          </Button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {investmentData.length > 0 && totalPages > 1 && (
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
                      <Button className="w-8 h-8 sm:w-10 sm:h-10 !rounded-full bg-transparent border-2 border-[#9058FE] text-gray-300 hover:bg-gray-500/60 hover: transition-all duration-200 flex items-center justify-center ml-1 cursor-pointer">
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
