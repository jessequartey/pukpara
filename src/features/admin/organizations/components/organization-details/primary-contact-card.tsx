"use client";

import { Edit, Key, Mail, User, UserCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PrimaryContactCard() {
  // Mock data - replace with actual API call
  const primaryContact = {
    id: "user_123",
    name: "Kwame Asante",
    email: "kwame@greenvalley.coop",
    phone: "+233 24 567 8901",
    image: null,
    role: "owner" as const,
    status: "active" as const,
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge variant="default">Owner</Badge>;
      case "admin":
        return <Badge variant="secondary">Admin</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="flex items-start gap-4">
          <Avatar className="size-12">
            <AvatarImage
              alt={primaryContact.name}
              src={primaryContact.image || ""}
            />
            <AvatarFallback>{getInitials(primaryContact.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{primaryContact.name}</h4>
              {getRoleBadge(primaryContact.role)}
            </div>
            <p className="text-muted-foreground text-sm">
              {primaryContact.email}
            </p>
            <p className="text-muted-foreground text-sm">
              {primaryContact.phone}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline">
              <Edit className="mr-2 size-4" />
              Edit User
            </Button>
            <Button size="sm">
              <UserCheck className="mr-2 size-4" />
              Impersonate
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline">
              <Key className="mr-2 size-4" />
              Reset Password
            </Button>
            <Button size="sm" variant="outline">
              <Mail className="mr-2 size-4" />
              Resend Invite
            </Button>
          </div>
        </div>

        {/* Impersonation Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-start gap-2">
            <User className="mt-0.5 size-4 text-blue-600" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Impersonation</p>
              <p className="text-blue-700">
                Click "Impersonate" to log in as this user. You'll be redirected
                to their dashboard with admin privileges maintained.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
