import { Download, Filter, MapPin, Plus } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationDetailsShell } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationFarmersPageProps = {
  params: { organizationId: string };
};

const sampleFarmers = [
  {
    id: "PK-00123",
    name: "Kofi Owusu",
    phone: "+233 54 000 1234",
    district: "Bono East / Kintampo",
    kyc: "Verified",
    teams: ["VSLA — Abetifi"],
    farms: 2,
  },
  {
    id: "PK-00458",
    name: "Ama Sarfo",
    phone: "+233 24 455 9988",
    district: "Volta / Hohoe",
    kyc: "Pending",
    teams: ["Field Officers — North"],
    farms: 1,
  },
  {
    id: "PK-00781",
    name: "Yaw Sarpong",
    phone: "+233 20 124 8899",
    district: "Ashanti / Ejisu",
    kyc: "Verified",
    teams: ["Input Aggregators", "VSLA — Abetifi"],
    farms: 3,
  },
];

export default function OrganizationFarmersPage({
  params,
}: OrganizationFarmersPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/farmers`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Farmers" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => {
        const basePath = `/admin/organizations/${encodedId}`;

        return (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">Farmer registry</h2>
                <p className="text-muted-foreground text-sm">
                  Monitor farmer onboarding, verification status, and the groups
                  assigned for service delivery.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline">
                  <Link href={`${basePath}/farmers/import`}>
                    <Download aria-hidden className="mr-2 size-4" />
                    Bulk import CSV
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`${basePath}/farmers/create`}>
                    <Plus aria-hidden className="mr-2 size-4" />
                    Add farmer
                  </Link>
                </Button>
              </div>
            </header>

            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                className="w-full sm:max-w-sm"
                placeholder="Search by name, phone, or ID"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline">
                  <Filter aria-hidden className="mr-2 size-4" />
                  KYC status
                </Button>
                <Button size="sm" variant="outline">
                  <Filter aria-hidden className="mr-2 size-4" />
                  Teams
                </Button>
                <Button size="sm" variant="outline">
                  <Filter aria-hidden className="mr-2 size-4" />
                  District
                </Button>
              </div>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Farmers</CardTitle>
                <CardDescription>
                  Access record to edit demographic information, update KYC, or
                  archive when farmers churn.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>pukpara ID</TableHead>
                      <TableHead>Full name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>KYC status</TableHead>
                      <TableHead>Teams</TableHead>
                      <TableHead>Farms</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleFarmers.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell className="font-mono text-sm">
                          {farmer.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {farmer.name}
                        </TableCell>
                        <TableCell>{farmer.phone}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm">
                            <MapPin
                              aria-hidden
                              className="size-3.5 text-muted-foreground"
                            />
                            {farmer.district}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{farmer.kyc}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {farmer.teams.map((team) => (
                              <Badge key={team} variant="secondary">
                                {team}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{farmer.farms}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                            <Button size="sm" variant="ghost">
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost">
                              Archive
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk import guidance</CardTitle>
                <CardDescription>
                  CSV headers and validation feedback will surface here to help
                  reconcile onboarding errors quickly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground text-sm">
                  <p>
                    Uploads support mapping to farmer identifiers, contact
                    details, and initial farm counts. Validation issues will be
                    returned inline with actionable error messages.
                  </p>
                  <p>
                    When connected, server-side validation will confirm
                    duplicates and ensure district codes align with the
                    reference dataset.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </OrganizationDetailsShell>
  );
}
