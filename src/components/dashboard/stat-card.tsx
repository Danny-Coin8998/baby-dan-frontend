import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <div className="relative w-full mt-4 sm:mt-6 md:mt-8">
      {/* Floating Icon */}
      <div className="absolute -top-6 sm:-top-8 md:-top-10 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-2 sm:border-3 md:border-4 border-white">
          <div className="text-2xs sm:text-xs md:text-sm lg:text-base">
            {icon}
          </div>
        </div>
      </div>

      {/* Card */}
      <Card
        className={cn(
          "bg-white border-0 shadow-sm rounded-4xl w-full min-h-[45px] sm:min-h-[60px] md:min-h-[80px]",
          className
        )}
      >
        <CardContent className="p-2 sm:p-3 pt-4 sm:pt-6 md:pt-8 h-full flex flex-col justify-center">
          <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
            <p className="text-sm sm:text-base md:text-lg font-normal text-[#0B0B0B] px-1 leading-tight">
              {title}
            </p>
            <div className="w-12 sm:w-16 md:w-45 h-px bg-[#434343]"></div>
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-black">
              {value}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
