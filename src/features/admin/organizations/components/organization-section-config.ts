type OrganizationTypeValue = string | null | undefined;

type OrganizationSectionConfig = {
  key: string;
  label: string;
  path: string;
  allowedTypes?: string[];
};

const BASE_SECTIONS: OrganizationSectionConfig[] = [
  { key: "overview", label: "Overview", path: "" },
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
