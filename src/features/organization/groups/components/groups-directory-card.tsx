"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { groupColumns } from "./group-table/columns";
import { DataTable, type SortState } from "./group-table/data-table";

export function GroupsDirectoryCard() {
	const [sort, setSort] = useState<SortState>({
		field: "createdAt",
		direction: "desc",
	});

	const {
		data: groups,
		isLoading,
		isFetching,
	} = api.organization.groups.list.useQuery();
	const { data: stats } = api.organization.groups.stats.useQuery();

	const handleView = (row: any) => {
		console.log("View group:", row);
		// TODO: Navigate to group details page
	};

	const handleEdit = (row: any) => {
		console.log("Edit group:", row);
		// TODO: Navigate to group edit page
	};

	const handleViewParticipants = (row: any) => {
		console.log("View participants:", row);
		// TODO: Navigate to group participants page or show modal
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Groups</CardTitle>
					{stats && (
						<div className="flex gap-4 text-sm text-muted-foreground">
							<span>{stats.totalGroups} groups</span>
							<span>{stats.totalParticipants} participants</span>
							{stats.totalMembers > 0 && (
								<span>{stats.totalMembers} members</span>
							)}
							{stats.totalFarmers > 0 && (
								<span>{stats.totalFarmers} farmers</span>
							)}
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<DataTable
					data={groups || []}
					columns={groupColumns}
					sort={sort}
					onSortChange={setSort}
					onView={handleView}
					onEdit={handleEdit}
					onViewParticipants={handleViewParticipants}
					isLoading={isLoading}
					isFetching={isFetching}
				/>
			</CardContent>
		</Card>
	);
}
