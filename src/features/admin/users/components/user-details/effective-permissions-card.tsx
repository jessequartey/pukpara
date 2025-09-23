"use client";

import { CheckCircle, Key, Settings, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type EffectivePermissionsCardProps = {
	userId: string;
};

type Permission = {
	action: string;
	resource: string;
	allowed: boolean;
	description: string;
};

type Organization = {
	id: string;
	name: string;
	userRole: string;
};

export function EffectivePermissionsCard({
	userId,
}: EffectivePermissionsCardProps) {
	const [selectedOrgId, setSelectedOrgId] = useState<string>("org_1");

	// Mock data - replace with actual API calls
	const organizations: Organization[] = [
		{
			id: "org_1",
			name: "Green Valley Cooperative",
			userRole: "member",
		},
		{
			id: "org_2",
			name: "Ashanti Farmers Group",
			userRole: "admin",
		},
	];

	const permissions: Record<string, Permission[]> = {
		org_1: [
			{
				action: "farmers.view",
				resource: "farmers",
				allowed: true,
				description: "View farmer directory",
			},
			{
				action: "farmers.create",
				resource: "farmers",
				allowed: false,
				description: "Create new farmers",
			},
			{
				action: "savings.view",
				resource: "savings",
				allowed: true,
				description: "View savings accounts",
			},
			{
				action: "savings.create",
				resource: "savings",
				allowed: false,
				description: "Create savings entries",
			},
			{
				action: "loans.view",
				resource: "loans",
				allowed: true,
				description: "View loan applications",
			},
			{
				action: "loans.approve",
				resource: "loans",
				allowed: false,
				description: "Approve loan applications",
			},
			{
				action: "inventory.view",
				resource: "inventory",
				allowed: true,
				description: "View inventory levels",
			},
			{
				action: "inventory.manage",
				resource: "inventory",
				allowed: false,
				description: "Manage inventory movements",
			},
		],
		org_2: [
			{
				action: "farmers.view",
				resource: "farmers",
				allowed: true,
				description: "View farmer directory",
			},
			{
				action: "farmers.create",
				resource: "farmers",
				allowed: true,
				description: "Create new farmers",
			},
			{
				action: "farmers.edit",
				resource: "farmers",
				allowed: true,
				description: "Edit farmer information",
			},
			{
				action: "savings.view",
				resource: "savings",
				allowed: true,
				description: "View savings accounts",
			},
			{
				action: "savings.create",
				resource: "savings",
				allowed: true,
				description: "Create savings entries",
			},
			{
				action: "loans.view",
				resource: "loans",
				allowed: true,
				description: "View loan applications",
			},
			{
				action: "loans.approve",
				resource: "loans",
				allowed: true,
				description: "Approve loan applications",
			},
			{
				action: "organization.settings",
				resource: "organization",
				allowed: true,
				description: "Manage organization settings",
			},
		],
	};

	const selectedOrg = organizations.find((org) => org.id === selectedOrgId);
	const selectedPermissions = permissions[selectedOrgId] || [];

	const handleChangeRole = () => {
		toast.success("Change role dialog would open");
	};

	const groupedPermissions = selectedPermissions.reduce(
		(acc, permission) => {
			if (!acc[permission.resource]) {
				acc[permission.resource] = [];
			}
			acc[permission.resource].push(permission);
			return acc;
		},
		{} as Record<string, Permission[]>,
	);

	const getResourceIcon = (_resource: string) => {
		// You can customize icons based on resource type
		return <Key className="h-4 w-4" />;
	};

	const getResourceDisplayName = (resource: string) => {
		switch (resource) {
			case "farmers":
				return "Farmers";
			case "savings":
				return "Savings";
			case "loans":
				return "Loans";
			case "inventory":
				return "Inventory";
			case "organization":
				return "Organization";
			default:
				return resource;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Key className="h-5 w-5" />
					Effective Permissions
				</CardTitle>
				<CardDescription>
					Computed permissions for the user's role in each organization
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Organization Selector */}
				<div className="space-y-2">
					<label className="font-medium text-sm">Organization</label>
					<Select onValueChange={setSelectedOrgId} value={selectedOrgId}>
						<SelectTrigger>
							<SelectValue placeholder="Select organization" />
						</SelectTrigger>
						<SelectContent>
							{organizations.map((org) => (
								<SelectItem key={org.id} value={org.id}>
									{org.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{selectedOrg && (
					<>
						{/* Current Role */}
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="font-medium text-sm">Current Role</p>
								<Badge variant="outline">{selectedOrg.userRole}</Badge>
							</div>
							<Button onClick={handleChangeRole} size="sm" variant="outline">
								<Settings className="mr-2 h-4 w-4" />
								Change Role
							</Button>
						</div>

						<Separator />

						{/* Permissions Grid */}
						<div className="space-y-4">
							<h4 className="font-medium text-sm">Allowed Actions</h4>
							{Object.entries(groupedPermissions).map(([resource, perms]) => (
								<div className="space-y-3" key={resource}>
									<div className="flex items-center gap-2">
										{getResourceIcon(resource)}
										<h5 className="font-medium text-sm">
											{getResourceDisplayName(resource)}
										</h5>
									</div>
									<div className="grid gap-2 pl-6">
										{perms.map((permission, index) => (
											<div
												className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
												key={index}
											>
												<div className="flex items-center gap-2">
													{permission.allowed ? (
														<CheckCircle className="h-4 w-4 text-green-600" />
													) : (
														<XCircle className="h-4 w-4 text-red-600" />
													)}
													<span className="text-sm">
														{permission.description}
													</span>
												</div>
												<code className="rounded bg-background px-2 py-1 text-xs">
													{permission.action}
												</code>
											</div>
										))}
									</div>
								</div>
							))}
						</div>

						{/* Debug Info */}
						<div className="mt-6 rounded-lg bg-muted/30 p-3">
							<p className="text-muted-foreground text-xs">
								💡 Tip: Permissions are computed based on the user's role in
								this organization. Use "Change Role" to update permissions or
								check hasPermission() API for debugging.
							</p>
						</div>
					</>
				)}

				{organizations.length === 0 && (
					<div className="py-6 text-center">
						<Key className="mx-auto h-8 w-8 text-muted-foreground/50" />
						<p className="mt-2 text-muted-foreground text-sm">
							No organization memberships found
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
