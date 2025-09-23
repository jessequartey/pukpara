export const USER_STATUS = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
	SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_KYC_STATUS = {
	UNVERIFIED: "unverified",
	PENDING: "pending",
	VERIFIED: "verified",
	REJECTED: "rejected",
} as const;

export type UserKycStatus =
	(typeof USER_KYC_STATUS)[keyof typeof USER_KYC_STATUS];

export const ORGANIZATION_STATUS = {
	PENDING: "pending",
	ACTIVE: "active",
	SUSPENDED: "suspended",
} as const;

export type OrganizationStatus =
	(typeof ORGANIZATION_STATUS)[keyof typeof ORGANIZATION_STATUS];

export const ORGANIZATION_KYC_STATUS = {
	PENDING: "pending",
	VERIFIED: "verified",
	REJECTED: "rejected",
} as const;

export type OrganizationKycStatus =
	(typeof ORGANIZATION_KYC_STATUS)[keyof typeof ORGANIZATION_KYC_STATUS];

export const ORGANIZATION_LICENSE_STATUS = {
	ISSUED: "issued",
	EXPIRED: "expired",
	REVOKED: "revoked",
} as const;

export type OrganizationLicenseStatus =
	(typeof ORGANIZATION_LICENSE_STATUS)[keyof typeof ORGANIZATION_LICENSE_STATUS];

export const ORGANIZATION_SUBSCRIPTION_TYPE = {
	FREEMIUM: "freemium",
	PAID: "paid",
	ENTERPRISE: "enterprise",
} as const;

export type OrganizationSubscriptionType =
	(typeof ORGANIZATION_SUBSCRIPTION_TYPE)[keyof typeof ORGANIZATION_SUBSCRIPTION_TYPE];

export const ORGANIZATION_TYPE = {
	FARMER_ORG: "FARMER_ORG",
	SUPPLIER: "SUPPLIER",
	FINANCIAL: "FINANCIAL",
	BUYER: "BUYER",
} as const;

export type OrganizationType =
	(typeof ORGANIZATION_TYPE)[keyof typeof ORGANIZATION_TYPE];

export const ORGANIZATION_MEMBER_ROLE = {
	OWNER: "owner",
	ADMIN: "admin",
	MEMBER: "member",
} as const;

export type OrganizationMemberRole =
	(typeof ORGANIZATION_MEMBER_ROLE)[keyof typeof ORGANIZATION_MEMBER_ROLE];

export const PASSWORD_PROVIDER_ID = "email";
