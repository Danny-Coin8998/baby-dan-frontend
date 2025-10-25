import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "highlight";
  className?: string;
}

export function MetricCard({
  label,
  value,
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "border-0 shadow-lg rounded-4xl",
        "bg-[#FECA58]",
        "w-full",

        className
      )}
      style={{
        backdropFilter: "blur(20px)",
        boxShadow: "3px 0px 10px 0px #FECA58",
      }}
    >
      <CardContent className="px-3 sm:px-4 lg:px-6 py-1 sm:py-1 min-h-full flex items-center">
        <div className="flex justify-between items-center w-full gap-2 sm:gap-3 lg:gap-4">
          <p className="text-xs sm:text-sm lg:text-base font-normal text-[#424242] flex-shrink-0 leading-tight">
            {label}
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-[#484848] text-right leading-tight break-all">
            {typeof value === "string" && value.length > 10 ? (
              <span className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                {value}
              </span>
            ) : (
              value
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
