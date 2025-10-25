"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import noLayoutRoutes from "../routes-config/no-layout-routes.json";

interface DashboardLayoutProps {
  children: React.ReactNode;
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // If current path is in no-layout routes, render children without dashboard layout
  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Render with dashboard layout for protected routes
  return (
    <div className="flex h-screen bg-white">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto px-4 md:px-15 py-4 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
