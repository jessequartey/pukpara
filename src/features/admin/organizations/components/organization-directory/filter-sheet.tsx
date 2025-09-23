"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

import type {
	DateRange,
	FilterOption,
} from "@/features/admin/organizations/hooks/use-organization-filters";
import {
	KYC_FILTER_OPTIONS,
	LICENSE_FILTER_OPTIONS,
	STATUS_FILTER_OPTIONS,
	SUBSCRIPTION_FILTER_OPTIONS,
	TYPE_FILTER_OPTIONS,
} from "@/features/admin/organizations/hooks/use-organization-filters";

type FilterSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	createdRange: DateRange;
	onChangeCreatedRange: (range: DateRange) => void;
	statusFilters: string[];
	typeFilters: string[];
	kycFilters: string[];
	licenseFilters: string[];
	subscriptionFilters: string[];
	regionFilters: string[];
	districtFilters: string[];
	onToggleStatus: (value: string) => void;
	onToggleType: (value: string) => void;
	onToggleKyc: (value: string) => void;
	onToggleLicense: (value: string) => void;
	onToggleSubscription: (value: string) => void;
	onToggleRegion: (value: string) => void;
	onToggleDistrict: (value: string) => void;
	onReset: () => void;
	regions: Array<{ value: string; label: string; districts: FilterOption[] }>;
};

export function FilterSheet({
	open,
	onOpenChange,
	createdRange,
	onChangeCreatedRange,
	statusFilters,
	typeFilters,
	kycFilters,
	licenseFilters,
	subscriptionFilters,
	regionFilters,
	districtFilters,
	onToggleStatus,
	onToggleType,
	onToggleKyc,
	onToggleLicense,
	onToggleSubscription,
	onToggleRegion,
	onToggleDistrict,
	onReset,
	regions,
}: FilterSheetProps) {
	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetTrigger asChild>
				<Button type="button" variant="outline">
					<SlidersHorizontal className="mr-2 size-4" /> Filters
				</Button>
			</SheetTrigger>
			<SheetContent className="flex flex-col gap-6 overflow-y-auto sm:max-w-xl">
				<SheetHeader>
					<SheetTitle>Filter organizations</SheetTitle>
					<SheetDescription>
						Refine the directory by lifecycle, geography, or subscription state.
					</SheetDescription>
				</SheetHeader>

				<div className="grid gap-6">
					<FilterCheckboxGroup
						label="Status"
						onToggle={onToggleStatus}
						options={STATUS_FILTER_OPTIONS}
						values={statusFilters}
					/>
					<FilterCheckboxGroup
						label="Organization type"
						onToggle={onToggleType}
						options={TYPE_FILTER_OPTIONS}
						values={typeFilters}
					/>
					<FilterCheckboxGroup
						label="KYC state"
						onToggle={onToggleKyc}
						options={KYC_FILTER_OPTIONS}
						values={kycFilters}
					/>
					<FilterCheckboxGroup
						label="License status"
						onToggle={onToggleLicense}
						options={LICENSE_FILTER_OPTIONS}
						values={licenseFilters}
					/>
					<FilterCheckboxGroup
						label="Subscription plan"
						onToggle={onToggleSubscription}
						options={SUBSCRIPTION_FILTER_OPTIONS}
						values={subscriptionFilters}
					/>
					<div className="space-y-3">
						<p className="font-medium text-foreground text-sm">Geography</p>
						<FilterCheckboxGroup
							label="Regions"
							onToggle={onToggleRegion}
							options={regions.map(({ value, label }) => ({ value, label }))}
							values={regionFilters}
						/>
						<FilterCheckboxGroup
							label="Districts"
							onToggle={onToggleDistrict}
							options={regions.flatMap(({ districts }) => districts)}
							values={districtFilters}
						/>
					</div>
					<div className="space-y-3">
						<p className="font-medium text-foreground text-sm">
							Created between
						</p>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<DateField
								id="created-from"
								label="From"
								onChange={(value) =>
									onChangeCreatedRange({ ...createdRange, from: value })
								}
								value={createdRange.from}
							/>
							<DateField
								id="created-to"
								label="To"
								onChange={(value) =>
									onChangeCreatedRange({ ...createdRange, to: value })
								}
								value={createdRange.to}
							/>
						</div>
					</div>
				</div>

				<SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
					<Button onClick={onReset} type="button" variant="ghost">
						Reset filters
					</Button>
					<SheetClose asChild>
						<Button type="button">Apply</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

type FilterCheckboxGroupProps = {
	label: string;
	options: FilterOption[];
	values: string[];
	onToggle: (value: string) => void;
};

function FilterCheckboxGroup({
	label,
	options,
	values,
	onToggle,
}: FilterCheckboxGroupProps) {
	return (
		<div className="space-y-3">
			<p className="font-medium text-foreground text-sm">{label}</p>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{options.map((option) => {
					const fieldId = `${label.replace(/\s+/g, "-").toLowerCase()}-${option.value}`;
					return (
						<label
							className="inline-flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm transition hover:border-border"
							htmlFor={fieldId}
							key={option.value}
						>
							<Checkbox
								checked={values.includes(option.value)}
								id={fieldId}
								onCheckedChange={() => onToggle(option.value)}
							/>
							<span>{option.label}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
}

type DateFieldProps = {
	id: string;
	label: string;
	value: string | null;
	onChange: (value: string | null) => void;
};

function DateField({ id, label, value, onChange }: DateFieldProps) {
	return (
		<div className="space-y-2">
			<label
				className="text-muted-foreground text-xs uppercase tracking-wide"
				htmlFor={id}
			>
				{label}
			</label>
			<Input
				id={id}
				onChange={(event) => onChange(event.target.value || null)}
				type="date"
				value={value ?? ""}
			/>
		</div>
	);
}
