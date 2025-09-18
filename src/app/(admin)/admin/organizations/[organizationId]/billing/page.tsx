import { BadgeCheck, CalendarClock, FileText, Shield } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrganizationDetailsShell } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationBillingPageProps = {
  params: { organizationId: string };
};

export default function OrganizationBillingPage({
  params,
}: OrganizationBillingPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/billing`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Billing & License" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {(detail) => {
        const { organization } = detail;
        const basePath = `/admin/organizations/${encodedId}`;

        return (
          <div className="space-y-6">
            <header className="space-y-1">
              <h2 className="font-semibold text-lg">Billing & licensing</h2>
              <p className="text-muted-foreground text-sm">
                Review subscription terms, license status, and primary billing
                contacts for this organization.
              </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>
                    Track renewal dates, included seats, and plan entitlements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <p className="font-medium">
                        {organization.subscriptionType ?? "Freemium"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Plan renews on{" "}
                        {organization.planRenewsAt
                          ? new Date(
                              organization.planRenewsAt
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <BadgeCheck
                      aria-hidden
                      className="size-5 text-emerald-500"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-dashed p-4">
                    <div>
                      <p className="font-medium">Usage</p>
                      <p className="text-muted-foreground text-sm">
                        {organization.maxUsers
                          ? `${detail.stats.memberCount}/${organization.maxUsers} seats allocated`
                          : `${detail.stats.memberCount} active members`}
                      </p>
                    </div>
                    <CalendarClock
                      aria-hidden
                      className="size-5 text-primary"
                    />
                  </div>
                  <Button size="sm" variant="outline">
                    Manage subscription
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>License status</CardTitle>
                  <CardDescription>
                    Adjust license issuance, suspension, or renewal windows.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <p className="font-medium">
                        {organization.licenseStatus ?? "Pending"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Issue or revoke licenses to control production access.
                      </p>
                    </div>
                    <Shield aria-hidden className="size-5 text-primary" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Issue license</Button>
                    <Button size="sm" variant="secondary">
                      Revoke
                    </Button>
                    <Button size="sm" variant="outline">
                      Mark expired
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billing profile</CardTitle>
                <CardDescription>
                  Maintain billing emails, tax information, and invoicing
                  preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Billing email</Label>
                  <Input
                    defaultValue={
                      organization.contactEmail ?? "billing@example.com"
                    }
                    id="billingEmail"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input defaultValue="—" id="taxId" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    defaultValue={organization.defaultCurrency ?? "GHS"}
                    id="currency"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    defaultValue={organization.timezone ?? "Africa/Accra"}
                    id="timezone"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button size="sm">Save changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoices & charges</CardTitle>
                <CardDescription>
                  Historical invoices will appear here with quick links to the
                  hosted invoice.
                </CardDescription>
              </CardHeader>
              <CardContent className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                Invoice history not yet generated. Once billing is enabled,
                invoices will sync from the billing provider with PDF links.
                <div className="mt-4">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${basePath}/billing/new-invoice`}>
                      <FileText aria-hidden className="mr-2 size-4" />
                      Create manual invoice
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </OrganizationDetailsShell>
  );
}
