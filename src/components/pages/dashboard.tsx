"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActionButton } from "@/components/dashboard/action-button";
import { StateDisplay } from "@/components/dashboard/state-display";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import Image from "next/image";
import { useDashboard } from "@/store/dashboard";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Balance from "@/images/Account Balance.png";
import Invest from "@/images/Active Invest.png";
import Apr from "@/images/Total APR.png";

export default function Dashboard() {
  const { data, isLoading, error, fetchDashboard } = useDashboard();
  const router = useRouter();
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Loading state
  if (isLoading) {
    return (
      <DashboardContainer>
        <StateDisplay type="loading" />
      </DashboardContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardContainer>
        <StateDisplay type="error" message={error} onRetry={fetchDashboard} />
      </DashboardContainer>
    );
  }

  // No data state
  if (!data) {
    return (
      <DashboardContainer>
        <StateDisplay type="empty" />
      </DashboardContainer>
    );
  }

  const { balances } = data;

  const actionButtons = [
    // { label: "Make Deposit", path: "/deposit" },
    { label: "Withdraw fund", path: "/withdraw" },
    { label: "Transfer Baby Dan", path: "/transfer" },
    { label: "Setting", path: "/setting" },
  ];

  return (
    <DashboardContainer>
      {/* Top Stats*/}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 place-items-center">
          <StatCard
            title="Account Balance"
            value={balances.account_balance.toFixed(2)}
            icon={
              <Image
                src={Balance}
                alt="Wallet"
                width={35}
                height={35}
                className="object-contain md:w-[50px] md:h-[50px]"
              />
            }
          />
          <StatCard
            title="Active Invest"
            value={parseFloat(balances.total_investment_active).toFixed(2)}
            icon={
              <Image
                src={Invest}
                alt="Investment"
                width={35}
                height={35}
                className="object-contain md:w-[55px] md:h-[55px]"
              />
            }
          />
          <StatCard
            title="Total Income"
            value={`${balances.earned_percentage.toFixed(2)}%`}
            className="sm:col-span-2 lg:col-span-1"
            icon={
              <Image
                src={Apr}
                alt="APR"
                width={35}
                height={35}
                className="object-contain md:w-[55px] md:h-[55px]"
              />
            }
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-3 sm:gap-4">
          <MetricCard
            label="Total Earned"
            value={parseFloat(balances.total_earned).toFixed(2)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <MetricCard
            label="Total Deposits"
            value={balances.total_deposit}
          />
          <MetricCard
            label="Total Withdrawals"
            value={balances.total_withdraw.toFixed(2)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <MetricCard
            label="Total Invest"
            value={parseFloat(balances.total_investment).toFixed(2)}
          />
          <MetricCard
            label="Total Referral Commission"
            value={parseFloat(balances.total_commission).toFixed(2)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <MetricCard
            label="Total Transferred In"
            value={balances.total_transfer_in.toFixed(2)}
          />
          <MetricCard
            label="Total Transferred Out"
            value={balances.total_transfer_out.toFixed(2)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
        {actionButtons.map((button) => (
          <ActionButton
            key={button.path}
            onClick={() => router.push(button.path)}
          >
            {button.label}
          </ActionButton>
        ))}
      </div>
    </DashboardContainer>
  );
}
