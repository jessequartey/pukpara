"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { farmerColumns } from "./farmer-table/columns";
import { DataTable, type SortState } from "./farmer-table/data-table";

export function FarmersDirectoryCard() {
	const [sort, setSort] = useState<SortState>({
		field: "createdAt",
		direction: "desc",
	});

	const {
		data: farmers,
		isLoading,
		isFetching,
	} = api.organization.farmers.list.useQuery();
	const { data: stats } = api.organization.farmers.stats.useQuery();

	const handleView = (row: any) => {
		console.log("View farmer:", row);
		// TODO: Navigate to farmer details page
	};

	const handleEdit = (row: any) => {
		console.log("Edit farmer:", row);
		// TODO: Navigate to farmer edit page
	};

	const handleViewFarms = (row: any) => {
		console.log("View farms:", row);
		// TODO: Navigate to farmer farms page
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Farmers</CardTitle>
					{stats && (
						<div className="flex gap-4 text-sm text-muted-foreground">
							<span>{stats.totalFarmers} total</span>
							<span>{stats.verifiedFarmers} verified</span>
							{stats.pendingFarmers > 0 && (
								<span>{stats.pendingFarmers} pending</span>
							)}
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<DataTable
					data={farmers || []}
					columns={farmerColumns}
					sort={sort}
					onSortChange={setSort}
					onView={handleView}
					onEdit={handleEdit}
					onViewFarms={handleViewFarms}
					isLoading={isLoading}
					isFetching={isFetching}
				/>
			</CardContent>
		</Card>
	);
}
