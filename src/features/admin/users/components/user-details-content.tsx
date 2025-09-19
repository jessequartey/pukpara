"use client";

import { AccountStatusComplianceCard } from "./user-details/account-status-compliance-card";
import { OrganizationMembershipsCard } from "./user-details/organization-memberships-card";
import { ProfileContactCard } from "./user-details/profile-contact-card";

type UserDetailsContentProps = {
  userId: string;
};

export function UserDetailsContent({ userId }: UserDetailsContentProps) {
  // Mock user data - replace with actual API call
  const _user = {
    id: userId,
    name: "John Doe",
    email: "john.doe@example.com",
    emailVerified: true,
    phoneNumber: "+233201234567",
    phoneNumberVerified: true,
    status: "pending" as const,
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

  return (
    <div className="space-y-6">
      {/* Row 1: Profile & Account Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileContactCard userId={userId} />
        <AccountStatusComplianceCard userId={userId} />
      </div>

      {/* Row 2: Organization Memberships - Full Width */}
      <OrganizationMembershipsCard userId={userId} />
    </div>
  );
}
