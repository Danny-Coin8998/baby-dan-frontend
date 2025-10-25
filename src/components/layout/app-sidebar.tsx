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
  { icon: DepositIcon, label: "Make a deposit", href: "/deposit" },
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

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 backdrop-blur-sm z-40"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-screen w-64 flex-col bg-slate-900 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:relative lg:z-auto",
          "fixed z-50 lg:static",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Logo */}
        <div className="flex h-30 items-center px-4">
          <div className="flex items-center space-x-10">
            <Image
              src="/dan-logo.png"
              alt="DAN BINARY Logo"
              width={140}
              height={75}
              className="object-contain w-1/2 h-auto mx-auto"
            />
            <ChevronsUpDown className="h-4 w-4 text-white ml-4" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4 px-3 py-4">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:text-white hover:bg-slate-800 text-xl font-normal",
                    isActive && "bg-[#333966] text-white"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.label} icon`}
                    width={20}
                    height={20}
                    className="mr-3 object-contain"
                  />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
