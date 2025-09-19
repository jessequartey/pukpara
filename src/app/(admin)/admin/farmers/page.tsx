"use client";

import { FarmerDirectoryCard } from "@/features/admin/farmers/components/farmer-directory/farmer-directory-card";
import { FarmerPageTitle } from "@/features/admin/farmers/components/farmer-page-title";
import { useFarmerListController } from "@/features/admin/farmers/hooks/use-farmer-list-controller";

export default function AdminFarmersPage() {
  const controller = useFarmerListController();

  return (
    <FarmerPageTitle
      action={{ label: "Add farmer", href: "/admin/farmers/new" }}
      description="Cross-organization farmer explorer with rich filters and analytics."
      title="Farmers"
    >
      <FarmerDirectoryCard controller={controller} />
    </FarmerPageTitle>
  );
}
