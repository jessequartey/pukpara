"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { memberColumns } from "./member-table/columns";
import { DataTable, type SortState } from "./member-table/data-table";

export function MembersDirectoryCard() {
	const [sort, setSort] = useState<SortState>({
		field: "joinedAt",
		direction: "desc",
	});

	const {
		data: members,
		isLoading,
		isFetching,
	} = api.organization.members.list.useQuery();
	const { data: stats } = api.organization.members.stats.useQuery();

	const handleView = (row: any) => {
		console.log("View member:", row);
		// TODO: Navigate to member details page
	};

	const handleRemove = (row: any) => {
		console.log("Remove member:", row);
		// TODO: Show confirmation modal and remove member
	};

	const handleChangeRole = (row: any) => {
		console.log("Change role:", row);
		// TODO: Show role change modal
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Organization Members</CardTitle>
					{stats && (
						<div className="flex gap-4 text-sm text-muted-foreground">
							<span>{stats.totalMembers} total</span>
							<span>{stats.activeMembers} active</span>
							{stats.pendingMembers > 0 && (
								<span>{stats.pendingMembers} pending</span>
							)}
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<DataTable
					data={members || []}
					columns={memberColumns}
					sort={sort}
					onSortChange={setSort}
					onView={handleView}
					onRemove={handleRemove}
					onChangeRole={handleChangeRole}
					isLoading={isLoading}
					isFetching={isFetching}
				/>
			</CardContent>
		</Card>
	);
}
