"use client";

import {
  Building2,
  Mail,
  Plus,
  Settings,
  UserMinus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrganizationMembershipsCardProps = {
  userId: string;
};

type OrganizationMembership = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationType: string;
  role: string;
  teams: string[];
  joinedAt: Date;
  status: string;
};

export function OrganizationMembershipsCard({
  userId,
}: OrganizationMembershipsCardProps) {
  const [isInviting, setIsInviting] = useState(false);

  // Mock data - replace with actual API call
  const memberships: OrganizationMembership[] = [
    {
      id: "mem_1",
      organizationId: "org_1",
      organizationName: "Green Valley Cooperative",
      organizationType: "cooperative",
      role: "member",
      teams: ["Finance Team", "Operations"],
      joinedAt: new Date("2024-01-16T10:00:00Z"),
      status: "active",
    },
    {
      id: "mem_2",
      organizationId: "org_2",
      organizationName: "Ashanti Farmers Group",
      organizationType: "farmer_org",
      role: "admin",
      teams: ["Leadership"],
      joinedAt: new Date("2024-02-01T14:30:00Z"),
      status: "active",
    },
  ];

  const handleSetRole = (_membershipId: string, newRole: string) => {
    toast.success(`Role updated to ${newRole}`);
  };

  const handleAddToTeam = (_membershipId: string) => {
    toast.success("Add to team dialog would open");
  };

  const handleRemoveFromTeam = (_membershipId: string, teamName: string) => {
    toast.success(`Removed from ${teamName}`);
  };

  const handleRemoveFromOrganization = (_membershipId: string) => {
    toast.success("User removed from organization");
  };

  const handleInviteToOrganization = async () => {
    setIsInviting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Invitation sent successfully");
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleSetActiveOrganization = (_organizationId: string) => {
    toast.success("Active organization updated");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getOrganizationTypeLabel = (type: string) => {
    switch (type) {
      case "cooperative":
        return "Cooperative";
      case "farmer_org":
        return "Farmer Org";
      case "supplier":
        return "Supplier";
      case "buyer":
        return "Buyer";
      default:
        return type;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      case "member":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Memberships
            </CardTitle>
            <CardDescription>
              Organizations this user belongs to, their roles, and team
              assignments
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={isInviting}
              onClick={handleInviteToOrganization}
              size="sm"
            >
              <Mail className="mr-2 h-4 w-4" />
              {isInviting ? "Inviting..." : "Invite to Organization"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {memberships.length === 0 ? (
          <div className="py-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-lg">No organizations</h3>
            <p className="mt-2 text-muted-foreground">
              This user is not a member of any organizations yet.
            </p>
            <Button
              className="mt-4"
              disabled={isInviting}
              onClick={handleInviteToOrganization}
            >
              <Plus className="mr-2 h-4 w-4" />
              Invite to Organization
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {membership.organizationName
                              .split(" ")
                              .map((word) => word.charAt(0))
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {membership.organizationName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {getOrganizationTypeLabel(
                              membership.organizationType
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(membership.role)}>
                        {membership.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {membership.teams.map((team) => (
                          <Badge
                            className="text-xs"
                            key={team}
                            variant="outline"
                          >
                            {team}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(membership.joinedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(membership.status)}>
                        {membership.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleSetRole(membership.id, "admin")
                            }
                          >
                            Set as Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleSetRole(membership.id, "manager")
                            }
                          >
                            Set as Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleSetRole(membership.id, "member")
                            }
                          >
                            Set as Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleAddToTeam(membership.id)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Add to Team
                          </DropdownMenuItem>
                          {membership.teams.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              {membership.teams.map((team) => (
                                <DropdownMenuItem
                                  className="text-muted-foreground"
                                  key={`remove-${team}`}
                                  onClick={() =>
                                    handleRemoveFromTeam(membership.id, team)
                                  }
                                >
                                  Remove from {team}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleSetActiveOrganization(
                                membership.organizationId
                              )
                            }
                          >
                            Set as Active
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleRemoveFromOrganization(membership.id)
                            }
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove from Organization
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
