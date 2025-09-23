"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useUserCreateStore } from "@/features/admin/users/store/user-create-store";
import { api } from "@/trpc/react";

const PHONE_MIN_LENGTH = 6;
const ADDRESS_MIN_LENGTH = 5;

const userSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Enter a valid email"),
	phoneNumber: z.string().min(PHONE_MIN_LENGTH, "Phone number is required"),
	districtId: z.string().min(1, "Select a district"),
	address: z.string().min(ADDRESS_MIN_LENGTH, "Address is required"),
});

type UserSchema = z.infer<typeof userSchema>;

type DistrictOption = {
	id: string;
	name: string;
	regionName: string;
	regionCode: string;
};

type UserDetailsStepProps = {
	onNext: () => void;
	onBack: () => void;
};

export const UserDetailsStep = ({ onBack, onNext }: UserDetailsStepProps) => {
	const setUserData = useUserCreateStore((state) => state.setUserData);
	const storedUser = useUserCreateStore((state) => state.user);
	const mode = useUserCreateStore((state) => state.mode);
	const setNewOrganizationData = useUserCreateStore(
		(state) => state.setNewOrganizationData,
	);
	const newOrganization = useUserCreateStore((state) => state.newOrganization);

	const {
		data: districtData,
		isLoading: districtsLoading,
		isError: districtsError,
	} = api.districts.list.useQuery(undefined, {
		staleTime: Number.POSITIVE_INFINITY,
	});

	const regions = useMemo(() => districtData?.regions ?? [], [districtData]);

	const districtIndex = useMemo(() => {
		const map = new Map<string, DistrictOption>();

		for (const regionEntry of regions) {
			for (const districtEntry of regionEntry.districts) {
				map.set(districtEntry.id, {
					id: districtEntry.id,
					name: districtEntry.name,
					regionName: regionEntry.name,
					regionCode: regionEntry.code,
				});
			}
		}

		return map;
	}, [regions]);

	const districtOptionsList = useMemo(
		() => Array.from(districtIndex.values()),
		[districtIndex],
	);

	const fetchDistrictOptions = useCallback(
		(query?: string) => {
			if (districtsLoading) {
				return Promise.resolve([] as DistrictOption[]);
			}

			if (!query) {
				return Promise.resolve(districtOptionsList);
			}

			const normalized = query.trim().toLowerCase();
			return Promise.resolve(
				districtOptionsList.filter((option) =>
					`${option.name} ${option.regionName}`
						.toLowerCase()
						.includes(normalized),
				),
			);
		},
		[districtOptionsList, districtsLoading],
	);

	const form = useForm<UserSchema>({
		resolver: zodResolver(userSchema),
		defaultValues: storedUser,
		mode: "onBlur",
	});

	useEffect(() => {
		form.reset(storedUser);
	}, [form, storedUser]);

	const updateNewOrganizationFromUserData = useCallback(
		(values: UserSchema, selectedDistrict: DistrictOption | null) => {
			if (mode !== "new-organization") {
				return;
			}

			const updates: Partial<typeof newOrganization> = {};

			// Update contact information if not already set
			if (!newOrganization.contactEmail && values.email) {
				updates.contactEmail = values.email;
				updates.billingEmail = values.email;
			}
			if (!newOrganization.contactPhone && values.phoneNumber) {
				updates.contactPhone = values.phoneNumber;
			}
			if (!newOrganization.address && values.address) {
				updates.address = values.address;
			}

			// Update district information if not already set
			if (!newOrganization.districtId && selectedDistrict) {
				updates.districtId = selectedDistrict.id;
				updates.districtName = selectedDistrict.name;
				updates.regionId = selectedDistrict.regionCode;
				updates.regionName = selectedDistrict.regionName;
			}

			if (Object.keys(updates).length > 0) {
				setNewOrganizationData(updates);
			}
		},
		[mode, newOrganization, setNewOrganizationData],
	);

	const handleSubmit = (data: UserSchema) => {
		const selectedDistrict = districtIndex.get(data.districtId);

		if (!selectedDistrict) {
			toast.error("Select a valid district before continuing");
			return;
		}

		setUserData(data);
		updateNewOrganizationFromUserData(data, selectedDistrict);
		onNext();
	};

	const handleBack = () => {
		const values = form.getValues();
		setUserData(values);

		const selectedDistrict = values.districtId
			? (districtIndex.get(values.districtId) ?? null)
			: null;

		updateNewOrganizationFromUserData(values, selectedDistrict);
		onBack();
	};

	const getCardTitle = () => {
		switch (mode) {
			case "existing-organization":
				return "User details";
			case "new-organization":
				return "Organization owner details";
			default:
				return "User details";
		}
	};

	const getCardDescription = () => {
		switch (mode) {
			case "existing-organization":
				return "Enter the details for the new user. They will receive an email invitation to join the selected organization.";
			case "new-organization":
				return "Enter the details for the organization owner. They will receive an email invitation to set their password and access their new workspace.";
			default:
				return "Enter the user details to continue.";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{getCardTitle()}</CardTitle>
				<CardDescription>{getCardDescription()}</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						className="grid gap-6"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First name</FormLabel>
										<FormControl>
											<Input
												autoComplete="given-name"
												placeholder="Ama"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last name</FormLabel>
										<FormControl>
											<Input
												autoComplete="family-name"
												placeholder="Mensah"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											autoComplete="email"
											inputMode="email"
											placeholder="user@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="phoneNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone number</FormLabel>
									<FormControl>
										<PhoneInput
											defaultCountry="GH"
											placeholder="024 123 4567"
											{...field}
											onChange={(value) => field.onChange(value ?? "")}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="districtId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>District</FormLabel>
									<FormControl>
										<AsyncSelect<DistrictOption>
											disabled={
												districtsLoading || districtOptionsList.length === 0
											}
											fetcher={fetchDistrictOptions}
											getDisplayValue={(option) =>
												`${option.name} • ${option.regionName}`
											}
											getOptionValue={(option) => option.id}
											label="District"
											onChange={(nextValue) => {
												field.onChange(nextValue);
												setUserData({
													districtId: nextValue,
												});

												if (!nextValue) {
													return;
												}

												const option = districtIndex.get(nextValue);
												if (!option) {
													return;
												}

												// Update new organization data if in new-organization mode
												if (
													mode === "new-organization" &&
													!newOrganization.districtId
												) {
													setNewOrganizationData({
														districtId: option.id,
														districtName: option.name,
														regionId: option.regionCode,
														regionName: option.regionName,
													});
												}
											}}
											placeholder={
												districtsLoading
													? "Loading districts…"
													: "Search district"
											}
											renderOption={(option) => (
												<div className="flex flex-col">
													<span className="font-medium">{option.name}</span>
													<span className="text-muted-foreground text-xs">
														{option.regionName}
													</span>
												</div>
											)}
											triggerClassName="w-full justify-between"
											value={field.value}
											width="var(--radix-popover-trigger-width)"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input
											autoComplete="street-address"
											placeholder="12 Market Street, Accra"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{districtsError ? (
							<p className="text-destructive text-sm">
								Unable to load districts right now. Try refreshing the page.
							</p>
						) : null}
						<div className="flex flex-col gap-3 md:flex-row md:justify-between">
							<Button onClick={handleBack} type="button" variant="ghost">
								Back
							</Button>
							<Button
								disabled={form.formState.isSubmitting}
								size="lg"
								type="submit"
							>
								Continue
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="text-muted-foreground text-xs">
				The user will receive an email invitation to set their password and
				activate their account.
			</CardFooter>
		</Card>
	);
};
