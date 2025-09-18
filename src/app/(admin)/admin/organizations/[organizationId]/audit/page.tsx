import { Download, Filter } from "lucide-react";

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

type OrganizationAuditPageProps = {
  params: { organizationId: string };
};

const sampleAuditEvents = [
  {
    id: "evt-1",
    createdAt: "2024-05-21 11:12",
    actor: "Adjoa Mensah",
    action: "loan.approve",
    entity: "loan:LN-2024-019",
    note: "Approved by finance reviewer",
  },
  {
    id: "evt-2",
    createdAt: "2024-05-20 16:44",
    actor: "System",
    action: "organization.update",
    entity: "org:metadata",
    note: "Limits JSON updated",
  },
  {
    id: "evt-3",
    createdAt: "2024-05-19 08:03",
    actor: "Yaw Boateng",
    action: "member.add",
    entity: "member:user-882",
    note: "Invited via Better-Auth",
  },
];

export default function OrganizationAuditPage({
  params,
}: OrganizationAuditPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/audit`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Audit" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => (
        <div className="space-y-6">
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="font-semibold text-lg">Audit log</h2>
              <p className="text-muted-foreground text-sm">
                Every sensitive action within this organization is recorded for
                compliance and troubleshooting.
              </p>
            </div>
            <Button size="sm" variant="outline">
              <Download aria-hidden className="mr-2 size-4" />
              Export CSV
            </Button>
          </header>

          <section className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input
                className="w-full"
                placeholder="Search actor, action, or entity"
              />
            </div>
            <Button size="sm" variant="outline">
              <Filter aria-hidden className="mr-2 size-4" />
              Action
            </Button>
            <Button size="sm" variant="outline">
              <Filter aria-hidden className="mr-2 size-4" />
              Date range
            </Button>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Recent events</CardTitle>
              <CardDescription>
                Filterable timeline of audited actions, including actor context
                and structured metadata payloads.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleAuditEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.createdAt}</TableCell>
                      <TableCell>{event.actor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {event.entity}
                        </span>
                      </TableCell>
                      <TableCell>{event.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </OrganizationDetailsShell>
  );
}
