"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	ORGANIZATION_LICENSE_STATUS,
	ORGANIZATION_SUBSCRIPTION_TYPE,
	ORGANIZATION_TYPE,
} from "@/config/constants/auth";
import { useUserCreateStore } from "@/features/admin/users/store/user-create-store";

const newOrganizationSchema = z.object({
	name: z.string().min(1, "Organization name is required"),
	slug: z.string().min(1, "Organization slug is required"),
	organizationType: z.string().min(1, "Organization type is required"),
	organizationSubType: z.string().optional(),
	contactEmail: z.string().email("Valid email is required"),
	contactPhone: z.string().min(1, "Contact phone is required"),
	address: z.string().min(1, "Address is required"),
	notes: z.string().optional(),
});

type NewOrganizationSchema = z.infer<typeof newOrganizationSchema>;

type NewOrganizationStepProps = {
	onNext: () => void;
	onBack: () => void;
};

export const NewOrganizationStep = ({
	onBack,
	onNext,
}: NewOrganizationStepProps) => {
	const newOrganization = useUserCreateStore((state) => state.newOrganization);
	const setNewOrganizationData = useUserCreateStore(
		(state) => state.setNewOrganizationData,
	);
	const user = useUserCreateStore((state) => state.user);

	const form = useForm<NewOrganizationSchema>({
		resolver: zodResolver(newOrganizationSchema),
		defaultValues: {
			name: newOrganization.name,
			slug: newOrganization.slug,
			organizationType: newOrganization.organizationType,
			organizationSubType: newOrganization.organizationSubType,
			contactEmail: newOrganization.contactEmail || user.email,
			contactPhone: newOrganization.contactPhone || user.phoneNumber,
			address: newOrganization.address || user.address,
			notes: newOrganization.notes,
		},
		mode: "onBlur",
	});

	const handleSubmit = (data: NewOrganizationSchema) => {
		setNewOrganizationData({
			...data,
			subscriptionType: ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM,
			licenseStatus: ORGANIZATION_LICENSE_STATUS.ISSUED,
			maxUsers: 100,
			billingEmail: data.contactEmail,
			districtId: user.districtId,
			regionId: "", // Will be set based on district
			regionName: "", // Will be set based on district
			districtName: "", // Will be set based on district
		});
		onNext();
	};

	const handleBack = () => {
		const values = form.getValues();
		setNewOrganizationData({
			...values,
			subscriptionType: ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM,
			licenseStatus: ORGANIZATION_LICENSE_STATUS.ISSUED,
			maxUsers: 100,
			billingEmail: values.contactEmail,
			districtId: user.districtId,
			regionId: "",
			regionName: "",
			districtName: "",
		});
		onBack();
	};

	// Auto-generate slug from name
	const handleNameChange = (name: string) => {
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
		form.setValue("slug", slug);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Organization details</CardTitle>
				<CardDescription>
					Configure the new organization that will be created for this user.
					They will become the owner with full administrative access.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						className="space-y-6"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<div className="grid gap-6 lg:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Organization name</FormLabel>
										<FormControl>
											<Input
												{...field}
												onChange={(e) => {
													field.onChange(e);
													handleNameChange(e.target.value);
												}}
												placeholder="Enter organization name"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Organization slug</FormLabel>
										<FormControl>
											<Input {...field} placeholder="organization-slug" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="organizationType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Organization type</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={ORGANIZATION_TYPE.FARMER_ORG}>
													Farmer Organization
												</SelectItem>
												<SelectItem value={ORGANIZATION_TYPE.SUPPLIER}>
													Supplier
												</SelectItem>
												<SelectItem value={ORGANIZATION_TYPE.FINANCIAL}>
													Financial
												</SelectItem>
												<SelectItem value={ORGANIZATION_TYPE.BUYER}>
													Buyer
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="organizationSubType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sub-type (optional)</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="e.g., Processing, Trading"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="contactEmail"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact email</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="contact@org.com"
												type="email"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="contactPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact phone</FormLabel>
										<FormControl>
											<Input {...field} placeholder="+233 XX XXX XXXX" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Enter organization address"
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes (optional)</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Additional notes about the organization"
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
		</Card>
	);
};
