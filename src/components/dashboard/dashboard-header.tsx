import Image from "next/image";
import DashboardIcon from "@/images/icons/dashboard.png";

export function DashboardHeader() {
  return (
    <div className="mb-3 sm:mb-4 md:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold flex items-center gap-2 sm:gap-3 md:gap-4">
        Dashboard
        <Image
          src={DashboardIcon}
          alt="Dashboard"
          width={18}
          height={18}
          className="object-contain sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px] filter brightness-0 saturate-100 hue-rotate-45 sepia-100"
        />
      </h1>
    </div>
  );
}

