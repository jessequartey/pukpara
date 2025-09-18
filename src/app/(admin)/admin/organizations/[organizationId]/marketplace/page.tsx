import { PackagePlus, ScrollText, ShoppingCart } from "lucide-react";
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

type OrganizationMarketplacePageProps = {
  params: { organizationId: string };
};

const sampleListings = [
  {
    id: "list-1",
    commodity: "Maize (Yellow)",
    quantity: "150 MT",
    price: "₵1,850 / MT",
    status: "Active",
    updatedAt: "2024-05-20",
  },
  {
    id: "list-2",
    commodity: "Soya",
    quantity: "80 MT",
    price: "₵2,050 / MT",
    status: "Negotiation",
    updatedAt: "2024-05-18",
  },
];

const samplePurchaseOrders = [
  {
    id: "PO-1023",
    role: "Seller",
    status: "Pending approval",
    value: "₵45,500",
    createdAt: "2024-05-19",
  },
  {
    id: "PO-1019",
    role: "Buyer",
    status: "Fulfilled",
    value: "₵26,200",
    createdAt: "2024-05-11",
  },
];

const sampleMarketplaceActivity = [
  {
    id: "act-1",
    type: "Delivery",
    reference: "DEL-3301",
    details: "Maize (Yellow) · 50 MT",
    timestamp: "2024-05-21 14:03",
  },
  {
    id: "act-2",
    type: "Receipt",
    reference: "RCPT-2190",
    details: "Soya · 25 MT",
    timestamp: "2024-05-20 09:11",
  },
  {
    id: "act-3",
    type: "Payment",
    reference: "PAY-1124",
    details: "₵18,400 settlement",
    timestamp: "2024-05-19 17:46",
  },
];

export default function OrganizationMarketplacePage({
  params,
}: OrganizationMarketplacePageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/marketplace`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Marketplace" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => {
        const basePath = `/admin/organizations/${encodedId}`;

        return (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">Marketplace</h2>
                <p className="text-muted-foreground text-sm">
                  Listings, purchase orders, and fulfillment history for this
                  organization’s marketplace activity.
                </p>
              </div>
              <Button asChild>
                <Link href={`${basePath}/marketplace?create=new`}>
                  <PackagePlus aria-hidden className="mr-2 size-4" />
                  Add listing
                </Link>
              </Button>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Listings</CardTitle>
                <CardDescription>
                  Manage inventory exposure, pricing, and visibility status per
                  commodity.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commodity</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">
                          {listing.commodity}
                        </TableCell>
                        <TableCell>{listing.quantity}</TableCell>
                        <TableCell>{listing.price}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{listing.status}</Badge>
                        </TableCell>
                        <TableCell>{listing.updatedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase orders</CardTitle>
                  <CardDescription>
                    Role-aware order tracking with quick actions for approvals
                    or fulfillment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {samplePurchaseOrders.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="font-mono text-sm">
                            {po.id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{po.role}</Badge>
                          </TableCell>
                          <TableCell>{po.status}</TableCell>
                          <TableCell>{po.value}</TableCell>
                          <TableCell>{po.createdAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>
                    Deliveries, receipts, and payments land here with links to
                    drill into fulfillment steps.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sampleMarketplaceActivity.map((activity) => (
                    <div className="rounded-md border p-3" key={activity.id}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.type}</span>
                        <span className="text-muted-foreground text-xs">
                          {activity.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">{activity.details}</p>
                      <p className="text-muted-foreground text-xs">
                        {activity.reference}
                      </p>
                    </div>
                  ))}
                  <Button className="w-full" size="sm" variant="outline">
                    <ScrollText aria-hidden className="mr-2 size-4" />
                    View marketplace ledger
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
