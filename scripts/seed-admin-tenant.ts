import { randomUUID } from "node:crypto";
import process from "node:process";
import { and, eq } from "drizzle-orm";
import {
  ORGANIZATION_KYC_STATUS,
  ORGANIZATION_LICENSE_STATUS,
  ORGANIZATION_MEMBER_ROLE,
  ORGANIZATION_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  ORGANIZATION_TYPE,
  USER_KYC_STATUS,
  USER_STATUS,
} from "../src/config/constants/auth";
import { auth } from "../src/lib/auth";
import { db } from "../src/server/db";
import { district, member, organization, user } from "../src/server/db/schema";

const ADMIN_USER = {
  email: "admin@wamiagro.com",
  password: "superkey",
  name: "Platform Admin",
  phoneNumber: "+233200000001",
  address: "HQ Seeded Address",
};

const TENANT_USER = {
  email: "tenant@wamiagro.com",
  password: "superkey",
  name: "Tenant Administrator",
  phoneNumber: "+233200000002",
  address: "Tenant Seeded Address",
};

const TENANT_ORGANIZATION = {
  name: "Wami Agro Cooperative",
  slug: "wamiagro-demo",
  contactEmail: TENANT_USER.email,
  contactPhone: TENANT_USER.phoneNumber,
  address: TENANT_USER.address,
};

async function ensureDistrictId() {
  const existing = await db
    .select({ id: district.id, regionCode: district.regionCode })
    .from(district)
    .limit(1);

  if (existing.length === 0) {
    throw new Error(
      "No districts found. Please run `pnpm tsx scripts/seed-districts.ts` before seeding users."
    );
  }

  return existing[0];
}

async function upsertUserAccount({
  email,
  password,
  name,
  phoneNumber,
  address,
  role,
  districtId,
}: {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  address: string;
  role: string;
  districtId: string;
}) {
  // Use better-auth's signup API to create accounts properly
  try {
    const signupResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        phoneNumber,
        districtId,
        address,
      },
    });

    const userId = signupResult.user?.id;
    if (!userId) {
      throw new Error(`Failed to create user ${email}`);
    }

    // Update user with additional fields that signup might not handle
    await db
      .update(user)
      .set({
        role,
        emailVerified: true,
        phoneNumberVerified: true,
        kycStatus: USER_KYC_STATUS.VERIFIED,
        status: USER_STATUS.APPROVED,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    return { id: userId };
  } catch (error) {
    // If user already exists, try to update
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      await db
        .update(user)
        .set({
          name,
          phoneNumber,
          phoneNumberVerified: true,
          role,
          districtId,
          address,
          status: USER_STATUS.APPROVED,
          approvedAt: existingUser.approvedAt ?? new Date(),
          updatedAt: new Date(),
          kycStatus: existingUser.kycStatus ?? USER_KYC_STATUS.VERIFIED,
          emailVerified: true,
        })
        .where(eq(user.id, existingUser.id));

      return { id: existingUser.id };
    }

    throw error;
  }
}

async function upsertOrganization({
  name,
  slug,
  contactEmail,
  contactPhone,
  address,
  districtId,
  regionCode,
}: {
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  districtId: string;
  regionCode: string;
}) {
  const existing = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
  });

  const now = new Date();

  if (existing) {
    await db
      .update(organization)
      .set({
        name,
        contactEmail,
        contactPhone,
        address,
        districtId,
        regionId: regionCode,
        status: ORGANIZATION_STATUS.ACTIVE,
        kycStatus: ORGANIZATION_KYC_STATUS.VERIFIED,
        licenseStatus: ORGANIZATION_LICENSE_STATUS.ISSUED,
        subscriptionType: ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM,
      })
      .where(eq(organization.id, existing.id));

    return existing.id;
  }

  const orgId = randomUUID();

  await db.insert(organization).values({
    id: orgId,
    name,
    slug,
    createdAt: now,
    contactEmail,
    contactPhone,
    address,
    districtId,
    regionId: regionCode,
    status: ORGANIZATION_STATUS.ACTIVE,
    subscriptionType: ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM,
    licenseStatus: ORGANIZATION_LICENSE_STATUS.ISSUED,
    organizationType: ORGANIZATION_TYPE.FARMER_ORG,
    kycStatus: ORGANIZATION_KYC_STATUS.VERIFIED,
  });

  return orgId;
}

async function ensureMembership(userId: string, organizationId: string) {
  const existing = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  if (existing) {
    await db
      .update(member)
      .set({
        organizationId,
        role: ORGANIZATION_MEMBER_ROLE.OWNER,
        updatedAt: new Date(),
      })
      .where(eq(member.id, existing.id));
    return;
  }

  await db.insert(member).values({
    id: randomUUID(),
    organizationId,
    userId,
    role: ORGANIZATION_MEMBER_ROLE.OWNER,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function main() {
  const { id: districtId, regionCode } = await ensureDistrictId();

  const admin = await upsertUserAccount({
    ...ADMIN_USER,
    role: "admin",
    districtId,
  });

  console.info("Seeded platform admin", {
    email: ADMIN_USER.email,
    userId: admin.id,
  });

  const tenantOrgId = await upsertOrganization({
    ...TENANT_ORGANIZATION,
    districtId,
    regionCode,
  });

  const tenant = await upsertUserAccount({
    ...TENANT_USER,
    role: "user",
    districtId,
  });

  await ensureMembership(tenant.id, tenantOrgId);

  console.info("Seeded tenant admin", {
    email: TENANT_USER.email,
    userId: tenant.id,
    organizationId: tenantOrgId,
  });
}

main()
  .then(() => {
    console.info("Seeding complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  });
