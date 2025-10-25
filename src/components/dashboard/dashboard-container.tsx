import { ReactNode } from "react";
import { Separator } from "@radix-ui/react-separator";
import { DashboardHeader } from "./dashboard-header";

interface DashboardContainerProps {
  children: ReactNode;
}

export function DashboardContainer({ children }: DashboardContainerProps) {
  return (
    <div className="w-full space-y-4 sm:space-y-6 sm:px-4">
      <DashboardHeader />
      <Separator className="bg-[#989898] h-px mb-3 sm:mb-4 md:mb-5" />
      <div className="dashboard-gradient rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl">
        <div className="space-y-6 md:space-y-8 max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}

