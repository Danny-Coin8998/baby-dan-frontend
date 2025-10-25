"use client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useState } from "react";

export function Header() {
  const { signout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signout();
      // Redirect to login page after successful logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect to login page even if logout fails
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-end bg-[#101828]">
      <div className="flex items-center space-x-4 pr-10">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl bg-transparent text-white font-normal"
        >
          Dashboard <LayoutDashboard className="fill-white" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl bg-transparent text-white font-normal"
          onClick={handleLogout}
          disabled={isLoading || isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}{" "}
          <LogOut className="text-white" />
        </Button>
      </div>
    </header>
  );
}
