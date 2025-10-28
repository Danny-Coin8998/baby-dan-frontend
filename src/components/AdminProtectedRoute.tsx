"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const router = useRouter();
  const hasChecked = useRef(false);

  const { checkAdminSession, isAdminAuthenticated, _hasHydrated } =
    useAdminAuthStore();

  // Check authentication after hydration
  useEffect(() => {
    // Wait for store to hydrate
    if (!_hasHydrated || hasChecked.current) return;
    hasChecked.current = true;

    // Check admin session validity
    const isValidSession = checkAdminSession();

    if (!isValidSession) {
      setIsAuthenticated(false);
      setIsRedirecting(true);
      router.push("/admin");
      return;
    }

    setIsAuthenticated(isAdminAuthenticated);
    setIsChecked(true);
  }, [_hasHydrated, checkAdminSession, isAdminAuthenticated, router]);

  // Show loading state while hydrating, checking authentication, or redirecting
  if (!_hasHydrated || !isChecked || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRedirecting
              ? "Redirecting to admin login..."
              : !_hasHydrated
              ? "Loading..."
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

  // Admin is authenticated, render children
  return <Fragment>{children}</Fragment>;
};

