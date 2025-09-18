import { AlertTriangle, Save, ShieldOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrganizationDetailsShell } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationSettingsPageProps = {
  params: { organizationId: string };
};

export default function OrganizationSettingsPage({
  params,
}: OrganizationSettingsPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/settings`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Settings" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {(detail) => {
        const { organization } = detail;
        const basePath = `/admin/organizations/${encodedId}`;
        const limits = extractLimits(organization.metadata);

        return (
          <div className="space-y-6">
            <header className="space-y-1">
              <h2 className="font-semibold text-lg">Organization settings</h2>
              <p className="text-muted-foreground text-sm">
                Update identifiers, contact information, limits, and lifecycle
                controls.
              </p>
            </header>

            <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Core details</CardTitle>
                  <CardDescription>
                    The name and slug appear across dashboards and share links.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="orgName">Organization name</Label>
                    <Input defaultValue={organization.name} id="orgName" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgSlug">Slug</Label>
                    <Input
                      defaultValue={organization.slug ?? ""}
                      id="orgSlug"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgType">Type</Label>
                    <Input
                      defaultValue={organization.organizationType ?? "—"}
                      disabled
                      id="orgType"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgSubtype">Subtype</Label>
                    <Input
                      defaultValue={organization.organizationSubType ?? "—"}
                      disabled
                      id="orgSubtype"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgCurrency">Currency</Label>
                    <Input
                      defaultValue={organization.defaultCurrency ?? "GHS"}
                      id="orgCurrency"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgTimezone">Timezone</Label>
                    <Input
                      defaultValue={organization.timezone ?? "Africa/Accra"}
                      id="orgTimezone"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save aria-hidden className="mr-2 size-4" />
                    Save changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick navigation</CardTitle>
                  <CardDescription>
                    Jump to billing, notifications, or audit settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${basePath}/billing`}>Billing & license</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${basePath}/notifications`}>
                      Notifications
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${basePath}/audit`}>Audit log</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contact & address</CardTitle>
                <CardDescription>
                  Update communication details and physical address.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact email</Label>
                  <Input
                    defaultValue={
                      organization.contactEmail ?? "support@example.com"
                    }
                    id="contactEmail"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact phone</Label>
                  <Input
                    defaultValue={organization.contactPhone ?? "+233"}
                    id="contactPhone"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="orgAddress">Address</Label>
                  <Textarea
                    defaultValue={organization.address ?? ""}
                    id="orgAddress"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regionId">Region ID</Label>
                  <Input
                    defaultValue={organization.regionId ?? "—"}
                    id="regionId"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="districtId">District ID</Label>
                  <Input
                    defaultValue={organization.districtId ?? "—"}
                    id="districtId"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limits JSON</CardTitle>
                <CardDescription>
                  Configure limits such as max teams or warehouses. Validation
                  will run server-side.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea defaultValue={limits} rows={8} />
                <p className="text-muted-foreground text-xs">
                  Use the Settings API to persist; this UI saves once backend
                  endpoints are linked.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">
                  Preview diff
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="text-destructive">Danger zone</CardTitle>
                <CardDescription>
                  Suspend, reject, or delete the organization. These actions
                  require elevated permissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 rounded-md bg-destructive/5 p-3">
                  <AlertTriangle
                    aria-hidden
                    className="size-5 text-destructive"
                  />
                  <p className="text-destructive text-sm">
                    Suspensions should include a reason for the audit log.
                    Deletion is permanently destructive and will be gated by
                    super admin approval.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary">
                    Suspend organization
                  </Button>
                  <Button size="sm" variant="outline">
                    Reject onboarding
                  </Button>
                  <Button size="sm" variant="destructive">
                    <ShieldOff aria-hidden className="mr-2 size-4" />
                    Delete organization
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

const extractLimits = (metadata: unknown) => {
  if (!metadata || typeof metadata !== "object") {
    return "{}";
  }

  const { limits } = metadata as { limits?: unknown };
  if (!limits || typeof limits !== "object") {
    return "{}";
  }

  try {
    return JSON.stringify(limits, null, 2);
  } catch (error) {
    return "{}";
  }
};
