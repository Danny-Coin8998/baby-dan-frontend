"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import LogoImg from "@/images/DAN Binary Logo.png";
import BG from "@/images/Background.png";

export default function LoginPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading,
    error,
    connectedAddress,
    jwtToken,
    user,
    login,
    signout,
    clearError,
  } = useAuth();

  // Token verification is handled automatically by axios interceptor

  // Handle login button click
  const handleLogin = async () => {
    try {
      clearError();
      await login();

      // If login successful, redirect to dashboard
      if (isAuthenticated) {
        router.push("/");
      }
    } catch (error) {
      // Error is already handled by the store
      console.error("Login failed:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && jwtToken) {
      router.push("/");
    }
  }, [isAuthenticated, jwtToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={BG}
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C27BF] to-[#263450] mix-blend-hue" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/dan-logo.png"
            alt="DAN Binary Logo"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        <div className="w-full max-w-md min-h-[300px] border border-white/44 backdrop-blur-sm rounded-2xl p-8 shadow-xl flex flex-col justify-center">
          <h1 className="text-center text-white text-6xl mb-6">Login</h1>

          {!connectedAddress && !isAuthenticated && (
            <div className="text-yellow-400 text-center mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              Notice: Please unlock your wallet before logging in.
            </div>
          )}

          {error && (
            <div className="text-red-400 text-center mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              {error}
            </div>
          )}

          {isAuthenticated && jwtToken && (
            <div className="text-white text-center mb-6 space-y-2">
              <div className="text-sm text-white/80">
                Authentication Status:
              </div>
              <div className="text-lg font-semibold text-green-400">
                ✓ Logged In Successfully
              </div>
              <div className="text-xs text-white/60">
                User ID: {user?.userid || "N/A"}
              </div>
              <div className="text-xs text-white/60">
                Wallet: {user?.wallet_address?.substring(0, 10)}...
              </div>
            </div>
          )}

          {connectedAddress && !isAuthenticated && (
            <div className="text-white text-center mb-6 space-y-2">
              <div className="text-sm text-white/80">Wallet Connected:</div>
              <div className="break-words text-lg font-mono bg-white/10 p-2 rounded">
                {connectedAddress}
              </div>
              <div className="text-xs text-yellow-400">
                Ready to authenticate with backend
              </div>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-16 max-w-[500px] bg-white border-2 border-[#9058FE] text-[#9058FE] font-medium text-2xl rounded-full transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading
              ? "Processing..."
              : isAuthenticated
              ? "Go to Dashboard"
              : connectedAddress
              ? "Authenticate & Login"
              : "Connect Wallet & Login"}
          </Button>

          {(connectedAddress || isAuthenticated) && (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12 mt-4 border border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300"
            >
              {isAuthenticated ? "Logout" : "Disconnect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
