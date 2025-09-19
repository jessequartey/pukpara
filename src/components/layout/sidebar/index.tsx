"use client";

import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarFooterComponent } from "./footer";
import { SidebarHeaderComponent } from "./header";
import { SidebarNavigationComponent, type SidebarNavGroup } from "./navigation";

export type { SidebarNavGroup };

type AppSidebarProps = {
  navGroups: SidebarNavGroup[];
  footerSlot?: ReactNode;
};

export function AppSidebar({ navGroups, footerSlot }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeaderComponent />
      <SidebarContent>
        <SidebarNavigationComponent groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>{footerSlot ?? <SidebarFooterComponent />}</SidebarFooter>
    </Sidebar>
  );
}
