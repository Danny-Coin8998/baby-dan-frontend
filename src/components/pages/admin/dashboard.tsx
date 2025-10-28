"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/adminAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import adminService, { DailyInvestment } from "@/services/adminService";
import AddPackageModal from "./AddPackageModal";

export default function AdminDashboard() {
  const router = useRouter();
  const { adminUsername, adminLogout } = useAdminAuth();
  const [dailyInvestments, setDailyInvestments] = useState<DailyInvestment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);

  // Fetch daily investments on mount
  useEffect(() => {
    const fetchDailyInvestments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminService.getDailyInvestments();
        if (response.success) {
          setDailyInvestments(response.data);
        } else {
          setError("Failed to fetch daily investments");
        }
      } catch (err) {
        console.error("Error fetching daily investments:", err);
        setError("Error loading investment data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyInvestments();
  }, []);

  // Calculate total investment from the data
  const totalInvestment = dailyInvestments.reduce(
    (sum, item) => sum + item.total_amount,
    0
  );

  // Calculate 7-day investment
  const last7DaysInvestment = dailyInvestments
    .slice(0, 7)
    .reduce((sum, item) => sum + item.total_amount, 0);

  // Get today's investment
  const todayInvestment = dailyInvestments[0]?.total_amount || 0;

  const handleLogout = () => {
    adminLogout();
    router.push("/admin");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, <span className="font-semibold">{adminUsername}</span>
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Investment</CardTitle>
              <CardDescription>Current day total</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-9 bg-gray-200 rounded w-32"></div>
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(todayInvestment)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">7-Day Investment</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-9 bg-gray-200 rounded w-32"></div>
              ) : (
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(last7DaysInvestment)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Investments</CardTitle>
              <CardDescription>Last 10 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-9 bg-gray-200 rounded w-32"></div>
              ) : (
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(totalInvestment)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Days</CardTitle>
              <CardDescription>With investments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-9 bg-gray-200 rounded w-32"></div>
              ) : (
                <p className="text-3xl font-bold text-yellow-600">
                  {dailyInvestments.filter((d) => d.total_amount > 0).length} / 10
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={() => setIsAddPackageModalOpen(true)}
                className="h-20 text-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                Add Package
              </Button>
              <Button className="h-20 text-lg" variant="outline">
                Manage Users
              </Button>
              <Button className="h-20 text-lg" variant="outline">
                View Deposits
              </Button>
              <Button className="h-20 text-lg" variant="outline">
                Approve Withdrawals
              </Button>
              <Button className="h-20 text-lg" variant="outline">
                Investment Reports
              </Button>
              <Button className="h-20 text-lg" variant="outline">
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Investment Chart/Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Investments</CardTitle>
            <CardDescription>Investment amounts for the last 10 days</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg mb-4">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse h-12 bg-gray-200 rounded"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {dailyInvestments.map((investment, index) => {
                  const maxAmount = Math.max(
                    ...dailyInvestments.map((d) => d.total_amount)
                  );
                  const percentage =
                    maxAmount > 0 ? (investment.total_amount / maxAmount) * 100 : 0;
                  const isToday = index === 0;
                  const hasInvestment = investment.total_amount > 0;

                  return (
                    <div
                      key={investment.day}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                        isToday
                          ? "bg-blue-50 border-2 border-blue-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-24 text-sm font-medium text-gray-700">
                        {formatDate(investment.day)}
                        {isToday && (
                          <span className="ml-2 text-xs text-blue-600 font-semibold">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="relative h-8 bg-gray-200 rounded overflow-hidden">
                          {hasInvestment && (
                            <div
                              className={`absolute inset-y-0 left-0 ${
                                isToday
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                              } transition-all duration-500 flex items-center px-3`}
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 20 && (
                                <span className="text-white text-sm font-semibold">
                                  {formatCurrency(investment.total_amount)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-32 text-right">
                        <span
                          className={`text-lg font-bold ${
                            hasInvestment
                              ? isToday
                                ? "text-blue-600"
                                : "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {formatCurrency(investment.total_amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
            <CardDescription>Detailed breakdown of daily investments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-right p-3 font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="text-center p-3 font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyInvestments.map((investment, index) => {
                      const isToday = index === 0;
                      const hasInvestment = investment.total_amount > 0;
                      
                      return (
                        <tr
                          key={investment.day}
                          className={`border-b border-gray-100 ${
                            isToday ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {new Date(investment.day).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                              {isToday && (
                                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                  Today
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`text-lg font-bold ${
                                hasInvestment ? "text-green-600" : "text-gray-400"
                              }`}
                            >
                              {formatCurrency(investment.total_amount)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {hasInvestment ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded-full">
                                No Activity
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td className="p-3 font-bold text-gray-800">Total</td>
                      <td className="p-3 text-right">
                        <span className="text-xl font-bold text-purple-600">
                          {formatCurrency(totalInvestment)}
                        </span>
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Package Modal */}
      <AddPackageModal
        isOpen={isAddPackageModalOpen}
        onClose={() => setIsAddPackageModalOpen(false)}
      />
    </div>
  );
}

