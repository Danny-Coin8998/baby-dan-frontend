import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function ActionButton({ onClick, children }: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="bg-yellow-500/50 text-gray-800 hover:bg-yellow-500/20 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg lg:text-xl font-normal rounded-lg border-0 shadow-lg w-full cursor-pointer h-12 sm:h-14 md:h-16"
      style={{
        boxShadow: "3px 0px 4px 0px #00000040",
      }}
    >
      {children}
    </Button>
  );
}

