"use client";

import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserDetailsContent } from "@/features/admin/users/components/user-details-content";
import { UserPageTitle } from "@/features/admin/users/components/user-page-title";

type UserDetailsPageProps = {
  userId: string;
};

export function UserDetailsPage({ userId }: UserDetailsPageProps) {
  // Mock user data - replace with actual API call
  const user = {
    id: userId,
    name: "John Doe",
    email: "john.doe@example.com",
    emailVerified: true,
    phoneNumber: "+233201234567",
    phoneNumberVerified: true,
    status: "pending" as "approved" | "pending" | "suspended",
    kycStatus: "verified" as const,
    role: "user" as const,
    banned: false,
    address: "123 Main Street, Accra",
    districtName: "Accra Metropolitan",
    regionName: "Greater Accra",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-20T14:30:00Z"),
    lastLogin: new Date("2024-01-20T14:30:00Z"),
    approvedAt: new Date("2024-01-16T09:00:00Z"),
    consentTermsAt: new Date("2024-01-15T10:30:00Z"),
    consentPrivacyAt: new Date("2024-01-15T10:30:00Z"),
    organizationCount: 2,
    organizationNames: ["Green Valley Cooperative", "Ashanti Farmers Group"],
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(user.email);
    toast.success("Email copied to clipboard");
  };

  const customTitle = (
    <div className="space-y-2">
      <h2 className="font-bold text-2xl text-foreground tracking-tight">
        {user.name}
      </h2>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{user.email}</span>
        <Button
          className="h-auto p-1"
          onClick={copyEmail}
          size="sm"
          variant="ghost"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const badgeDescription = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant={
          user.status === "approved"
            ? "default"
            : user.status === "pending"
              ? "secondary"
              : user.status === "suspended"
                ? "destructive"
                : "outline"
        }
      >
        {user.status}
      </Badge>
      <Badge
        variant={
          user.kycStatus === "verified"
            ? "default"
            : user.kycStatus === "pending"
              ? "secondary"
              : user.kycStatus === "rejected"
                ? "destructive"
                : "outline"
        }
      >
        KYC: {user.kycStatus}
      </Badge>
      {user.emailVerified && <Badge variant="outline">Email verified</Badge>}
      {user.phoneNumberVerified && (
        <Badge variant="outline">Phone verified</Badge>
      )}
      {user.role && user.role !== "user" && (
        <Badge variant="outline">{user.role}</Badge>
      )}
      {user.banned && <Badge variant="destructive">Banned</Badge>}
    </div>
  );

  return (
    <UserPageTitle
      action={{
        label: "Back to Users",
        href: "/admin/users",
        icon: ArrowLeft,
      }}
      breadcrumbs={[{ label: user.name }]}
      description={badgeDescription}
      title={user.name}
      titleContent={customTitle}
    >
      <UserDetailsContent userId={userId} />
    </UserPageTitle>
  );
}
