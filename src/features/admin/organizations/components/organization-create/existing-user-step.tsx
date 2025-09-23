"use client";

import { useState } from "react";

import { AsyncSelect } from "@/components/ui/async-select";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useOrganizationCreateStore } from "@/features/admin/organizations/store/organization-create-store";
import { authClient } from "@/lib/auth-client";

type User = {
	id: string;
	email: string | null;
	name: string | null;
	phoneNumber?: string | null;
	status?: string | null;
	districtId?: string | null;
	address?: string | null;
	// Additional properties that may come from UserWithRole
	role?: string | null;
	emailVerified?: boolean;
	image?: string | null;
	createdAt?: Date | string | null;
	banned?: boolean | null;
};

type ExistingUserStepProps = {
	onBack: () => void;
	onNext: () => void;
};

type OrganizationState = ReturnType<
	typeof useOrganizationCreateStore.getState
>["organization"];

export const ExistingUserStep = ({ onBack, onNext }: ExistingUserStepProps) => {
	const selectedUser = useOrganizationCreateStore(
		(state) => state.existingUser,
	);
	const setExistingUser = useOrganizationCreateStore(
		(state) => state.setExistingUser,
	);
	const setOrganizationData = useOrganizationCreateStore(
		(state) => state.setOrganizationData,
	);
	const organization = useOrganizationCreateStore(
		(state) => state.organization,
	);
	const [selectedUserId, setSelectedUserId] = useState(
		selectedUser?.userId || "",
	);

	// User fetcher for AsyncSelect
	const userFetcher = async (query?: string) => {
		try {
			const { data: response, error } = await authClient.admin.listUsers({
				query: {
					searchValue: query || "",
					searchField: "name",
					searchOperator: "contains",
					limit: 100,
					offset: 0,
					sortBy: "name",
					sortDirection: "asc",
				},
			});

			if (error) {
				return [];
			}

			const users = response?.users || [];

			// Update the cached users list when we have no query (preload all users)
			if (!query) {
				setAllUsers(users);
			}

			return users;
		} catch {
			return [];
		}
	};

	// Filter function for local filtering
	const filterFn = (user: User, query: string) => {
		const searchTerm = query.toLowerCase();
		return Boolean(
			user.name?.toLowerCase().includes(searchTerm) ||
				user.email?.toLowerCase().includes(searchTerm) ||
				user.phoneNumber?.toLowerCase().includes(searchTerm),
		);
	};

	// Render option function
	const renderOption = (user: User) => (
		<div className="flex flex-col">
			<span className="font-medium leading-tight">
				{user.name || "Unnamed user"}
			</span>
			<span className="text-muted-foreground text-sm">{user.email}</span>
			{user.phoneNumber && (
				<span className="text-muted-foreground text-xs">
					{user.phoneNumber}
				</span>
			)}
		</div>
	);

	// Get option value function
	const getOptionValue = (user: User) => user.id;

	// Get display value function
	const getDisplayValue = (user: User) => (
		<span>{user.name || "Unnamed user"}</span>
	);

	// Keep track of all users for quick lookup
	const [allUsers, setAllUsers] = useState<User[]>([]);

	const handleUserChange = (userId: string) => {
		setSelectedUserId(userId);

		if (!userId) {
			setExistingUser(null);
			return;
		}

		// Find user from the cached list
		const user = allUsers.find((u) => u.id === userId);
		if (user) {
			setExistingUser({
				userId: user.id,
				name: user.name || "Unnamed user",
				email: user.email || "",
			});
		}
	};

	const handleBack = () => {
		onBack();
	};

	const handleNext = () => {
		if (!selectedUser) {
			return;
		}

		const updates: Partial<OrganizationState> = {};

		if (!organization.contactEmail && selectedUser.email) {
			updates.contactEmail = selectedUser.email;
		}
		if (!organization.billingEmail && selectedUser.email) {
			updates.billingEmail = selectedUser.email;
		}

		if (Object.keys(updates).length > 0) {
			setOrganizationData(updates);
		}
		onNext();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Choose the organization owner</CardTitle>
				<CardDescription>
					Select an existing platform user. They will become the owner and
					receive access to the new workspace immediately.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="user-select">Select user</Label>
					<AsyncSelect<User>
						className="w-full"
						fetcher={userFetcher}
						filterFn={filterFn}
						getDisplayValue={getDisplayValue}
						getOptionValue={getOptionValue}
						label="users"
						noResultsMessage="No users found. Try adjusting your search."
						onChange={handleUserChange}
						placeholder="Search for users..."
						preload={true}
						renderOption={renderOption}
						triggerClassName="w-full"
						value={selectedUserId}
					/>
				</div>
				{selectedUser && (
					<div className="rounded-lg border bg-muted/50 p-3">
						<p className="font-medium text-sm">Selected user:</p>
						<p className="text-foreground">{selectedUser.name}</p>
						<p className="text-muted-foreground text-sm">
							{selectedUser.email}
						</p>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex flex-col gap-3 md:flex-row md:justify-between">
				<Button onClick={handleBack} type="button" variant="ghost">
					Back
				</Button>
				<Button
					disabled={!selectedUser}
					onClick={handleNext}
					size="lg"
					type="button"
				>
					Continue
				</Button>
			</CardFooter>
		</Card>
	);
};
