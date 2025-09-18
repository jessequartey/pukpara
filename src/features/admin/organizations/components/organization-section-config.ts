type OrganizationTypeValue = string | null | undefined;

type OrganizationSectionConfig = {
  key: string;
  label: string;
  path: string;
  allowedTypes?: string[];
};

const BASE_SECTIONS: OrganizationSectionConfig[] = [
  { key: "overview", label: "Overview", path: "" },
  { key: "members", label: "Members", path: "members" },
  { key: "teams", label: "Teams", path: "teams" },
  {
    key: "farmers",
    label: "Farmers",
    path: "farmers",
    allowedTypes: ["FARMER_ORG", "AGGREGATOR"],
  },
  {
    key: "farms",
    label: "Farms",
    path: "farms",
    allowedTypes: ["FARMER_ORG", "AGGREGATOR"],
  },
  {
    key: "warehouses",
    label: "Warehouses & Inventory",
    path: "warehouses",
    allowedTypes: ["SUPPLIER", "AGGREGATOR"],
  },
  { key: "finance", label: "Finance", path: "finance" },
  { key: "marketplace", label: "Marketplace", path: "marketplace" },
  { key: "billing", label: "Billing & License", path: "billing" },
  { key: "notifications", label: "Notifications", path: "notifications" },
  { key: "settings", label: "Settings", path: "settings" },
  { key: "audit", label: "Audit", path: "audit" },
];

export type OrganizationSectionNavItem = {
  key: string;
  label: string;
  href: string;
};

const shouldDisplaySection = (
  organizationType: OrganizationTypeValue,
  section: OrganizationSectionConfig
) => {
  if (!section.allowedTypes || section.allowedTypes.length === 0) {
    return true;
  }

  if (!organizationType) {
    return true;
  }

  return section.allowedTypes.includes(organizationType);
};

export const getOrganizationSections = (
  basePath: string,
  organizationType: OrganizationTypeValue
): OrganizationSectionNavItem[] => {
  const items: OrganizationSectionNavItem[] = [];

  for (const section of BASE_SECTIONS) {
    if (!shouldDisplaySection(organizationType, section)) {
      continue;
    }

    const href = section.path ? `${basePath}/${section.path}` : basePath;

    items.push({
      key: section.key,
      label: section.label,
      href,
    });
  }

  return items;
};
