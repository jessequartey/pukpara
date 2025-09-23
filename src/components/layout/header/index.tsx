"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { PukparaLogo } from "../logo";
import { NotificationButton } from "./notification";
import { SearchButton } from "./search";

import { UserButton } from "./user-button";

export default function Header() {
	const isMobile = useIsMobile();
	const { open: isSidebarOpen, toggleSidebar } = useSidebar();

	return (
		<header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
			<div className="flex items-center gap-4">
				{(isMobile || !isSidebarOpen) && (
					<Button
						className="shrink-0"
						onClick={toggleSidebar}
						size="icon"
						variant="ghost"
					>
						<Menu className="h-5 w-5" />
						<span className="sr-only">Toggle sidebar</span>
					</Button>
				)}

				{(isMobile || !isSidebarOpen) && (
					<div className="flex items-center">
						<PukparaLogo />
					</div>
				)}
			</div>

			<div className="flex items-center gap-2">
				<SearchButton />
				<NotificationButton />
				<UserButton />
			</div>
		</header>
	);
}
