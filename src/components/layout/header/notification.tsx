"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export const NotificationButton = () => {
	const [open, setOpen] = useState(false);

	return (
		<Sheet onOpenChange={setOpen} open={open}>
			<SheetTrigger asChild>
				<Button className="relative" size="icon" variant="outline">
					<Bell className="h-5 w-5" />
					<span className="sr-only">Notifications</span>
					{/* Notification badge */}
					<span
						aria-hidden="true"
						className="-top-1 -right-1 absolute h-3 w-3 rounded-full bg-red-500"
					/>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-80 sm:w-96">
				<SheetHeader>
					<SheetTitle>Notifications</SheetTitle>
					<SheetDescription>
						Stay updated with the latest activities on your platform.
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6 space-y-4">
					{/* Placeholder notifications */}
					<div className="rounded-lg border p-4">
						<div className="flex items-start gap-3">
							<div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
							<div className="flex-1">
								<p className="font-medium text-sm">New farmer registration</p>
								<p className="mt-1 text-muted-foreground text-xs">
									John Doe has registered as a new farmer in the Northern
									Region.
								</p>
								<p className="mt-2 text-muted-foreground text-xs">
									2 hours ago
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-lg border p-4">
						<div className="flex items-start gap-3">
							<div className="mt-2 h-2 w-2 rounded-full bg-green-500" />
							<div className="flex-1">
								<p className="font-medium text-sm">Loan application approved</p>
								<p className="mt-1 text-muted-foreground text-xs">
									Loan application #LA-2024-001 has been approved for
									processing.
								</p>
								<p className="mt-2 text-muted-foreground text-xs">
									5 hours ago
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-lg border p-4">
						<div className="flex items-start gap-3">
							<div className="mt-2 h-2 w-2 rounded-full bg-orange-500" />
							<div className="flex-1">
								<p className="font-medium text-sm">Harvest data updated</p>
								<p className="mt-1 text-muted-foreground text-xs">
									Harvest yield data for Q4 2024 has been updated in the system.
								</p>
								<p className="mt-2 text-muted-foreground text-xs">1 day ago</p>
							</div>
						</div>
					</div>

					<div className="pt-4 text-center">
						<Button size="sm" variant="ghost">
							View all notifications
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};
