import { Filter, MailPlus, Search } from "lucide-react";
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

type OrganizationMembersPageProps = {
  params: Promise<{ organizationId: string }>;
};

const sampleMembers = [
  {
    id: "1",
    name: "Adjoa Mensah",
    email: "adjoa.mensah@example.com",
    role: "Owner",
    status: "Active",
    lastLogin: "2024-05-22 11:45",
    joined: "2023-12-01",
  },
  {
    id: "2",
    name: "Yaw Boateng",
    email: "yaw.boateng@example.com",
    role: "Admin",
    status: "Invited",
    lastLogin: "—",
    joined: "2024-02-10",
  },
  {
    id: "3",
    name: "Akosua Agyeman",
    email: "akosua.agyeman@example.com",
    role: "Finance",
    status: "Active",
    lastLogin: "2024-05-19 08:12",
    joined: "2024-01-18",
  },
];

export default async function OrganizationMembersPage({
  params,
}: OrganizationMembersPageProps) {
  const { organizationId: rawId } = await params;
  const organizationId = decodeURIComponent(rawId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/members`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Members" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => {
        const basePath = `/admin/organizations/${encodedId}`;

        return (
          <div className="space-y-6">
            <section aria-labelledby="member-controls" className="space-y-4">
              <h3 className="sr-only" id="member-controls">
                Member filters
              </h3>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:max-w-xs">
                    <Search
                      aria-hidden
                      className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground"
                    />
                    <Input
                      aria-labelledby="member-controls"
                      className="pl-9"
                      placeholder="Search members"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterButton label="Role" />
                    <FilterButton label="Status" />
                  </div>
                </div>
                <Button asChild>
                  <Link href={`${basePath}/members?invite=new`}>
                    <MailPlus aria-hidden className="mr-2 size-4" />
                    Invite member
                  </Link>
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage active users, pending invitations, and administrative
                permissions for the organization.
              </p>
            </section>

            <Card aria-labelledby="organization-members">
              <CardHeader>
                <CardTitle id="organization-members">Member roster</CardTitle>
                <CardDescription>
                  Update roles, remove members, or impersonate for support
                  assistance.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last login</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.name}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.role}</Badge>
                        </TableCell>
                        <TableCell>{member.status}</TableCell>
                        <TableCell>{member.lastLogin}</TableCell>
                        <TableCell>{member.joined}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              Update role
                            </Button>
                            <Button size="sm" variant="ghost">
                              Remove
                            </Button>
                            <Button size="sm" variant="ghost">
                              Impersonate
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
                <CardTitle>Pending invitations</CardTitle>
                <CardDescription>
                  Track outstanding invitations, resend reminders, or revoke
                  access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 rounded-lg border border-dashed p-6 text-center">
                  <p className="font-medium">No pending invitations</p>
                  <p className="text-muted-foreground text-sm">
                    Invitations generated here will surface with expiry timers
                    and quick actions once org-level invites are active.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="secondary">
                      Resend selected
                    </Button>
                    <Button size="sm" variant="outline">
                      Configure invite template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </OrganizationDetailsShell>
  );
}

const FilterButton = ({ label }: { label: string }) => (
  <Button size="sm" variant="outline">
    <Filter aria-hidden className="mr-2 size-4" />
    {label}
  </Button>
);
