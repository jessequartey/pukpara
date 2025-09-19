"use client";

import { Users, Plus, MoreHorizontal, Crown, UserCheck, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type GroupMembershipsCardProps = {
  farmerId: string;
};

type TeamMembership = {
  id: string;
  teamName: string;
  role: "chair" | "secretary" | "member";
  joinedAt: string;
  status: "active" | "inactive";
};

export function GroupMembershipsCard({ farmerId }: GroupMembershipsCardProps) {
  // Mock team memberships data - replace with actual API call
  const memberships: TeamMembership[] = [
    {
      id: "1",
      teamName: "Mampong Cocoa Farmers Association",
      role: "chair",
      joinedAt: "2023-01-15T10:30:00Z",
      status: "active",
    },
    {
      id: "2",
      teamName: "Ashanti Regional VSLA Group",
      role: "member",
      joinedAt: "2023-03-20T14:45:00Z",
      status: "active",
    },
    {
      id: "3",
      teamName: "Young Farmers Network",
      role: "secretary",
      joinedAt: "2023-06-10T09:15:00Z",
      status: "active",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "chair":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "secretary":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "chair":
        return "default";
      case "secretary":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (memberships.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group/Team Memberships
            </CardTitle>
            <CardDescription>
              Teams and groups this farmer belongs to
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add to Team
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-medium">No Team Memberships</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              This farmer is not currently a member of any teams or groups.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add to Team
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group/Team Memberships
          </CardTitle>
          <CardDescription>
            Teams and groups this farmer belongs to ({memberships.length})
          </CardDescription>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add to Team
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((membership) => (
              <TableRow key={membership.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{membership.teamName}</span>
                    {membership.status === "inactive" && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(membership.role)}
                    <Badge variant={getRoleVariant(membership.role)}>
                      {membership.role}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(membership.joinedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem>View Team</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}