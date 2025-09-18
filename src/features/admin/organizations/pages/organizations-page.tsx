"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  ORGANIZATION_KYC_STATUS,
  ORGANIZATION_LICENSE_STATUS,
  ORGANIZATION_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  ORGANIZATION_TYPE,
} from "@/config/constants/auth";
import { OrganizationPageTitle } from "@/features/admin/organizations/components/organization-page-title";
import {
  OrganizationTable,
  type OrganizationTableRow,
  type OrganizationTableSortState,
} from "@/features/admin/organizations/components/organization-table";
import { api } from "@/trpc/react";

const ROW_OPTION_SMALL = 10;
const ROW_OPTION_MEDIUM = 20;
const ROW_OPTION_LARGE = 50;
const ROW_OPTIONS = [
  ROW_OPTION_SMALL,
  ROW_OPTION_MEDIUM,
  ROW_OPTION_LARGE,
] as const;

type FilterOption = {
  label: string;
  value: string;
};

type DateRange = {
  from: string | null;
  to: string | null;
};

type FilterCollections = Array<{
  key: string;
  values: string[];
  setter: Dispatch<SetStateAction<string[]>>;
}>;

const STATUS_OPTIONS: FilterOption[] = Object.values(ORGANIZATION_STATUS).map(
  (value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })
);

const TYPE_OPTIONS: FilterOption[] = Object.values(ORGANIZATION_TYPE).map(
  (value) => ({
    value,
    label: value.replace(/_/g, " "),
  })
);

const KYC_OPTIONS: FilterOption[] = Object.values(ORGANIZATION_KYC_STATUS).map(
  (value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })
);

const LICENSE_OPTIONS: FilterOption[] = Object.values(
  ORGANIZATION_LICENSE_STATUS
).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const SUBSCRIPTION_OPTIONS: FilterOption[] = Object.values(
  ORGANIZATION_SUBSCRIPTION_TYPE
).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const formatFilterLabel = (prefix: string, value: string) =>
  `${prefix}: ${value.replace(/_/g, " ")}`;

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function useOrganizationFilters(onFiltersChanged: () => void) {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [kycFilters, setKycFilters] = useState<string[]>([]);
  const [licenseFilters, setLicenseFilters] = useState<string[]>([]);
  const [subscriptionFilters, setSubscriptionFilters] = useState<string[]>([]);
  const [regionFilters, setRegionFilters] = useState<string[]>([]);
  const [districtFilters, setDistrictFilters] = useState<string[]>([]);
  const [createdRange, setCreatedRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const filterCollections: FilterCollections = [
    { key: "Status", values: statusFilters, setter: setStatusFilters },
    { key: "Type", values: typeFilters, setter: setTypeFilters },
    { key: "KYC", values: kycFilters, setter: setKycFilters },
    { key: "License", values: licenseFilters, setter: setLicenseFilters },
    {
      key: "Plan",
      values: subscriptionFilters,
      setter: setSubscriptionFilters,
    },
    { key: "Region", values: regionFilters, setter: setRegionFilters },
    { key: "District", values: districtFilters, setter: setDistrictFilters },
  ];

  const buildToggle =
    (setter: Dispatch<SetStateAction<string[]>>) => (value: string) => {
      setter((previous) => {
        const exists = previous.includes(value);
        const next = exists
          ? previous.filter((entry) => entry !== value)
          : [...previous, value];
        onFiltersChanged();
        return next;
      });
    };

  const toggleStatus = buildToggle(setStatusFilters);
  const toggleType = buildToggle(setTypeFilters);
  const toggleKyc = buildToggle(setKycFilters);
  const toggleLicense = buildToggle(setLicenseFilters);
  const toggleSubscription = buildToggle(setSubscriptionFilters);
  const toggleRegion = buildToggle(setRegionFilters);
  const toggleDistrict = buildToggle(setDistrictFilters);

  const updateCreatedRange = (next: DateRange) => {
    setCreatedRange(next);
    onFiltersChanged();
  };

  const resetFilters = () => {
    for (const collection of filterCollections) {
      collection.setter([]);
    }
    setCreatedRange({ from: null, to: null });
    onFiltersChanged();
  };

  const removeFilterChip = (key: string) => {
    for (const collection of filterCollections) {
      if (collection.values.includes(key)) {
        collection.setter((previous) =>
          previous.filter((value) => value !== key)
        );
        onFiltersChanged();
        return;
      }
    }

    if (key.startsWith("created-from-")) {
      setCreatedRange((range) => ({ ...range, from: null }));
      onFiltersChanged();
      return;
    }

    if (key.startsWith("created-to-")) {
      setCreatedRange((range) => ({ ...range, to: null }));
      onFiltersChanged();
    }
  };

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = [];

    const keyedFilters: Array<[string, string[]]> = [
      ["Status", statusFilters],
      ["Type", typeFilters],
      ["KYC", kycFilters],
      ["License", licenseFilters],
      ["Plan", subscriptionFilters],
      ["Region", regionFilters],
      ["District", districtFilters],
    ];

    for (const [label, values] of keyedFilters) {
      for (const value of values) {
        chips.push({ key: value, label: formatFilterLabel(label, value) });
      }
    }

    if (createdRange.from) {
      chips.push({
        key: `created-from-${createdRange.from}`,
        label: `Created ≥ ${createdRange.from}`,
      });
    }

    if (createdRange.to) {
      chips.push({
        key: `created-to-${createdRange.to}`,
        label: `Created ≤ ${createdRange.to}`,
      });
    }

    return chips;
  }, [
    createdRange.from,
    createdRange.to,
    districtFilters,
    kycFilters,
    licenseFilters,
    regionFilters,
    statusFilters,
    subscriptionFilters,
    typeFilters,
  ]);

  return {
    statusFilters,
    typeFilters,
    kycFilters,
    licenseFilters,
    subscriptionFilters,
    regionFilters,
    districtFilters,
    createdRange,
    toggleStatus,
    toggleType,
    toggleKyc,
    toggleLicense,
    toggleSubscription,
    toggleRegion,
    toggleDistrict,
    updateCreatedRange,
    resetFilters,
    removeFilterChip,
    activeFilterChips,
  } as const;
}

type SelectionToolbarProps = {
  count: number;
  isBusy: boolean;
  onApprove: () => void;
  onDelete: () => void;
};

const SelectionToolbar = ({
  count,
  isBusy,
  onApprove,
  onDelete,
}: SelectionToolbarProps) => (
  <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <span className="font-medium text-foreground text-sm">
      {count} organization{count === 1 ? "" : "s"} selected
    </span>
    <div className="flex items-center gap-2">
      <Button disabled={isBusy} onClick={onApprove} size="sm" variant="default">
        Approve
      </Button>
      <Button
        disabled={isBusy}
        onClick={onDelete}
        size="sm"
        variant="destructive"
      >
        Delete
      </Button>
    </div>
  </div>
);

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

const FilterSheet = ({
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
}: FilterSheetProps) => (
  <Sheet onOpenChange={onOpenChange} open={open}>
    <SheetTrigger asChild>
      <Button variant="outline">
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
          options={STATUS_OPTIONS}
          values={statusFilters}
        />
        <FilterCheckboxGroup
          label="Organization type"
          onToggle={onToggleType}
          options={TYPE_OPTIONS}
          values={typeFilters}
        />
        <FilterCheckboxGroup
          label="KYC state"
          onToggle={onToggleKyc}
          options={KYC_OPTIONS}
          values={kycFilters}
        />
        <FilterCheckboxGroup
          label="License status"
          onToggle={onToggleLicense}
          options={LICENSE_OPTIONS}
          values={licenseFilters}
        />
        <FilterCheckboxGroup
          label="Subscription plan"
          onToggle={onToggleSubscription}
          options={SUBSCRIPTION_OPTIONS}
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
          <p className="font-medium text-foreground text-sm">Created between</p>
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

type FilterCheckboxGroupProps = {
  label: string;
  options: FilterOption[];
  values: string[];
  onToggle: (value: string) => void;
};

const FilterCheckboxGroup = ({
  label,
  options,
  values,
  onToggle,
}: FilterCheckboxGroupProps) => (
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

type DateFieldProps = {
  id: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
};

const DateField = ({ id, label, value, onChange }: DateFieldProps) => (
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

type FilterChipsProps = {
  chips: Array<{ key: string; label: string }>;
  onRemove: (key: string) => void;
  onReset: () => void;
};

const FilterChips = ({ chips, onRemove, onReset }: FilterChipsProps) => {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary">
          <span className="mr-2 text-muted-foreground text-xs uppercase">
            {chip.label}
          </span>
          <button
            aria-label={`Remove ${chip.label}`}
            className="rounded-full bg-background/60 px-1 font-semibold text-[10px]"
            onClick={() => onRemove(chip.key)}
            type="button"
          >
            ✕
          </button>
        </Badge>
      ))}
      <Button onClick={onReset} size="sm" variant="ghost">
        Clear all
      </Button>
    </div>
  );
};

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

const PaginationControls = ({
  page,
  totalPages,
  isLoading,
  onPageChange,
}: PaginationControlsProps) => (
  <div className="flex items-center gap-2">
    <Button
      disabled={page <= 1 || isLoading}
      onClick={() => onPageChange(page - 1)}
      size="sm"
      variant="outline"
    >
      Previous
    </Button>
    <span className="text-muted-foreground text-sm">
      Page {page} of {totalPages}
    </span>
    <Button
      disabled={page >= totalPages || isLoading}
      onClick={() => onPageChange(page + 1)}
      size="sm"
      variant="outline"
    >
      Next
    </Button>
  </div>
);

function useOrganizationListController() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof ROW_OPTIONS)[number]>(ROW_OPTION_MEDIUM);
  const [sort, setSort] = useState<OrganizationTableSortState>({
    field: "createdAt",
    direction: "desc",
  });
  const filters = useOrganizationFilters(() => setPage(1));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const districtsQuery = api.districts.list.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const regions = useMemo(() => {
    if (!districtsQuery.data?.regions) {
      return [] as Array<{
        value: string;
        label: string;
        districts: FilterOption[];
      }>;
    }

    return districtsQuery.data.regions.map((region) => ({
      value: region.code,
      label: region.name,
      districts: region.districts.map((district) => ({
        value: district.id,
        label: district.name,
      })),
    }));
  }, [districtsQuery.data?.regions]);

  const listQuery = api.organizations.list.useQuery({
    page,
    pageSize,
    search: debouncedSearch.trim() || undefined,
    status: filters.statusFilters.length ? filters.statusFilters : undefined,
    kycStatus: filters.kycFilters.length ? filters.kycFilters : undefined,
    types: filters.typeFilters.length ? filters.typeFilters : undefined,
    licenseStatuses: filters.licenseFilters.length
      ? filters.licenseFilters
      : undefined,
    subscriptionTypes: filters.subscriptionFilters.length
      ? filters.subscriptionFilters
      : undefined,
    regionIds: filters.regionFilters.length ? filters.regionFilters : undefined,
    districtIds: filters.districtFilters.length
      ? filters.districtFilters
      : undefined,
    createdFrom: filters.createdRange.from || undefined,
    createdTo: filters.createdRange.to || undefined,
    sortField: sort.field as "name" | "status" | "kycStatus" | "createdAt",
    sortDirection: sort.direction,
  });

  const utils = api.useUtils();

  const approveMutation = api.organizations.approve.useMutation({
    onSuccess: async () => {
      await utils.organizations.list.invalidate();
      toast.success("Organization approval saved");
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error("Unable to approve organization(s) right now");
    },
  });

  const deleteMutation = api.organizations.delete.useMutation({
    onSuccess: async () => {
      await utils.organizations.list.invalidate();
      toast.success("Organization removed");
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error("Unable to delete organization(s) right now");
    },
  });

  const data = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSortChange = (nextSort: OrganizationTableSortState) => {
    setSort(nextSort);
    setPage(1);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(data.map((row) => row.id)));
  };

  const handleApproveSingle = (row: OrganizationTableRow) => {
    if (row.status === ORGANIZATION_STATUS.ACTIVE) {
      toast.info(`"${row.name}" is already active`);
      return;
    }
    approveMutation.mutate({ organizationIds: [row.id] });
  };

  const handleRejectSingle = (_row: OrganizationTableRow) => {
    // TODO: Implement reject mutation
    toast.info("Reject functionality not yet implemented");
  };

  const handleSuspendSingle = (_row: OrganizationTableRow) => {
    // TODO: Implement suspend mutation
    toast.info("Suspend functionality not yet implemented");
  };

  const handleDeleteSingle = (row: OrganizationTableRow) => {
    setSelectedIds(new Set([row.id]));
    setConfirmAction("delete");
  };

  const handleView = (row: OrganizationTableRow) => {
    router.push(`/admin/organizations/${encodeURIComponent(row.id)}`);
  };

  const handleBulkAction = async () => {
    if (!confirmAction) {
      return;
    }
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      return;
    }
    if (confirmAction === "approve") {
      await approveMutation.mutateAsync({ organizationIds: ids });
    } else {
      await deleteMutation.mutateAsync({ organizationIds: ids });
    }
  };

  const isBusy = approveMutation.isPending || deleteMutation.isPending;
  const startRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, total);

  return {
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    filters,
    selectedIds,
    confirmAction,
    setConfirmAction,
    data,
    total,
    totalPages,
    listQuery,
    handleSortChange,
    handleSelectRow,
    handleSelectAll,
    handleApproveSingle,
    handleRejectSingle,
    handleSuspendSingle,
    handleDeleteSingle,
    handleView,
    handleBulkAction,
    isBusy,
    startRow,
    endRow,
    regions,
  } as const;
}

export function OrganizationsPage() {
  const controller = useOrganizationListController();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    filters,
    selectedIds,
    confirmAction,
    setConfirmAction,
    data,
    total,
    totalPages,
    listQuery,
    handleSortChange,
    handleSelectRow,
    handleSelectAll,
    handleApproveSingle,
    handleRejectSingle,
    handleSuspendSingle,
    handleDeleteSingle,
    handleView,
    handleBulkAction,
    isBusy,
    startRow,
    endRow,
    regions,
  } = controller;

  return (
    <OrganizationPageTitle
      action={{ label: "New organization", href: "/admin/organizations/new" }}
      description="Review onboarding progress, lifecycle states, and licensing across every organization."
      title="Organizations"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Input
                  aria-label="Search organizations"
                  className="w-full"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, slug, or contact"
                  type="search"
                  value={search}
                />
              </div>
              <div className="flex-shrink-0">
                <FilterSheet
                  createdRange={filters.createdRange}
                  districtFilters={filters.districtFilters}
                  kycFilters={filters.kycFilters}
                  licenseFilters={filters.licenseFilters}
                  onChangeCreatedRange={filters.updateCreatedRange}
                  onOpenChange={setFiltersOpen}
                  onReset={() => {
                    filters.resetFilters();
                    setFiltersOpen(false);
                  }}
                  onToggleDistrict={filters.toggleDistrict}
                  onToggleKyc={filters.toggleKyc}
                  onToggleLicense={filters.toggleLicense}
                  onToggleRegion={filters.toggleRegion}
                  onToggleStatus={filters.toggleStatus}
                  onToggleSubscription={filters.toggleSubscription}
                  onToggleType={filters.toggleType}
                  open={filtersOpen}
                  regionFilters={filters.regionFilters}
                  regions={regions}
                  statusFilters={filters.statusFilters}
                  subscriptionFilters={filters.subscriptionFilters}
                  typeFilters={filters.typeFilters}
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                {total} total
              </span>
            </div>
          </div>
          <FilterChips
            chips={filters.activeFilterChips}
            onRemove={filters.removeFilterChip}
            onReset={filters.resetFilters}
          />
        </div>

        {selectedIds.size > 0 && (
          <SelectionToolbar
            count={selectedIds.size}
            isBusy={isBusy}
            onApprove={() => setConfirmAction("approve")}
            onDelete={() => setConfirmAction("delete")}
          />
        )}

        <OrganizationTable
          data={data}
          isFetching={listQuery.isFetching}
          isLoading={listQuery.isLoading}
          onApprove={handleApproveSingle}
          onDelete={handleDeleteSingle}
          onReject={handleRejectSingle}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onSortChange={handleSortChange}
          onSuspend={handleSuspendSingle}
          onView={handleView}
          selectedIds={selectedIds}
          sort={sort}
        />

        <div className="flex flex-col gap-3 border-border border-t pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
            <span>
              Showing {startRow}–{endRow} of {total}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide">Rows</span>
              <div className="flex items-center gap-1">
                {ROW_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    onClick={() => {
                      setPageSize(option);
                      setPage(1);
                    }}
                    size="sm"
                    variant={option === pageSize ? "secondary" : "ghost"}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <PaginationControls
            isLoading={listQuery.isFetching}
            onPageChange={(nextPage) =>
              setPage(Math.max(1, Math.min(totalPages, nextPage)))
            }
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
          }
        }}
        open={confirmAction !== null}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve"
                ? "Approve selected organizations"
                : "Delete selected organizations"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "approve"
                ? "Approving will activate these organizations and notify their owners."
                : "Deleting removes the organizations and all membership records."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isBusy}
              onClick={() => setConfirmAction(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isBusy}
              onClick={async () => {
                await handleBulkAction();
                setConfirmAction(null);
              }}
              variant={confirmAction === "delete" ? "destructive" : "default"}
            >
              {confirmAction === "delete" ? "Delete" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrganizationPageTitle>
  );
}

export default OrganizationsPage;
