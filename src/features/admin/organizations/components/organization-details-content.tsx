"use client";

import { format } from "date-fns";
import {
  Building2,
  Mail,
  User,
  CreditCard,
  TrendingUp,
  Warehouse,
  ShoppingCart,
  UserCheck,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OrganizationDetailData } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationDetailsContentProps = {
  detail: OrganizationDetailData;
};

export function OrganizationDetailsContent({ detail }: OrganizationDetailsContentProps) {
  const { organization, stats, leadership } = detail;
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);

  const primaryContact = leadership.find((member) => member.role === "owner") || leadership.at(0) || null;

  const handleImpersonate = () => {
    if (!primaryContact) {
      toast.error("No primary contact available for impersonation");
      return;
    }
    toast.success(`Impersonating ${primaryContact.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Admin Actions Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-4">
        <Button onClick={() => toast.success("Organization approved")} size="sm">
          Approve
        </Button>
        <Button onClick={() => toast.success("Organization suspended")} size="sm" variant="outline">
          Suspend
        </Button>
        <Button onClick={() => setIsEditDetailsOpen(true)} size="sm" variant="secondary">
          Edit Details
        </Button>
        <Button onClick={() => toast.error("Organization deleted")} size="sm" variant="destructive">
          Delete
        </Button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        {/* Left Column - Overview */}
        <div className="space-y-6">
          {/* Organization Overview Card */}
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5" />
                  Organization Overview
                </CardTitle>
                <CardDescription>Platform setup and plan metadata.</CardDescription>
              </div>
              <Button onClick={() => setIsEditDetailsOpen(true)} size="sm" variant="secondary">
                Edit Details
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Type / subtype</p>
                  <p className="text-foreground text-sm">
                    {organization.organizationType
                      ? `${organization.organizationType}${
                          organization.organizationSubType ? ` / ${organization.organizationSubType}` : ""
                        }`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Created</p>
                  <p className="text-foreground text-sm">
                    {organization.createdAt ? format(new Date(organization.createdAt), "PPP") : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Max users</p>
                  <p className="text-foreground text-sm">
                    {organization.maxUsers ? organization.maxUsers.toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Members</p>
                  <p className="text-foreground text-sm">{stats.memberCount.toLocaleString()}</p>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Contact & Address Card */}
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="size-5" />
                  Contact & Address
                </CardTitle>
                <CardDescription>Primary communication details for the organization.</CardDescription>
              </div>
              <Button onClick={() => toast.success("Contact updated")} size="sm" variant="secondary">
                Edit Contact
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Email</p>
                  <p className="text-foreground text-sm">{organization.contactEmail ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Phone</p>
                  <p className="text-foreground text-sm">{organization.contactPhone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Address</p>
                  <p className="text-foreground text-sm">{organization.address ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Region / district</p>
                  <p className="text-foreground text-sm">
                    {[organization.regionId, organization.districtId].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Subscription & License Card */}
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5" />
                  Subscription & License
                </CardTitle>
                <CardDescription>Manage billing cadence and licensing status.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => toast.success("License issued")} size="sm" variant="secondary">
                  Issue License
                </Button>
                <Button onClick={() => toast.success("Invoice sent")} size="sm" variant="outline">
                  Send Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Plan</p>
                  <p className="text-foreground text-sm">{organization.subscriptionType || "Freemium"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">License</p>
                  <p className="text-foreground text-sm">{organization.licenseStatus || "Issued"}</p>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Primary Contact Card */}
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Primary Contact
                </CardTitle>
                <CardDescription>Owners or admins responsible for this organization.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => toast.success("Contact saved")} size="sm" variant="secondary">
                  Edit User
                </Button>
                <Button onClick={handleImpersonate} size="sm">
                  Impersonate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {primaryContact ? (
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    {primaryContact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{primaryContact.name}</h3>
                    <p className="text-muted-foreground">{primaryContact.email}</p>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-2">
                      {primaryContact.role || "Owner"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Assign a primary contact to enable impersonation and escalations.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-6">
          {/* KPIs Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                KPIs & Finance
              </CardTitle>
              <CardDescription>Key performance indicators and financial overview.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-muted-foreground text-xs uppercase">Total Farmers</p>
                  <p className="font-semibold text-2xl tracking-tight">—</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-muted-foreground text-xs uppercase">Savings Balance</p>
                  <p className="font-semibold text-2xl tracking-tight">—</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="size-5" />
                Inventory
              </CardTitle>
              <CardDescription>Warehouse and storage overview.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No inventory data available.</p>
              <Button className="w-full mt-4" variant="outline">
                View Warehouses
              </Button>
            </CardContent>
          </Card>

          {/* Marketplace Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="size-5" />
                Marketplace
              </CardTitle>
              <CardDescription>Trading and marketplace activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No marketplace activity.</p>
              <Button className="w-full mt-4" variant="outline">
                View Listings
              </Button>
            </CardContent>
          </Card>

          {/* Compliance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="size-5" />
                Compliance & KYC
              </CardTitle>
              <CardDescription>Compliance status and documentation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Org KYC</p>
                  <p className="text-foreground text-sm">{organization.kycStatus || "Pending"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest organizational activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No recent activity.</p>
              <Button className="w-full mt-4" variant="outline">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}