"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DeleteOrganizationCardProps = {
	organizationName: string;
	onDelete?: () => void;
};

export function DeleteOrganizationCard({
	organizationName,
	onDelete,
}: DeleteOrganizationCardProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const handleDelete = () => {
		onDelete?.();
		setIsDeleteDialogOpen(false);
	};

	return (
		<>
			<Card className="border-destructive/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<Trash2 className="size-4" />
						Danger Zone
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h4 className="font-medium text-sm">Delete Organization</h4>
						<p className="text-muted-foreground text-sm">
							Permanently delete this organization and all associated data. This
							action cannot be undone.
						</p>
					</div>

					<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
						<div className="flex items-start gap-2">
							<Trash2 className="mt-0.5 size-4 text-destructive" />
							<div className="text-sm">
								<p className="font-medium text-destructive">Warning</p>
								<p className="text-destructive/80">
									This will permanently delete{" "}
									<strong>{organizationName}</strong> and all related data
									including:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-destructive/80">
									<li>All user accounts and members</li>
									<li>Financial records and transactions</li>
									<li>Inventory and warehouse data</li>
									<li>Marketplace listings and orders</li>
									<li>Compliance and audit logs</li>
								</ul>
							</div>
						</div>
					</div>

					<Button
						onClick={() => setIsDeleteDialogOpen(true)}
						size="sm"
						variant="destructive"
					>
						<Trash2 className="mr-2 size-4" />
						Delete Organization
					</Button>
				</CardContent>
			</Card>

			<AlertDialog
				onOpenChange={setIsDeleteDialogOpen}
				open={isDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {organizationName}?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							organization "{organizationName}" and all associated data
							including user accounts, financial records, inventory, and
							compliance data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDelete}
						>
							Delete Organization
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
