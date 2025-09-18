import { Filter, Map, Pin } from "lucide-react";
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

type OrganizationFarmsPageProps = {
  params: { organizationId: string };
};

const sampleFarms = [
  {
    id: "farm-1",
    farmer: "Kofi Owusu",
    name: "Owusu Family Plot",
    acreage: 3.5,
    crop: "Maize",
    location: "Bono East / Kintampo",
    status: "Active",
  },
  {
    id: "farm-2",
    farmer: "Ama Sarfo",
    name: "Sarfo Cocoa Block",
    acreage: 2,
    crop: "Cocoa",
    location: "Ashanti / Ejisu",
    status: "Pending survey",
  },
  {
    id: "farm-3",
    farmer: "Yaw Sarpong",
    name: "Sarpong Cassava Fields",
    acreage: 4.2,
    crop: "Cassava",
    location: "Volta / Hohoe",
    status: "Dormant",
  },
];

export default function OrganizationFarmsPage({
  params,
}: OrganizationFarmsPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/farms`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Farms" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => {
        const basePath = `/admin/organizations/${encodedId}`;

        return (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">Farm registry</h2>
                <p className="text-muted-foreground text-sm">
                  Track acreage, crops, and survey status per farmer. Link
                  multiple farms for diversified producers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Map aria-hidden className="mr-2 size-4" />
                  Map view
                </Button>
                <Button asChild size="sm">
                  <Link href={`${basePath}/farms/create`}>Register farm</Link>
                </Button>
              </div>
            </header>

            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                className="w-full sm:max-w-sm"
                placeholder="Search farms"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline">
                  <Filter aria-hidden className="mr-2 size-4" />
                  Status
                </Button>
                <Button size="sm" variant="outline">
                  <Filter aria-hidden className="mr-2 size-4" />
                  Crop type
                </Button>
                <Button size="sm" variant="outline">
                  <Filter aria-hidden className="mr-2 size-4" />
                  District
                </Button>
              </div>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Farms</CardTitle>
                <CardDescription>
                  Manage farm-level details, update acreage, or review
                  geospatial data once mapping is enabled.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Farm name</TableHead>
                      <TableHead>Acreage</TableHead>
                      <TableHead>Crop type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleFarms.map((farm) => (
                      <TableRow key={farm.id}>
                        <TableCell className="font-medium">
                          {farm.farmer}
                        </TableCell>
                        <TableCell>{farm.name}</TableCell>
                        <TableCell>{farm.acreage.toFixed(1)} acres</TableCell>
                        <TableCell>{farm.crop}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Pin
                              aria-hidden
                              className="size-3.5 text-muted-foreground"
                            />
                            {farm.location}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{farm.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                            <Button size="sm" variant="ghost">
                              Edit
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
                <CardTitle>Spatial insights</CardTitle>
                <CardDescription>
                  Toggle the map view to cluster farms, inspect overlaps, and
                  export coordinates for partners.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                  Map visualization will appear here with community-level
                  clustering and acreage heatmaps.
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </OrganizationDetailsShell>
  );
}
