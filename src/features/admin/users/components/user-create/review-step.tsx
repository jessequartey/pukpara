"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUserCreateStore } from "@/features/admin/users/store/user-create-store";

type ReviewStepProps = {
	onBack: () => void;
	onSubmit: () => void;
	isSubmitting: boolean;
};

export const ReviewStep = ({
	onBack,
	onSubmit,
	isSubmitting,
}: ReviewStepProps) => {
	const mode = useUserCreateStore((state) => state.mode);
	const user = useUserCreateStore((state) => state.user);
	const existingOrganization = useUserCreateStore(
		(state) => state.existingOrganization,
	);
	const newOrganization = useUserCreateStore((state) => state.newOrganization);

	const fullName = `${user.firstName} ${user.lastName}`.trim();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Review & create</CardTitle>
				<CardDescription>
					Review the details below and click create to finalize the user account
					{mode === "existing-organization"
						? " and add them to the organization"
						: " and organization"}
					.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* User Details */}
				<div>
					<h3 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wide">
						User Details
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="text-muted-foreground text-sm">Full name</p>
							<p className="font-medium">{fullName}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-sm">Email</p>
							<p className="font-medium">{user.email}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-sm">Phone number</p>
							<p className="font-medium">{user.phoneNumber}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-sm">District ID</p>
							<p className="font-medium">{user.districtId}</p>
						</div>
						<div className="sm:col-span-2">
							<p className="text-muted-foreground text-sm">Address</p>
							<p className="font-medium">{user.address}</p>
						</div>
					</div>
				</div>

				<Separator />

				{/* Organization Details */}
				<div>
					<h3 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wide">
						Organization Details
					</h3>

					{mode === "existing-organization" && existingOrganization && (
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<p className="text-muted-foreground text-sm">
									Organization name
								</p>
								<p className="font-medium">{existingOrganization.name}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									Organization slug
								</p>
								<p className="font-medium">@{existingOrganization.slug}</p>
							</div>
							<div className="sm:col-span-2">
								<p className="text-muted-foreground text-sm">Action</p>
								<p className="font-medium">
									User will be added to this existing organization
								</p>
							</div>
						</div>
					)}

					{mode === "new-organization" && (
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<p className="text-muted-foreground text-sm">
									Organization name
								</p>
								<p className="font-medium">{newOrganization.name}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									Organization slug
								</p>
								<p className="font-medium">@{newOrganization.slug}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									Organization type
								</p>
								<p className="font-medium capitalize">
									{newOrganization.organizationType.replace(/_/g, " ")}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									Subscription type
								</p>
								<p className="font-medium capitalize">
									{newOrganization.subscriptionType.replace(/_/g, " ")}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Contact email</p>
								<p className="font-medium">{newOrganization.contactEmail}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Contact phone</p>
								<p className="font-medium">{newOrganization.contactPhone}</p>
							</div>
							<div className="sm:col-span-2">
								<p className="text-muted-foreground text-sm">Address</p>
								<p className="font-medium">{newOrganization.address}</p>
							</div>
							{newOrganization.notes && (
								<div className="sm:col-span-2">
									<p className="text-muted-foreground text-sm">Notes</p>
									<p className="font-medium">{newOrganization.notes}</p>
								</div>
							)}
							<div className="sm:col-span-2">
								<p className="text-muted-foreground text-sm">Action</p>
								<p className="font-medium">
									New organization will be created and user will become the
									owner
								</p>
							</div>
						</div>
					)}
				</div>

				<Separator />

				{/* Next Steps */}
				<div>
					<h3 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wide">
						What Happens Next
					</h3>
					<ul className="space-y-2 text-sm">
						<li className="flex gap-2">
							<span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
							<span>
								User account will be created with a temporary password
							</span>
						</li>
						<li className="flex gap-2">
							<span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
							<span>Password reset email will be sent to {user.email}</span>
						</li>
						{mode === "existing-organization" ? (
							<li className="flex gap-2">
								<span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
								<span>
									User will be added to "{existingOrganization?.name}" as a
									member
								</span>
							</li>
						) : (
							<>
								<li className="flex gap-2">
									<span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>
										New organization "{newOrganization.name}" will be created
									</span>
								</li>
								<li className="flex gap-2">
									<span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
									<span>User will become the organization owner</span>
								</li>
							</>
						)}
						<li className="flex gap-2">
							<span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
							<span>
								User can start using the platform immediately after setting
								their password
							</span>
						</li>
					</ul>
				</div>

				<div className="flex flex-col gap-3 pt-4 md:flex-row md:justify-between">
					<Button onClick={onBack} type="button" variant="ghost">
						Back
					</Button>
					<Button
						disabled={isSubmitting}
						onClick={onSubmit}
						size="lg"
						type="button"
					>
						{isSubmitting ? "Creating..." : "Create User"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
