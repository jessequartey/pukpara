"use client";

import { Activity, Eye, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentActivityCard() {
	// Mock data - replace with actual API call
	const activities = [
		{
			id: "act_1",
			timestamp: "2024-01-18T14:30:00Z",
			actor: "John Doe",
			action: "created",
			entity: "warehouse",
			context: "Main Storage Facility",
		},
		{
			id: "act_2",
			timestamp: "2024-01-18T13:15:00Z",
			actor: "Jane Smith",
			action: "updated",
			entity: "listing",
			context: "Maize listing price changed",
		},
		{
			id: "act_3",
			timestamp: "2024-01-18T11:45:00Z",
			actor: "Admin User",
			action: "approved",
			entity: "member",
			context: "New farmer registration",
		},
		{
			id: "act_4",
			timestamp: "2024-01-18T10:20:00Z",
			actor: "System",
			action: "generated",
			entity: "report",
			context: "Weekly inventory summary",
		},
		{
			id: "act_5",
			timestamp: "2024-01-17T16:30:00Z",
			actor: "Mike Johnson",
			action: "completed",
			entity: "transaction",
			context: "Loan repayment processed",
		},
	];

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60 * 60),
		);

		if (diffInHours < 1) {
			return "Just now";
		}
		if (diffInHours < 24) {
			return `${diffInHours}h ago`;
		}
		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays}d ago`;
	};

	const getActionColor = (action: string) => {
		switch (action) {
			case "created":
				return "text-green-600";
			case "updated":
				return "text-blue-600";
			case "approved":
				return "text-emerald-600";
			case "deleted":
				return "text-red-600";
			case "completed":
				return "text-purple-600";
			default:
				return "text-gray-600";
		}
	};

	const getEntityBadge = (entity: string) => {
		const variants = {
			warehouse: "default",
			listing: "secondary",
			member: "outline",
			report: "secondary",
			transaction: "default",
		} as const;

		return (
			<Badge variant={variants[entity as keyof typeof variants] || "outline"}>
				{entity}
			</Badge>
		);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Activity className="size-4" />
						Recent Activity
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button size="sm" variant="outline">
							<Filter className="mr-2 size-4" />
							Filter
						</Button>
						<Button size="sm" variant="outline">
							<Eye className="mr-2 size-4" />
							See All
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{activities.map((activity) => (
						<div
							className="flex items-start gap-3 border-b pb-3 last:border-b-0"
							key={activity.id}
						>
							<div className="mt-1 size-2 rounded-full bg-blue-500" />
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2 text-sm">
									<span className="font-medium">{activity.actor}</span>
									<span className={getActionColor(activity.action)}>
										{activity.action}
									</span>
									{getEntityBadge(activity.entity)}
								</div>
								<p className="mt-1 text-muted-foreground text-xs">
									{activity.context}
								</p>
								<p className="mt-1 text-muted-foreground text-xs">
									{formatTime(activity.timestamp)}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
