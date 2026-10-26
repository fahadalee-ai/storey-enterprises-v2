import type { ReactNode } from "react";
import { Toasts } from "@/components/app/ui";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-[#E6EAF2] sm:items-center sm:py-6">
      <div className="h-dvh w-full max-w-[390px] sm:h-[868px] sm:w-[414px] sm:max-w-none sm:rounded-[44px] sm:bg-[#0F172A] sm:p-3 sm:shadow-[0_30px_80px_rgba(15,23,42,.28)]">
        <div className="relative flex h-full flex-col overflow-hidden bg-white sm:rounded-[32px]">
          <div className="pointer-events-none absolute left-1/2 top-2 z-[80] hidden h-[18px] w-[104px] -translate-x-1/2 rounded-full bg-[#0F172A] sm:block" />
          <div className="min-h-0 flex-1">{children}</div>
          <Toasts />
        </div>
      </div>
    </div>
  );
}
