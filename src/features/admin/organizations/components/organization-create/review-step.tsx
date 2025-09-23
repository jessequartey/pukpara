"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrganizationCreationMode } from "@/features/admin/organizations/store/organization-create-store";
import { useOrganizationCreateStore } from "@/features/admin/organizations/store/organization-create-store";

const modeLabelMap: Record<OrganizationCreationMode, string> = {
	"new-user": "Create new user & workspace",
	"existing-user": "Attach to existing user",
};

type ReviewStepProps = {
	onBack: () => void;
	onSubmit: () => void;
	isSubmitting: boolean;
};

type SummaryRow = {
	label: string;
	value: string | number | null | undefined;
	span?: boolean;
};

const formatLabel = (label: string) => label.replace(/_/g, " ").toLowerCase();

const SummaryRows = ({ rows }: { rows: SummaryRow[] }) => (
	<dl className="grid gap-2 text-sm md:grid-cols-2">
		{rows.map(({ label, value, span }) => (
			<div className={span ? "md:col-span-2" : undefined} key={label}>
				<dt className="text-muted-foreground">{label}</dt>
				<dd className="font-medium">
					{value === null || value === undefined || value === "" ? "—" : value}
				</dd>
			</div>
		))}
	</dl>
);

export const ReviewStep = ({
	isSubmitting,
	onBack,
	onSubmit,
}: ReviewStepProps) => {
	const mode = useOrganizationCreateStore((state) => state.mode);
	const newUser = useOrganizationCreateStore((state) => state.newUser);
	const existingUser = useOrganizationCreateStore(
		(state) => state.existingUser,
	);
	const organization = useOrganizationCreateStore(
		(state) => state.organization,
	);

	if (!mode) {
		return null;
	}

	const ownerContactEmail =
		mode === "new-user" ? newUser.email : (existingUser?.email ?? "");
	const ownerContactPhone = mode === "new-user" ? newUser.phoneNumber : "";
	const organizationContactEmail =
		organization.contactEmail || ownerContactEmail;
	const organizationContactPhone =
		organization.contactPhone || ownerContactPhone;
	const organizationRegionDisplay =
		organization.regionName || organization.regionId;
	const organizationDistrictDisplay =
		organization.districtName || organization.districtId;

	const ownerRows: SummaryRow[] =
		mode === "new-user"
			? [
					{
						label: "Full name",
						value: `${newUser.firstName} ${newUser.lastName}`.trim(),
					},
					{ label: "Email", value: newUser.email },
					{ label: "Phone number", value: newUser.phoneNumber },
					{
						label: "District",
						value: organization.districtName || newUser.districtId,
					},
					{ label: "Address", value: newUser.address, span: true },
				]
			: [
					{ label: "Name", value: existingUser?.name },
					{ label: "Email", value: existingUser?.email },
				];

	const organizationRows: SummaryRow[] = [
		{ label: "Name", value: organization.name },
		{ label: "Slug", value: organization.slug },
		{
			label: "Type",
			value: formatLabel(organization.organizationType),
		},
		{ label: "Contact email", value: organizationContactEmail },
		{
			label: "Billing email",
			value: organization.billingEmail || organizationContactEmail,
		},
		{ label: "Contact phone", value: organizationContactPhone },
		{ label: "Region", value: organizationRegionDisplay },
		{ label: "District", value: organizationDistrictDisplay },
		{ label: "Address", value: organization.address, span: true },
		{ label: "Internal notes", value: organization.notes, span: true },
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Review & confirm</CardTitle>
				<CardDescription>
					Double-check the owner account and organization settings before
					provisioning. You can fine-tune details after creation.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<section className="space-y-3">
					<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
						Creation mode
					</h3>
					<p>{modeLabelMap[mode]}</p>
				</section>
				<Separator />
				<section className="space-y-3">
					<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
						Owner account
					</h3>
					<SummaryRows rows={ownerRows} />
				</section>
				<Separator />
				<section className="space-y-3">
					<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
						Organization configuration
					</h3>
					<SummaryRows rows={organizationRows} />
				</section>
			</CardContent>
			<CardFooter className="flex flex-col gap-3 md:flex-row md:justify-between">
				<Button onClick={onBack} type="button" variant="ghost">
					Back
				</Button>
				<Button
					disabled={isSubmitting}
					onClick={onSubmit}
					size="lg"
					type="button"
				>
					{isSubmitting ? "Creating organization..." : "Create organization"}
				</Button>
			</CardFooter>
		</Card>
	);
};
