"use client";

import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import unprotectedRoutes from "./routes-config/unprotectroutes.json";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();

  // Check if current path is in unprotected routes
  const isUnprotectedRoute = unprotectedRoutes.includes(pathname);

  // If it's an unprotected route (like login), render children directly
  if (isUnprotectedRoute) {
    return <>{children}</>;
  }

  // For protected routes, wrap with ProtectedRoute and DashboardLayout
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
};
