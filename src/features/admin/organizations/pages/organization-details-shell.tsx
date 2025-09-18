import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import type { BreadcrumbItemType } from "@/components/ui/page-title";
import { OrganizationDetailsLayout } from "@/features/admin/organizations/components/organization-details-layout";
import { api } from "@/trpc/server";

export type OrganizationDetailData = Awaited<
  ReturnType<typeof api.organizations.detail.query>
>;

type OrganizationDetailsShellProps = {
  organizationId: string;
  currentPath: string;
  breadcrumbs?: BreadcrumbItemType[];
  children: (detail: OrganizationDetailData) => ReactNode;
};

const getOrganizationDetail = async (organizationId: string) => {
  try {
    return await api.organizations.detail.query({ organizationId });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "NOT_FOUND"
    ) {
      notFound();
    }

    throw error;
  }
};

export async function OrganizationDetailsShell({
  organizationId,
  currentPath,
  breadcrumbs,
  children,
}: OrganizationDetailsShellProps) {
  const detail = await getOrganizationDetail(organizationId);
  const { organization } = detail;
  const basePath = `/admin/organizations/${encodeURIComponent(organizationId)}`;

  return (
    <OrganizationDetailsLayout
      basePath={basePath}
      breadcrumbs={breadcrumbs}
      currentPath={currentPath}
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        organizationType: organization.organizationType,
        organizationSubType: organization.organizationSubType,
      }}
    >
      {children(detail)}
    </OrganizationDetailsLayout>
  );
}
