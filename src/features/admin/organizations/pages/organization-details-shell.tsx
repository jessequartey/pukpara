import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { api } from "@/trpc/server";

export type OrganizationDetailData = Awaited<
  ReturnType<typeof api.organizations.detail.query>
>;

type OrganizationDetailsShellProps = {
  organizationId: string;
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
  children,
}: OrganizationDetailsShellProps) {
  const detail = await getOrganizationDetail(organizationId);
  return children(detail);
}
