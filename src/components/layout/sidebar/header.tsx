"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { PukparaLogo } from "../logo";

export function SidebarHeaderComponent() {
	const { toggleSidebar } = useSidebar();
	const isMobile = useIsMobile();
	return (
		<SidebarHeader className="h-16 border-border border-b px-4">
			<div className="flex h-full items-center justify-between">
				<div className="flex items-center">
					<PukparaLogo />
				</div>
				{!isMobile && (
					<Button
						className="shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						onClick={toggleSidebar}
						size="icon"
						variant="ghost"
					>
						<Menu className="h-5 w-5" />
						<span className="sr-only">Toggle sidebar</span>
					</Button>
				)}
			</div>
		</SidebarHeader>
	);
}
