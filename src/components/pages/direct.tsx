"use client";


import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { JSX, useState, useEffect } from "react";
import Direct from "@/images/icons/direct.png";
import { Separator } from "@radix-ui/react-separator";
import { useDirectStore, DirectReferralItem } from "@/store/direct";

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
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600  hover:bg-purple-700 focus:ring-purple-500 ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string): string => {
    const statusUpper = status?.toUpperCase();

    switch (statusUpper) {
      case "VERIFIED":
        return "text-green-400";
      case "UNVERIFIED":
        return "text-red-400";
      case "PENDING":
        return "text-yellow-400";
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

export default function DirectPage(): JSX.Element {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const { referrals, loading, error, fetchDirectReferrals } = useDirectStore();

  useEffect(() => {
    fetchDirectReferrals();
  }, [fetchDirectReferrals]);

  const totalPages = Math.ceil(referrals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = referrals.slice(startIndex, endIndex);

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

  const handleDetailClick = (row: DirectReferralItem): void => {
    console.log("Detail clicked for:", row);
    router.push(`/direct/${row.userid}`);
  };

  const handleTransferClick = (row: DirectReferralItem): void => {
    console.log("Transfer clicked for:", row);
    if (row.wallet_address) {
      // Navigate to transfer page with wallet address as query parameter
      router.push(`/transfer?to=${encodeURIComponent(row.wallet_address)}`);
    } else {
      // If no wallet address, show alert or navigate to transfer page without pre-filled address
      // alert("No wallet address available for this user");
      router.push("/transfer");
    }
  };

  const handleRowClick = (row: DirectReferralItem): void => {
    console.log("Row clicked:", row);
  };

  // Format date from ISO string to display format
  const formatDate = (dateString: string): { date: string; time: string } => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-GB"); // DD/MM/YYYY
    const timeStr = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }); // HH:MM
    return { date: dateStr, time: timeStr };
  };

  return (
    <>
      <div className="w-full space-y-3 sm:space-y-4 px-2 sm:px-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className=" text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex items-baseline gap-2 md:gap-4">
              My Direct Referral
              <Image
                src={Direct}
                alt="Direct"
                width={18}
                height={18}
                className="object-contain sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]"
              />
            </h1>
          </div>
        </div>

        <Separator className="bg-[#989898] h-px mb-2 sm:mb-3 md:mb-5" />

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className=" text-lg">Loading...</div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-8">
            <div className="text-red-400 text-lg">Error: {error}</div>
          </div>
        )}

        {!loading && !error && referrals.length === 0 && (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-400 text-lg">
              No direct referrals found
            </div>
          </div>
        )}

        {!loading && !error && currentData.length > 0 && (
          <div className="block lg:hidden space-y-3">
            {currentData.map((row) => {
              const { date, time } = formatDate(row.register_date);
              return (
                <div
                  key={row.userid}
                  className="rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg p-4"
                  style={{
                    background:
                      "linear-gradient(180deg, #343967 0%, #263450 100%)",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className=" text-sm font-medium">
                        {row.name}
                      </div>
                      <div className="text-gray-300 text-xs mt-1">
                        {row.email || "No email"}
                      </div>
                      <div className="text-gray-300 text-xs">{date}</div>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-gray-300 text-xs">{time}</div>
                    <Button
                      size="sm"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleTransferClick(row);
                      }}
                      className="bg-white !text-[#9058FE] !rounded-full shadow-lg cursor-pointer"
                    >
                      Transfer fund
                    </Button>
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
                    <Button className="w-8 h-8 sm:w-10 sm:h-10 !rounded-full bg-transparent border-2 border-[#9058FE] text-gray-300 hover:bg-gray-500/60 hover: transition-all duration-200 flex items-center justify-center ml-1 cursor-pointer">
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && currentData.length > 0 && (
          <div className="hidden lg:block">
            <div
              className="rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] relative">
                  <thead>
                    <tr className="relative border-b border-white/20">
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        No.
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Name
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Email
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Status
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Register Date
                      </th>
                      <th className=" text-sm lg:text-base xl:text-lg font-medium py-3 lg:py-4 px-3 lg:px-6 text-center">
                        Transfer fund
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((row, index) => {
                      const { date, time } = formatDate(row.register_date);
                      return (
                        <tr
                          key={row.userid}
                          className={`hover:bg-slate-700/20 cursor-pointer transition-colors ${
                            index < currentData.length - 1
                              ? "border-b border-white/10"
                              : ""
                          }`}
                          onClick={() => handleRowClick(row)}
                        >
                          <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                            {row.no}
                          </td>
                          <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                            {row.name}
                          </td>
                          <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                            {row.email || "No email"}
                          </td>
                          <td className="py-3 lg:py-4 px-3 lg:px-6 text-center">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className=" text-sm lg:text-base py-3 lg:py-4 px-3 lg:px-6 text-center">
                            <div className="space-y-1">
                              <div className=" text-sm lg:text-base text-center">
                                {date} {time}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 lg:py-4 px-3 lg:px-6 text-center">
                            <Button
                              size="sm"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => {
                                e.stopPropagation();
                                handleTransferClick(row);
                              }}
                              className="bg-white !text-[#9058FE] !rounded-full shadow-lg cursor-pointer"
                            >
                              Transfer fund
                            </Button>
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
                      <Button className="w-8 h-8 sm:w-10 sm:h-10 !rounded-full bg-transparent border-2 border-[#9058FE] text-gray-300 hover:bg-gray-500/60 hover: transition-all duration-200 flex items-center justify-center ml-1 cursor-pointer">
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
