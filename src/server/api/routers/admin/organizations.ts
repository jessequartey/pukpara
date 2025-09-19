import { TRPCError } from "@trpc/server";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import {
  ORGANIZATION_MEMBER_ROLE,
  ORGANIZATION_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  USER_STATUS,
} from "@/config/constants/auth";
import { auth } from "@/lib/auth";
import {
  district,
  member,
  organization,
  region,
  user,
} from "@/server/db/schema";
import { sendOrganizationApprovedEmail } from "@/server/email/resend";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

const adminRoleSet = new Set(["admin", "supportAdmin", "userAc"]);

const ensurePlatformAdmin = (sessionUser: unknown) => {
  if (!sessionUser || typeof sessionUser !== "object") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  const raw = sessionUser as Record<string, unknown>;
  const directRole = typeof raw.role === "string" ? raw.role : null;
  const arrayRoles = Array.isArray(raw.roles)
    ? raw.roles.filter((role): role is string => typeof role === "string")
    : [];
  const adminRolesRaw =
    raw.admin && typeof raw.admin === "object"
      ? (raw.admin as Record<string, unknown>).roles
      : undefined;
  const pluginRoles = Array.isArray(adminRolesRaw)
    ? adminRolesRaw.filter((role): role is string => typeof role === "string")
    : [];
  const roles = [directRole, ...arrayRoles, ...pluginRoles].filter(
    (role): role is string => typeof role === "string" && role.length > 0
  );

  const hasRole = roles.some((role) => adminRoleSet.has(role));

  if (!hasRole) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
};

const buildOnboardingUrl = (orgId: string) => {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalizedBase}/organizations/${orgId}/onboarding`;
};

export const adminOrganizationsRouter = createTRPCRouter({
  // Get all organizations for client-side filtering
  all: protectedProcedure.query(async ({ ctx }) => {
    ensurePlatformAdmin(ctx.session.user);

    try {
      const organizationsData = await ctx.db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          status: organization.status,
          kycStatus: organization.kycStatus,
          licenseStatus: organization.licenseStatus,
          subscriptionType: organization.subscriptionType,
          organizationType: organization.organizationType,
          organizationSubType: organization.organizationSubType,
          maxUsers: organization.maxUsers,
          createdAt: organization.createdAt,
          contactEmail: organization.contactEmail,
          contactPhone: organization.contactPhone,
          address: organization.address,
          regionId: organization.regionId,
          districtId: organization.districtId,
          regionName: region.name,
          districtName: district.name,
          memberCount: sql<number>`COUNT(DISTINCT ${member.id})`,
          ownerId: sql<
            string | null
          >`MAX(CASE WHEN ${member.role} = 'owner' THEN ${user.id} END)`,
          ownerName: sql<
            string | null
          >`MAX(CASE WHEN ${member.role} = 'owner' THEN ${user.name} END)`,
          ownerEmail: sql<
            string | null
          >`MAX(CASE WHEN ${member.role} = 'owner' THEN ${user.email} END)`,
        })
        .from(organization)
        .leftJoin(region, eq(region.code, organization.regionId))
        .leftJoin(district, eq(district.id, organization.districtId))
        .leftJoin(member, eq(member.organizationId, organization.id))
        .leftJoin(user, eq(user.id, member.userId))
        .groupBy(organization.id, region.name, district.name)
        .orderBy(organization.createdAt);

      return organizationsData.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        status: row.status,
        kycStatus: row.kycStatus,
        licenseStatus: row.licenseStatus,
        subscriptionType: row.subscriptionType,
        organizationType: row.organizationType,
        organizationSubType: row.organizationSubType,
        maxUsers: row.maxUsers,
        createdAt: row.createdAt,
        contactEmail: row.contactEmail,
        contactPhone: row.contactPhone,
        address: row.address,
        regionId: row.regionId,
        districtId: row.districtId,
        memberCount: Number(row.memberCount ?? 0),
        regionName: row.regionName,
        districtName: row.districtName,
        owner:
          row.ownerId && row.ownerName && row.ownerEmail
            ? {
                id: row.ownerId,
                name: row.ownerName,
                email: row.ownerEmail,
              }
            : null,
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organizations",
        cause: error,
      });
    }
  }),

  // Get organization details by ID
  detail: protectedProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const detailRows = await ctx.db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          status: organization.status,
          kycStatus: organization.kycStatus,
          licenseStatus: organization.licenseStatus,
          subscriptionType: organization.subscriptionType,
          organizationType: organization.organizationType,
          organizationSubType: organization.organizationSubType,
          contactEmail: organization.contactEmail,
          contactPhone: organization.contactPhone,
          address: organization.address,
          districtId: organization.districtId,
          regionId: organization.regionId,
          defaultCurrency: organization.defaultCurrency,
          timezone: organization.timezone,
          planRenewsAt: organization.planRenewsAt,
          maxUsers: organization.maxUsers,
          createdAt: organization.createdAt,
          metadata: organization.metadata,
        })
        .from(organization)
        .where(eq(organization.id, input.organizationId))
        .limit(1);

      const detail = detailRows.at(0);

      if (!detail) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const memberCountRows = await ctx.db
        .select({ value: count() })
        .from(member)
        .where(eq(member.organizationId, input.organizationId));

      const memberCountValue = memberCountRows.at(0)?.value ?? 0;

      const leadership = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: member.role,
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(
          and(
            eq(member.organizationId, input.organizationId),
            inArray(member.role, [
              ORGANIZATION_MEMBER_ROLE.OWNER,
              ORGANIZATION_MEMBER_ROLE.ADMIN,
            ])
          )
        );

      return {
        organization: detail,
        stats: {
          memberCount: memberCountValue,
        },
        leadership,
      };
    }),

  // Update organization
  update: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        organizationType: z.string().optional(),
        organizationSubType: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        address: z.string().optional(),
        regionId: z.string().optional(),
        districtId: z.string().optional(),
        subscriptionType: z.string().optional(),
        maxUsers: z.number().int().positive().optional(),
        status: z.string().optional(),
        kycStatus: z.string().optional(),
        licenseStatus: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const { organizationId, ...updateData } = input;

      // Remove undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(cleanedData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      await ctx.db
        .update(organization)
        .set(cleanedData)
        .where(eq(organization.id, organizationId));

      return { success: true };
    }),

  // Approve organizations
  approve: protectedProcedure
    .input(
      z.object({
        organizationIds: z.array(z.string().min(1)).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.organizationIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      const now = new Date();

      const result = await ctx.db.transaction(async (tx) => {
        const organizationsToApprove = await tx
          .select({ id: organization.id, name: organization.name })
          .from(organization)
          .where(inArray(organization.id, uniqueIds));

        if (organizationsToApprove.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await tx
          .update(organization)
          .set({ status: ORGANIZATION_STATUS.ACTIVE })
          .where(inArray(organization.id, uniqueIds));

        const membersForOrganizations = await tx
          .select({
            organizationId: member.organizationId,
            userId: member.userId,
            role: member.role,
          })
          .from(member)
          .where(inArray(member.organizationId, uniqueIds));

        const memberUserIds = Array.from(
          new Set(membersForOrganizations.map((row) => row.userId))
        );

        if (memberUserIds.length > 0) {
          await tx
            .update(user)
            .set({ status: USER_STATUS.APPROVED, approvedAt: now })
            .where(inArray(user.id, memberUserIds));
        }

        return {
          organizationsToApprove,
          membersForOrganizations,
        };
      });

      // Send approval emails
      const roleWhitelist = new Set([
        ORGANIZATION_MEMBER_ROLE.OWNER,
        ORGANIZATION_MEMBER_ROLE.ADMIN,
      ]);

      const recipientsByOrganization = new Map<
        string,
        Array<{ id: string; role: string }>
      >();

      for (const entry of result.membersForOrganizations) {
        if (!roleWhitelist.has(entry.role as "owner" | "admin")) {
          continue;
        }
        const bucket = recipientsByOrganization.get(entry.organizationId) ?? [];
        bucket.push({ id: entry.userId, role: entry.role });
        recipientsByOrganization.set(entry.organizationId, bucket);
      }

      const userIdsToFetch = Array.from(
        new Set(
          Array.from(recipientsByOrganization.values()).flatMap((entries) =>
            entries.map((entry) => entry.id)
          )
        )
      );

      const usersById = new Map<
        string,
        { id: string; email: string | null; name: string | null }
      >();

      if (userIdsToFetch.length > 0) {
        const records = await ctx.db
          .select({ id: user.id, email: user.email, name: user.name })
          .from(user)
          .where(inArray(user.id, userIdsToFetch));

        for (const record of records) {
          usersById.set(record.id, record);
        }
      }

      await Promise.allSettled(
        result.organizationsToApprove.map(async (org) => {
          const recipients = recipientsByOrganization.get(org.id);

          if (!recipients || recipients.length === 0) {
            return;
          }

          const onboardingUrl = buildOnboardingUrl(org.id);

          await Promise.all(
            recipients.map(async (recipient) => {
              const userRecord = usersById.get(recipient.id);
              if (!userRecord?.email) {
                return;
              }

              await sendOrganizationApprovedEmail({
                email: userRecord.email,
                organizationName: org.name,
                onboardingUrl,
                recipientName: userRecord.name ?? undefined,
              });
            })
          );
        })
      );

      return { updated: result.organizationsToApprove.length };
    }),

  // Suspend organizations
  suspend: protectedProcedure
    .input(
      z.object({
        organizationIds: z.array(z.string().min(1)).min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.organizationIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      await ctx.db
        .update(organization)
        .set({
          status: ORGANIZATION_STATUS.SUSPENDED,
          metadata: input.reason
            ? JSON.stringify({ suspensionReason: input.reason })
            : null,
        })
        .where(inArray(organization.id, uniqueIds));

      return { updated: uniqueIds.length };
    }),

  // Delete organizations
  delete: protectedProcedure
    .input(
      z.object({
        organizationIds: z.array(z.string().min(1)).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.organizationIds));

      if (uniqueIds.length === 0) {
        return { deleted: 0 };
      }

      await ctx.db
        .delete(organization)
        .where(inArray(organization.id, uniqueIds));

      return { deleted: uniqueIds.length };
    }),

  // Get subscription statistics
  subscriptions: protectedProcedure.query(async ({ ctx }) => {
    ensurePlatformAdmin(ctx.session.user);

    const totals = await ctx.db
      .select({
        type: organization.subscriptionType,
        count: count(),
      })
      .from(organization)
      .groupBy(organization.subscriptionType);

    const map = new Map<string, number>();

    for (const entry of totals) {
      const key = entry.type ?? ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM;
      map.set(key, Number(entry.count ?? 0));
    }

    return {
      totals: Object.values(ORGANIZATION_SUBSCRIPTION_TYPE).map((type) => ({
        type,
        count: map.get(type) ?? 0,
      })),
    };
  }),

  // Get general statistics
  stats: protectedProcedure.query(async ({ ctx }) => {
    ensurePlatformAdmin(ctx.session.user);

    const statusCounts = await ctx.db
      .select({
        status: organization.status,
        count: count(),
      })
      .from(organization)
      .groupBy(organization.status);

    const statusMap = new Map<string, number>();
    for (const entry of statusCounts) {
      if (entry.status) {
        statusMap.set(entry.status, Number(entry.count ?? 0));
      }
    }

    const totalOrganizations = Array.from(statusMap.values()).reduce(
      (total, currentCount) => total + currentCount,
      0
    );

    return {
      totalOrganizations,
      activeOrganizations: statusMap.get(ORGANIZATION_STATUS.ACTIVE) ?? 0,
      pendingOrganizations: statusMap.get(ORGANIZATION_STATUS.PENDING) ?? 0,
      suspendedOrganizations: statusMap.get(ORGANIZATION_STATUS.SUSPENDED) ?? 0,
      statusBreakdown: Object.values(ORGANIZATION_STATUS).map((status) => ({
        status,
        count: statusMap.get(status) ?? 0,
      })),
    };
  }),

  // Create new user workspace (user + organization)
  createNewUserWorkspace: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phoneNumber: z.string().min(1),
        districtId: z.string().min(1),
        address: z.string().min(1),
        organizationName: z.string().min(1),
        organizationType: z.string().min(1),
        organizationSubType: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        regionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      try {
        const fullName = `${input.firstName} ${input.lastName}`
          .trim()
          .replace(/\s+/g, " ");

        // Create user using better-auth with generic password
        const userResult = await auth.api.signUpEmail({
          body: {
            name: fullName,
            email: input.email,
            password: "secretpass",
            phoneNumber: input.phoneNumber,
            districtId: input.districtId,
            address: input.address,
          },
        });

        if (!userResult.user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create user",
          });
        }

        const districtData = await ctx.db.query.district.findFirst({
          where: eq(district.id, input.districtId),
        });

        // Create organization for the user using better-auth organization plugin
        try {
          const organizationResult = await auth.api.createOrganization({
            body: {
              organizationType: input.organizationType,
              status: ORGANIZATION_STATUS.PENDING,
              name: input.organizationName,
              slug: `${input.organizationName.toLowerCase().split(" ").join("-")}-${userResult.user.id}`,
              userId: userResult.user.id,
              districtId: input.districtId,
              regionId: input.regionId || districtData?.regionCode,
              address: input.address,
              contactEmail: input.contactEmail || input.email,
              contactPhone: input.contactPhone || input.phoneNumber,
              organizationSubType: input.organizationSubType,
            },
          });

          return {
            success: true,
            user: userResult.user,
            organization: organizationResult,
          };
        } catch (orgError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User created but failed to create organization",
            cause: orgError,
          });
        }
      } catch (error) {
        // Handle database constraint errors
        if (error && typeof error === "object" && "cause" in error) {
          const dbError = error.cause as {
            code?: string;
            constraint?: string;
            detail?: string;
          };
          if (
            dbError?.code === "23505" &&
            dbError?.constraint?.includes("phone_number")
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "An account with this phone number already exists. Try signing in or use a different number.",
              cause: error,
            });
          }
        }

        // Re-throw TRPCError as-is
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle other errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create user workspace right now.",
          cause: error,
        });
      }
    }),

  // List users for async select (search functionality)
  listUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      try {
        // Get all users from database
        const users = await ctx.db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: user.status,
            districtId: user.districtId,
            address: user.address,
          })
          .from(user)
          .orderBy(user.name);

        // Filter users locally based on query if provided
        if (input.query?.trim()) {
          const query = input.query.toLowerCase().trim();
          return users.filter(
            (userItem) =>
              userItem.name?.toLowerCase().includes(query) ||
              userItem.email?.toLowerCase().includes(query) ||
              userItem.phoneNumber?.toLowerCase().includes(query)
          );
        }

        return users;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users",
          cause: error,
        });
      }
    }),

  // Add organization to existing user
  addOrganizationToUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        organizationName: z.string().min(1),
        organizationType: z.string().min(1),
        organizationSubType: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        address: z.string().optional(),
        districtId: z.string().optional(),
        regionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      try {
        // Get user details
        const userData = await ctx.db.query.user.findFirst({
          where: eq(user.id, input.userId),
          columns: {
            id: true,
            name: true,
            email: true,
            address: true,
            districtId: true,
          },
        });

        if (!userData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Get district data if not provided
        let regionId = input.regionId;
        if (!regionId && (input.districtId || userData.districtId)) {
          const districtData = await ctx.db.query.district.findFirst({
            where: eq(district.id, input.districtId || userData.districtId),
            columns: {
              regionCode: true,
            },
          });
          regionId = districtData?.regionCode;
        }

        // Create organization using better-auth organization plugin
        const organizationResult = await auth.api.createOrganization({
          body: {
            organizationType: input.organizationType,
            status: ORGANIZATION_STATUS.PENDING,
            name: input.organizationName,
            slug: `${input.organizationName.toLowerCase().split(" ").join("-")}-${userData.id}`,
            userId: userData.id,
            districtId: input.districtId || userData.districtId,
            regionId,
            address: input.address || userData.address,
            contactEmail: input.contactEmail || userData.email,
            contactPhone: input.contactPhone,
            organizationSubType: input.organizationSubType,
          },
        });

        return {
          success: true,
          organization: organizationResult,
          user: userData,
        };
      } catch (error) {
        // Re-throw TRPCError as-is
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle other errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create organization for user right now.",
          cause: error,
        });
      }
    }),
});
