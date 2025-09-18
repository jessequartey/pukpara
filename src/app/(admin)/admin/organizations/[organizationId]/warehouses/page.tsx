import { Boxes, PackagePlus } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationDetailsShell } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationWarehousesPageProps = {
  params: { organizationId: string };
};

const sampleWarehouses = [
  {
    id: "wh-1",
    name: "Tamale Central",
    location: "Northern / Tamale",
    capacity: "1,200 MT",
    items: 42,
    status: "Operational",
  },
  {
    id: "wh-2",
    name: "Techiman Aggregation Hub",
    location: "Bono East / Techiman",
    capacity: "850 MT",
    items: 28,
    status: "Audit due",
  },
];

const sampleStock = [
  { commodity: "Maize (Yellow)", quantity: "320 MT" },
  { commodity: "Soya", quantity: "140 MT" },
  { commodity: "Fertilizer", quantity: "55 MT" },
];

const sampleMovements = [
  {
    id: "mv-1",
    type: "Inbound",
    commodity: "Maize (Yellow)",
    quantity: "120 MT",
    warehouse: "Tamale Central",
    timestamp: "2024-05-21 10:14",
  },
  {
    id: "mv-2",
    type: "Reserve",
    commodity: "Soya",
    quantity: "30 MT",
    warehouse: "Techiman Aggregation Hub",
    timestamp: "2024-05-20 15:05",
  },
  {
    id: "mv-3",
    type: "Outbound",
    commodity: "Fertilizer",
    quantity: "12 MT",
    warehouse: "Tamale Central",
    timestamp: "2024-05-19 09:22",
  },
];

export default function OrganizationWarehousesPage({
  params,
}: OrganizationWarehousesPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/warehouses`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Warehouses" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => {
        const basePath = `/admin/organizations/${encodedId}`;

        return (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">
                  Warehouses & inventory
                </h2>
                <p className="text-muted-foreground text-sm">
                  Maintain site capacity, inventory balances, and recent stock
                  movements for suppliers and aggregators.
                </p>
              </div>
              <Button asChild>
                <Link href={`${basePath}/warehouses?create=new`}>
                  <PackagePlus aria-hidden className="mr-2 size-4" />
                  Add warehouse
                </Link>
              </Button>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Warehouses</CardTitle>
                <CardDescription>
                  Monitor compliance and plan allocation across all storage
                  sites.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>District / community</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleWarehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">
                          {warehouse.name}
                        </TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell>{warehouse.capacity}</TableCell>
                        <TableCell>{warehouse.items}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{warehouse.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              Open
                            </Button>
                            <Button size="sm" variant="ghost">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Stock snapshot</CardTitle>
                  <CardDescription>
                    Aggregate balances by commodity and variety across active
                    warehouses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sampleStock.map((item) => (
                    <div
                      className="flex items-center justify-between rounded-md border p-3"
                      key={item.commodity}
                    >
                      <span className="font-medium">{item.commodity}</span>
                      <span className="text-muted-foreground text-sm">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent movements</CardTitle>
                  <CardDescription>
                    A running ledger of inbound, outbound, and reserved
                    inventory events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sampleMovements.map((movement) => (
                    <div className="rounded-md border p-3" key={movement.id}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{movement.type}</span>
                        <span className="text-muted-foreground text-xs">
                          {movement.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">
                        {movement.quantity} · {movement.commodity}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {movement.warehouse}
                      </p>
                    </div>
                  ))}
                  <Button className="w-full" size="sm" variant="outline">
                    <Boxes aria-hidden className="mr-2 size-4" />
                    View full movement log
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }}
    </OrganizationDetailsShell>
  );
}
