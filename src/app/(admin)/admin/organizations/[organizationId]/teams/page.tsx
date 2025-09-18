import { Plus, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

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

type OrganizationTeamsPageProps = {
  params: Promise<{ organizationId: string }>;
};

const sampleTeams = [
  {
    id: "team-1",
    name: "VSLA — Abetifi",
    members: 28,
    createdAt: "2023-09-14",
  },
  {
    id: "team-2",
    name: "Input Aggregators",
    members: 12,
    createdAt: "2024-02-02",
  },
  {
    id: "team-3",
    name: "Field Officers — North",
    members: 16,
    createdAt: "2024-03-21",
  },
];

export default async function OrganizationTeamsPage({
  params,
}: OrganizationTeamsPageProps) {
  const { organizationId: rawId } = await params;
  const organizationId = decodeURIComponent(rawId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/teams`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Teams" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => {
        const basePath = `/admin/organizations/${encodedId}`;

        return (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">Teams & groups</h2>
                <p className="text-muted-foreground text-sm">
                  Organize members into clusters for approvals, communications,
                  and reporting.
                </p>
              </div>
              <Button asChild>
                <Link href={`${basePath}/teams?create=new`}>
                  <Plus aria-hidden className="mr-2 size-4" />
                  Create team
                </Link>
              </Button>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>
                  Launch into a team view, rename the group, or remove when no
                  longer required.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team name</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">
                          {team.name}
                        </TableCell>
                        <TableCell>{team.members}</TableCell>
                        <TableCell>{team.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              Open
                            </Button>
                            <Button size="sm" variant="ghost">
                              Rename
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

            <Card>
              <CardHeader>
                <CardTitle>Why teams matter</CardTitle>
                <CardDescription>
                  Segmenting members enables granular permissions, localized
                  messaging, and aggregation of savings or loan metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FeatureHighlight
                  description="Roles can be restricted to teams to limit access to sensitive farmer records or approvals."
                  icon={<Users aria-hidden className="size-4" />}
                  title="Role scopes"
                />
                <FeatureHighlight
                  description="Future releases surface productivity, loan exposure, and default risk per team."
                  icon={<Users aria-hidden className="size-4" />}
                  title="Team insights"
                />
              </CardContent>
            </Card>
          </div>
        );
      }}
    </OrganizationDetailsShell>
  );
}

const FeatureHighlight = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex gap-3 rounded-lg border border-dashed p-4">
    <span className="mt-1 inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </span>
    <div className="space-y-1">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  </div>
);
