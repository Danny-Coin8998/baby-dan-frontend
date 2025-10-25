"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import DashboardIcon from "@/images/icons/dashboard.png";
import DepositIcon from "@/images/icons/money.png";
import PackageIcon from "@/images/icons/package.png";
import InvestmentIcon from "@/images/icons/investment.png";
import WithdrawIcon from "@/images/icons/withdraw.png";
import LinkingIcon from "@/images/icons/link.png";
import TeamIcon from "@/images/icons/team.png";
import HistoryIcon from "@/images/icons/history.png";
import SettingIcon from "@/images/icons/setting.png";
import MoneyIcon from "@/images/icons/money.png";

const sidebarItems = [
  { icon: DashboardIcon, label: "Dashboard", href: "/" },
  // { icon: DepositIcon, label: "Make a deposit", href: "/deposit" },
  { icon: PackageIcon, label: "Buy a package", href: "/package" },
  { icon: MoneyIcon, label: "Transfer fund", href: "/transfer" },
  { icon: InvestmentIcon, label: "My Investment", href: "/investment" },
  { icon: WithdrawIcon, label: "Withdraw fund", href: "/withdraw" },
  { icon: LinkingIcon, label: "Referral Link", href: "/referral" },
  { icon: TeamIcon, label: "My Direct Referral", href: "/direct" },
  { icon: TeamIcon, label: "My Team", href: "/team" },
  { icon: HistoryIcon, label: "History", href: "/history" },
  { icon: SettingIcon, label: "Setting", href: "/setting" },
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg border-amber-200 hover:bg-amber-50 hover:shadow-xl transition-all duration-200"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-amber-700" />
          ) : (
            <Menu className="h-5 w-5 text-amber-700" />
          )}
        </Button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-screen w-72 flex-col bg-gradient-to-b from-amber-50/30 to-white border-r border-amber-200/50 transition-transform duration-300 ease-in-out shadow-xl",
          "lg:translate-x-0 lg:relative lg:z-auto",
          "fixed z-50 lg:static",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-amber-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/babydan-logo.png"
              alt="DAN BINARY Logo"
              width={120}
              height={60}
              className="object-contain"
            />
          </div>
          <ChevronsUpDown className="h-5 w-5 text-amber-500 transition-transform hover:scale-110" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-amber-50 to-yellow-50 shadow-md border border-amber-200"
                        : "hover:bg-white hover:shadow-md hover:scale-[1.02] border border-transparent"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-500 to-yellow-600 rounded-r-full" />
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30"
                          : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-yellow-500 group-hover:shadow-md group-hover:shadow-amber-500/20"
                      )}
                    >
                      <Image
                        src={item.icon}
                        alt={`${item.label} icon`}
                        width={20}
                        height={20}
                        className={cn(
                          "object-contain transition-all duration-200",
                          isActive
                            ? "brightness-0 invert"
                            : "opacity-60 group-hover:brightness-0 group-hover:invert"
                        )}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "text-base font-medium transition-colors duration-200",
                        isActive
                          ? "text-gray-900"
                          : "text-gray-600 group-hover:text-gray-900"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">System Online</span>
          </div>
        </div>
      </div>
    </>
  );
}
