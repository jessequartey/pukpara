import type { ReactNode } from "react";

import type { BreadcrumbItemType } from "@/components/ui/page-title";
import { PageTitle } from "@/components/ui/page-title";

type OrganizationPageTitleProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  breadcrumbs?: BreadcrumbItemType[];
  children?: ReactNode;
};

const baseBreadcrumbs: BreadcrumbItemType[] = [
  { label: "Admin", href: "/admin" },
  { label: "Organizations", href: "/admin/organizations" },
];

export function OrganizationPageTitle({
  title,
  description,
  action,
  breadcrumbs,
  children,
}: OrganizationPageTitleProps) {
  return (
    <div className="space-y-6">
      <PageTitle
        action={action}
        breadcrumbs={[...baseBreadcrumbs, ...(breadcrumbs ?? [])]}
        description={description}
        title={title}
      />
      {children}
    </div>
  );
}
