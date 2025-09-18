"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Header from "./header";
import { AppSidebar, type SidebarNavGroup } from "./sidebar";

type DashboardLayoutProps = {
  navGroups: SidebarNavGroup[];
  children: ReactNode;
  contentClassName?: string;
  footerSlot?: ReactNode;
};

export function DashboardLayout({
  navGroups,
  children,
  contentClassName,
  footerSlot,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar footerSlot={footerSlot} navGroups={navGroups} />
      <SidebarInset className="min-h-screen">
        <Header />
        <div
          className={cn(
            "flex flex-1 flex-col overflow-y-auto bg-background px-4 pt-6 pb-10 lg:px-8",
            contentClassName
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
