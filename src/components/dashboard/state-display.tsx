import { Button } from "@/components/ui/button";

interface StateDisplayProps {
  type: "loading" | "error" | "empty";
  message?: string;
  onRetry?: () => void;
}

export function StateDisplay({ type, message, onRetry }: StateDisplayProps) {
  if (type === "loading") {
    return (
      <div className="flex items-center justify-center h-32 sm:h-48 md:h-64">
        <div className="text-sm sm:text-base md:text-lg">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-32 sm:h-48 md:h-64 text-center px-4">
        <div className="text-red-400 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
          Error loading dashboard data
        </div>
        {message && (
          <div className="text-xs sm:text-sm mb-4 sm:mb-6 break-words">
            {message}
          </div>
        )}
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-[#9058FE] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (type === "empty") {
    return (
      <div className="flex items-center justify-center h-32 sm:h-48 md:h-64">
        <div className="text-sm sm:text-base md:text-lg">
          No data available
        </div>
      </div>
    );
  }

  return null;
}

