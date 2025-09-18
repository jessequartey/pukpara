"use client";

import { icons } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type IconName = keyof typeof icons;

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: IconName;
  description?: string;
};

export type SidebarNavGroup = {
  title: string;
  items: SidebarNavItem[];
};

type SidebarNavigationProps = {
  groups: SidebarNavGroup[];
};

export function SidebarNavigationComponent({ groups }: SidebarNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = icons[item.icon] ?? icons.Circle;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                      }
                      tooltip={item.description}
                    >
                      <Link
                        className="flex items-center gap-2"
                        href={item.href}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
}
