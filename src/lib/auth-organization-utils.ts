import { randomUUID } from "node:crypto";
import {
  ORGANIZATION_MEMBER_ROLE,
  ORGANIZATION_TYPE,
} from "@/config/constants/auth";

const DEFAULT_ORGANIZATION_SUFFIX = "Organization" as const;
const SLUG_SUFFIX_LENGTH = 6;

export type OrganizationMetadata = {
  organizationName?: string;
  organizationSlug?: string;
  organizationType?: string;
  organizationSubType?: string;
  subscriptionType?: string;
  licenseStatus?: string;
  maxUsers?: number;
  contactEmail?: string;
  contactPhone?: string;
  billingEmail?: string;
  address?: string;
  districtId?: string;
  regionId?: string;
  source?: "admin" | "signup";
};

export type OrganizationCreationData = {
  name: string;
  slug: string;
  organizationType: string;
  [key: string]: unknown;
};

/**
 * Creates a URL-friendly slug from a given value
 */
export const createSlug = (value: string): string => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  return base.length > 0 ? base : "org";
};

/**
 * Generates a unique suffix for organization slugs
 */
export const generateSlugSuffix = (userId: string): string => {
  const suffixSource =
    userId.length > 0
      ? userId.slice(-SLUG_SUFFIX_LENGTH)
      : randomUUID().slice(0, SLUG_SUFFIX_LENGTH);

  const sanitizedSuffix = suffixSource.toLowerCase().replace(/[^a-z0-9]/g, "");

  return sanitizedSuffix.length > 0
    ? sanitizedSuffix
    : randomUUID().replace(/-/g, "").slice(0, SLUG_SUFFIX_LENGTH);
};

/**
 * Builds organization data for admin-created users with specific organization details
 */
export const buildAdminOrganizationData = (
  orgMetadata: OrganizationMetadata,
  now: Date
): OrganizationCreationData => {
  const organizationName = orgMetadata.organizationName;
  if (!organizationName) {
    throw new Error("Organization name is required for admin-created users");
  }
  const slug = orgMetadata.organizationSlug || createSlug(organizationName);
  const organizationType =
    orgMetadata.organizationType || ORGANIZATION_TYPE.FARMER_ORG;

  return {
    name: organizationName,
    slug,
    organizationType,
    createdAt: now,
    ...(orgMetadata.organizationSubType && {
      organizationSubType: orgMetadata.organizationSubType,
    }),
    ...(orgMetadata.subscriptionType && {
      subscriptionType: orgMetadata.subscriptionType,
    }),
    ...(orgMetadata.licenseStatus && {
      licenseStatus: orgMetadata.licenseStatus,
    }),
    ...(orgMetadata.maxUsers && { maxUsers: orgMetadata.maxUsers }),
    ...(orgMetadata.contactEmail && {
      contactEmail: orgMetadata.contactEmail,
    }),
    ...(orgMetadata.contactPhone && {
      contactPhone: orgMetadata.contactPhone,
    }),
    ...(orgMetadata.billingEmail && {
      billingEmail: orgMetadata.billingEmail,
    }),
    ...(orgMetadata.address && { address: orgMetadata.address }),
    ...(orgMetadata.districtId && {
      districtId: orgMetadata.districtId,
    }),
    ...(orgMetadata.regionId && { regionId: orgMetadata.regionId }),
  };
};

/**
 * Builds default organization data for regular sign-up users
 */
export const buildDefaultOrganizationData = (
  displayName: string,
  userId: string,
  now: Date
): OrganizationCreationData => {
  const organizationName =
    `${displayName} ${DEFAULT_ORGANIZATION_SUFFIX}`.trim();
  const baseSlug = createSlug(displayName);
  const suffix = generateSlugSuffix(userId);
  const slug = `${baseSlug}-${suffix}`;

  return {
    name: organizationName,
    slug,
    organizationType: ORGANIZATION_TYPE.FARMER_ORG,
    createdAt: now,
  };
};

/**
 * Creates organization and membership records in a database transaction
 */
export const createOrganizationWithMembership = async (
  authContext: Record<string, unknown>,
  organizationData: OrganizationCreationData,
  userId: string,
  now: Date
): Promise<void> => {
  const context = authContext as {
    generateId: (options: { model: string }) => string | false;
    adapter: {
      transaction: (
        callback: (transaction: Record<string, unknown>) => Promise<void>
      ) => Promise<void>;
    };
  };

  const organizationId =
    context.generateId({ model: "organization" }) ||
    `org_${randomUUID().replace(/-/g, "")}`;
  const memberId =
    context.generateId({ model: "member" }) ||
    `mem_${randomUUID().replace(/-/g, "")}`;

  await context.adapter.transaction(
    async (transaction: Record<string, unknown>) => {
      const transactionAdapter = transaction as {
        create: (options: {
          model: string;
          data: Record<string, unknown>;
        }) => Promise<void>;
      };

      await transactionAdapter.create({
        model: "organization",
        data: {
          id: organizationId,
          ...organizationData,
        },
      });

      await transactionAdapter.create({
        model: "member",
        data: {
          id: memberId,
          organizationId,
          userId,
          role: ORGANIZATION_MEMBER_ROLE.OWNER,
          createdAt: now,
        },
      });
    }
  );
};

/**
 * Checks if a new organization should be created for the user
 */
export const shouldCreateOrganization = async (
  authContext: Record<string, unknown> | undefined,
  userId: string | undefined
): Promise<boolean> => {
  if (!authContext) {
    return false;
  }

  if (!userId) {
    return false;
  }

  const context = authContext as {
    adapter: {
      findMany: (options: Record<string, unknown>) => Promise<unknown[]>;
    };
  };

  const existingMembership = await context.adapter.findMany({
    model: "member",
    where: [{ field: "userId", value: userId }],
    limit: 1,
  });

  return existingMembership.length === 0;
};
