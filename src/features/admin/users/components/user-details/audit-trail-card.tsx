"use client";

import { Activity, Clock, ExternalLink, FileText, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type AuditTrailCardProps = {
	userId: string;
};

type AuditLogEntry = {
	id: string;
	time: Date;
	action: string;
	entity: string;
	context: string;
	organizationName?: string;
};

const RECENT_AUDIT_LIMIT = 20;

export function AuditTrailCard({ userId: _ }: AuditTrailCardProps) {
	// Mock data - replace with actual API calls
	const auditLog: AuditLogEntry[] = [
		{
			id: "audit_1",
			time: new Date("2024-01-20T14:30:00Z"),
			action: "loan.approve",
			entity: "loan:LOAN-2024-001",
			context: "Approved loan application for John Farmer",
			organizationName: "Green Valley Cooperative",
		},
		{
			id: "audit_2",
			time: new Date("2024-01-20T10:15:00Z"),
			action: "farmer.create",
			entity: "farmer:FARM-2024-005",
			context: "Created new farmer profile",
			organizationName: "Green Valley Cooperative",
		},
		{
			id: "audit_3",
			time: new Date("2024-01-19T16:45:00Z"),
			action: "savings.deposit",
			entity: "savings:SAV-2024-010",
			context: "Recorded savings deposit of GHS 500",
			organizationName: "Ashanti Farmers Group",
		},
		{
			id: "audit_4",
			time: new Date("2024-01-19T13:20:00Z"),
			action: "stock.adjustment",
			entity: "stock:LOT-2024-003",
			context: "Adjusted stock quantity for maize lot",
			organizationName: "Green Valley Cooperative",
		},
		{
			id: "audit_5",
			time: new Date("2024-01-18T09:30:00Z"),
			action: "payment.record",
			entity: "payment:PAY-2024-007",
			context: "Recorded loan repayment",
			organizationName: "Ashanti Farmers Group",
		},
		{
			id: "audit_6",
			time: new Date("2024-01-17T15:10:00Z"),
			action: "user.update",
			entity: "user:USER-2024-001",
			context: "Updated user profile information",
			organizationName: "Green Valley Cooperative",
		},
	];

	const handleOpenFullAudit = () => {
		// Navigate to full audit page
		window.open("/admin/audit", "_blank");
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getActionIcon = (action: string) => {
		if (action.includes("create")) {
			return <User className="h-3 w-3 text-green-600" />;
		}
		if (action.includes("update") || action.includes("edit")) {
			return <Activity className="h-3 w-3 text-blue-600" />;
		}
		if (action.includes("approve") || action.includes("deposit")) {
			return <Activity className="h-3 w-3 text-green-600" />;
		}
		if (action.includes("delete") || action.includes("reject")) {
			return <Activity className="h-3 w-3 text-red-600" />;
		}
		return <Activity className="h-3 w-3 text-gray-600" />;
	};

	const getActionVariant = (action: string) => {
		if (action.includes("create") || action.includes("approve")) {
			return "default";
		}
		if (action.includes("update") || action.includes("edit")) {
			return "secondary";
		}
		if (action.includes("delete") || action.includes("reject")) {
			return "destructive";
		}
		return "outline";
	};

	const getActionDisplayName = (action: string) => {
		return action
			.split(".")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	};

	const getEntityDisplayName = (entity: string) => {
		const [type, id] = entity.split(":");
		return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${id}`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					Audit Trail
				</CardTitle>
				<CardDescription>
					User activity log showing actions performed across organizations
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Filters - Simplified without Select component */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Activity Filters</h4>
						<div className="text-muted-foreground text-sm">
							Showing last {RECENT_AUDIT_LIMIT} entries
						</div>
					</div>
				</div>

				{/* Audit Log Table */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">
							Recent Activity ({auditLog.length} entries)
						</h4>
						<Button onClick={handleOpenFullAudit} size="sm" variant="outline">
							<ExternalLink className="mr-2 h-4 w-4" />
							Open Full Audit
						</Button>
					</div>

					{auditLog.length === 0 ? (
						<div className="py-8 text-center">
							<Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
							<h3 className="mt-4 font-semibold text-lg">No activity found</h3>
							<p className="mt-2 text-muted-foreground">
								No audit entries match the selected filters.
							</p>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Time</TableHead>
										<TableHead>Action</TableHead>
										<TableHead>Entity</TableHead>
										<TableHead>Context</TableHead>
										<TableHead>Organization</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{auditLog.slice(0, RECENT_AUDIT_LIMIT).map((entry) => (
										<TableRow key={entry.id}>
											<TableCell className="text-muted-foreground text-sm">
												{formatDate(entry.time)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{getActionIcon(entry.action)}
													<Badge variant={getActionVariant(entry.action)}>
														{getActionDisplayName(entry.action)}
													</Badge>
												</div>
											</TableCell>
											<TableCell className="font-mono text-sm">
												{getEntityDisplayName(entry.entity)}
											</TableCell>
											<TableCell className="max-w-[200px] truncate text-sm">
												{entry.context}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{entry.organizationName || "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
