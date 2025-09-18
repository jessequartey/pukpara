"use client";

import { type Dispatch, type SetStateAction, useMemo, useState } from "react";

import {
  ORGANIZATION_KYC_STATUS,
  ORGANIZATION_LICENSE_STATUS,
  ORGANIZATION_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  ORGANIZATION_TYPE,
} from "@/config/constants/auth";

export type FilterOption = {
  label: string;
  value: string;
};

export type DateRange = {
  from: string | null;
  to: string | null;
};

type FilterCollections = Array<{
  key: string;
  values: string[];
  setter: Dispatch<SetStateAction<string[]>>;
}>;

const toStartCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const toLabel = (value: string) => value.replace(/_/g, " ");

export const STATUS_FILTER_OPTIONS: FilterOption[] = Object.values(
  ORGANIZATION_STATUS
).map((value) => ({
  value,
  label: toStartCase(value),
}));

export const TYPE_FILTER_OPTIONS: FilterOption[] = Object.values(
  ORGANIZATION_TYPE
).map((value) => ({
  value,
  label: toLabel(value),
}));

export const KYC_FILTER_OPTIONS: FilterOption[] = Object.values(
  ORGANIZATION_KYC_STATUS
).map((value) => ({
  value,
  label: toStartCase(value),
}));

export const LICENSE_FILTER_OPTIONS: FilterOption[] = Object.values(
  ORGANIZATION_LICENSE_STATUS
).map((value) => ({
  value,
  label: toStartCase(value),
}));

export const SUBSCRIPTION_FILTER_OPTIONS: FilterOption[] = Object.values(
  ORGANIZATION_SUBSCRIPTION_TYPE
).map((value) => ({
  value,
  label: toStartCase(value),
}));

const formatFilterLabel = (prefix: string, value: string) =>
  `${prefix}: ${value.replace(/_/g, " ")}`;

export function useOrganizationFilters(onFiltersChanged: () => void) {
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
    const chips: { key: string; label: string }[] = [];

    const keyedFilters: [string, string[]][] = [
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
