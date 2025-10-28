"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/store/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    isAdminAuthenticated,
    error,
    adminUsername,
    adminLogin,
    adminLogout,
    clearError,
    checkAdminSession,
  } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated && checkAdminSession()) {
      router.push("/admin/dashboard");
    }
  }, [isAdminAuthenticated, checkAdminSession, router]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    try {
      const success = await adminLogin(username, password);
      
      if (success) {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    adminLogout();
    setUsername("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/babydan-logo.png"
            alt="DAN Binary Logo"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md border border-white/44 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h1 className="text-center text-5xl mb-2 font-bold ">
            Admin Login
          </h1>
          <p className="text-center text-sm /70 mb-6">
            Enter your credentials to access admin panel
          </p>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-center mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {isAdminAuthenticated && (
            <div className="text-green-400 text-center mb-6 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="font-semibold">✓ Logged in as {adminUsername}</div>
            </div>
          )}

          {/* Login Form */}
          {!isAdminAuthenticated ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium  mb-2"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full h-12 bg-white/10 border-white/30  placeholder:/50 focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium  mb-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full h-12 bg-white/10 border-white/30  placeholder:/50 focus:border-yellow-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full h-12 bg-yellow-500 text-black font-semibold text-lg rounded-lg transition-all duration-300 hover:bg-yellow-400 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                className="w-full h-12 bg-yellow-500 text-black font-semibold text-lg rounded-lg transition-all duration-300 hover:bg-yellow-400 hover:scale-[1.02]"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full h-12 border border-white/30  bg-transparent hover:bg-white/10 transition-all duration-300"
              >
                Logout
              </Button>
            </div>
          )}

          {/* Development Note */}
          {/* <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              <strong>Note:</strong> Frontend-only authentication. Check
              .env.local for credentials.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

