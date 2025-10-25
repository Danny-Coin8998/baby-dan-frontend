"use client";

import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const router = useRouter();
  const hasChecked = useRef(false);

  const {
    verifyToken,
    isAuthenticated: storeIsAuthenticated,
    jwtToken,
  } = useAuthStore();

  const handleCheck = useCallback(async () => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Check if we have a token in localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsAuthenticated(false);
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // If store already has authentication state, use it
    if (storeIsAuthenticated && jwtToken) {
      setIsAuthenticated(true);
      setIsChecked(true);
      return;
    }

    // Verify the token with the server
    try {
      const response = await verifyToken(token);
      if (response.success) {
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it and redirect
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setIsRedirecting(true);
        router.push("/login");
        return;
      }
    } catch {
      // Error verifying token, remove it and redirect
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    setIsChecked(true);
  }, [router, storeIsAuthenticated, jwtToken, verifyToken]);

  useEffect(() => {
    handleCheck();
  }, [handleCheck]);

  // Show loading state while checking authentication or redirecting
  if (!isChecked || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRedirecting
              ? "Redirecting to login..."
              : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null to allow redirect to complete
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <Fragment>{children}</Fragment>;
};
