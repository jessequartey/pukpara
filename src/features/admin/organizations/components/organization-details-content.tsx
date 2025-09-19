"use client";

import { Edit, MoreVertical, Shield, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ComplianceKycCard } from "./organization-details/compliance-kyc-card";
import { ContactAddressCard } from "./organization-details/contact-address-card";
import { InventoryCard } from "./organization-details/inventory-card";
import { KpisFinanceCard } from "./organization-details/kpis-finance-card";
import { MarketplaceActivityCard } from "./organization-details/marketplace-activity-card";
import { OrganizationOverviewCard } from "./organization-details/organization-overview-card";
import { PrimaryContactCard } from "./organization-details/primary-contact-card";
import { RecentActivityCard } from "./organization-details/recent-activity-card";
import { SubscriptionLicenseCard } from "./organization-details/subscription-license-card";

type OrganizationDetailsContentProps = {
  orgId: string;
};

export function OrganizationDetailsContent({
  orgId,
}: OrganizationDetailsContentProps) {
  // Mock organization data - replace with actual API call
  const organization = {
    id: orgId,
    name: "Green Valley Cooperative",
    slug: "green-valley-coop",
    status: "active" as const,
    organizationType: "cooperative" as const,
    subscriptionType: "premium" as const,
    licenseStatus: "issued" as const,
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-xl">{organization.name}</h2>
            <span className="text-muted-foreground text-sm">
              ({organization.slug})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                organization.status === "active" ? "default" : "secondary"
              }
            >
              {organization.status}
            </Badge>
            <Badge variant="outline">{organization.organizationType}</Badge>
            <Badge variant="default">{organization.subscriptionType}</Badge>
            <Badge
              variant={
                organization.licenseStatus === "issued"
                  ? "default"
                  : "destructive"
              }
            >
              {organization.licenseStatus}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm">
            <Shield className="mr-2 size-4" />
            Approve
          </Button>
          <Button size="sm" variant="outline">
            <User className="mr-2 size-4" />
            Suspend
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="mr-2 size-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Send message</DropdownMenuItem>
              <DropdownMenuItem>Export data</DropdownMenuItem>
              <DropdownMenuItem>Open as active org</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - spans 2 columns on large screens */}
        <div className="space-y-6 lg:col-span-2">
          <OrganizationOverviewCard />
          <ContactAddressCard />
          <SubscriptionLicenseCard />
          <PrimaryContactCard />
        </div>

        {/* Right column - spans 1 column on large screens */}
        <div className="space-y-6">
          <KpisFinanceCard />
          <InventoryCard />
          <MarketplaceActivityCard />
          <ComplianceKycCard />
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}
