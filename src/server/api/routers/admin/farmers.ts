import { TRPCError } from "@trpc/server";
import { count, eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

import { USER_STATUS } from "@/config/constants/auth";
import {
  district,
  farm as farmTable,
  farmer,
  member,
  organization,
  region,
  user,
} from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const adminRoleSet = new Set(["admin", "supportAdmin", "userAc"]);

const FARMER_ID_LENGTH = 8;

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

export const adminFarmersRouter = createTRPCRouter({
  // Create a new farmer with farms
  create: protectedProcedure
    .input(
      z.object({
        // Farmer basic info
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        gender: z.enum(["male", "female", "other"]).optional(),
        dateOfBirth: z.date().optional(),
        phone: z.string().optional(),
        isPhoneSmart: z.boolean().default(false),
        idNumber: z.string().optional(),
        idType: z
          .enum(["ghana_card", "voters_id", "passport", "drivers_license"])
          .optional(),
        address: z.string().optional(),
        districtId: z.string().optional(),
        community: z.string().optional(),
        householdSize: z.number().int().positive().optional(),
        isLeader: z.boolean().default(false),
        imgUrl: z.string().url({ message: "Invalid URL format" }).optional(),
        organizationId: z.string().min(1, "Organization is required"),
        // Farms
        farms: z
          .array(
            z.object({
              name: z.string().min(1, "Farm name is required"),
              acreage: z.number().positive().optional(),
              cropType: z.string().optional(),
              soilType: z
                .enum(["sandy", "clay", "loamy", "silt", "rocky"])
                .optional(),
              locationLat: z.number().optional(),
              locationLng: z.number().optional(),
            })
          )
          .default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const { farms, ...farmerData } = input;

      try {
        // Generate farmer ID
        const farmerId = nanoid();
        const pukparaId = `FRM-${farmerId.slice(0, FARMER_ID_LENGTH).toUpperCase()}`;

        // Create the farmer
        const [newFarmer] = await ctx.db
          .insert(farmer)
          .values({
            id: farmerId,
            pukparaId,
            ...farmerData,
            kycStatus: "pending",
          })
          .returning();

        // Create farms if provided
        const createdFarms: typeof farmTable.$inferInsert[] = [];
        if (farms.length > 0) {
          const farmRecords = farms.map((farmData) => ({
            id: nanoid(),
            farmerId,
            organizationId: input.organizationId,
            name: farmData.name,
            acreage: farmData.acreage ? farmData.acreage.toString() : null,
            cropType: farmData.cropType || null,
            soilType: farmData.soilType || null,
            locationLat: farmData.locationLat ? farmData.locationLat.toString() : null,
            locationLng: farmData.locationLng ? farmData.locationLng.toString() : null,
            status: "active" as const,
          }));

          const insertedFarms = await ctx.db
            .insert(farmTable)
            .values(farmRecords)
            .returning();

          createdFarms.push(...insertedFarms);
        }

        return {
          farmer: newFarmer,
          farms: createdFarms,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create farmer",
          cause: error,
        });
      }
    }),

  // Get districts for dropdown
  getDistricts: protectedProcedure.query(async ({ ctx }) => {
    ensurePlatformAdmin(ctx.session.user);

    try {
      const districts = await ctx.db
        .select({
          id: district.id,
          name: district.name,
          regionName: region.name,
        })
        .from(district)
        .leftJoin(region, eq(region.code, district.regionCode))
        .orderBy(district.name);

      return districts;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch districts",
        cause: error,
      });
    }
  }),

  // Get organizations for dropdown
  getOrganizations: protectedProcedure.query(async ({ ctx }) => {
    ensurePlatformAdmin(ctx.session.user);

    try {
      const organizations = await ctx.db
        .select({
          id: organization.id,
          name: organization.name,
          organizationType: organization.organizationType,
        })
        .from(organization)
        .orderBy(organization.name);

      return organizations;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organizations",
        cause: error,
      });
    }
  }),

  // Get all farmers for client-side filtering
  all: protectedProcedure.query(async ({ ctx }) => {
    ensurePlatformAdmin(ctx.session.user);

    try {
      const farmersData = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          phoneNumber: user.phoneNumber,
          phoneNumberVerified: user.phoneNumberVerified,
          role: user.role,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
          address: user.address,
          status: user.status,
          approvedAt: user.approvedAt,
          districtId: user.districtId,
          districtName: district.name,
          regionName: region.name,
          organizationCount: sql<number>`COUNT(DISTINCT ${member.organizationId})`,
          organizationNames: sql<
            string[]
          >`ARRAY_AGG(DISTINCT ${organization.name}) FILTER (WHERE ${organization.name} IS NOT NULL)`,
        })
        .from(user)
        .leftJoin(district, eq(district.id, user.districtId))
        .leftJoin(region, eq(region.code, district.regionCode))
        .leftJoin(member, eq(member.userId, user.id))
        .leftJoin(organization, eq(organization.id, member.organizationId))
        .groupBy(user.id, district.name, region.name)
        .orderBy(user.createdAt);

      return farmersData.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.emailVerified,
        image: row.image,
        createdAt: row.createdAt,
        phoneNumber: row.phoneNumber,
        phoneNumberVerified: row.phoneNumberVerified,
        role: row.role,
        banned: row.banned,
        banReason: row.banReason,
        banExpires: row.banExpires,
        address: row.address,
        status: row.status,
        approvedAt: row.approvedAt,
        districtName: row.districtName,
        regionName: row.regionName,
        organizationCount: Number(row.organizationCount ?? 0),
        organizationNames: row.organizationNames ?? [],
        // Mock farming-related data for now - you can extend the schema later
        farmSize: null,
        farmLocation: null,
        cropTypes: [],
        certifications: [],
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch farmers",
        cause: error,
      });
    }
  }),

  // Approve farmers
  approve: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().min(1)).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.userIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      const now = new Date();

      try {
        const usersToApprove = await ctx.db
          .select({ id: user.id, name: user.name })
          .from(user)
          .where(inArray(user.id, uniqueIds));

        if (usersToApprove.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await ctx.db
          .update(user)
          .set({ status: USER_STATUS.APPROVED, approvedAt: now })
          .where(inArray(user.id, uniqueIds));

        return { updated: usersToApprove.length };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to approve farmers",
          cause: error,
        });
      }
    }),

  // Reject farmers
  reject: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().min(1)).min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.userIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      try {
        await ctx.db
          .update(user)
          .set({ status: USER_STATUS.REJECTED })
          .where(inArray(user.id, uniqueIds));

        return { updated: uniqueIds.length };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reject farmers",
          cause: error,
        });
      }
    }),

  // Suspend farmers
  suspend: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().min(1)).min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.userIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      try {
        await ctx.db
          .update(user)
          .set({ status: USER_STATUS.SUSPENDED })
          .where(inArray(user.id, uniqueIds));

        return { updated: uniqueIds.length };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to suspend farmers",
          cause: error,
        });
      }
    }),

  // Ban farmers
  ban: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().min(1)).min(1),
        reason: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.userIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      try {
        await ctx.db
          .update(user)
          .set({
            banned: true,
            banReason: input.reason,
            banExpires: input.expiresAt,
          })
          .where(inArray(user.id, uniqueIds));

        return { updated: uniqueIds.length };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to ban farmers",
          cause: error,
        });
      }
    }),

  // Unban farmers
  unban: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().min(1)).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.userIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      try {
        await ctx.db
          .update(user)
          .set({
            banned: false,
            banReason: null,
            banExpires: null,
          })
          .where(inArray(user.id, uniqueIds));

        return { updated: uniqueIds.length };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unban farmers",
          cause: error,
        });
      }
    }),

  // Delete farmers
  delete: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().min(1)).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.userIds));

      if (uniqueIds.length === 0) {
        return { deleted: 0 };
      }

      try {
        await ctx.db.delete(user).where(inArray(user.id, uniqueIds));

        return { deleted: uniqueIds.length };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete farmers",
          cause: error,
        });
      }
    }),

  // Get farmer statistics
  stats: protectedProcedure.query(async ({ ctx }) => {
    ensurePlatformAdmin(ctx.session.user);

    try {
      const statusCounts = await ctx.db
        .select({
          status: user.status,
          count: count(),
        })
        .from(user)
        .groupBy(user.status);

      const statusMap = new Map<string, number>();
      for (const entry of statusCounts) {
        if (entry.status) {
          statusMap.set(entry.status, Number(entry.count ?? 0));
        }
      }

      const totalFarmers = Array.from(statusMap.values()).reduce(
        (total, currentCount) => total + currentCount,
        0
      );

      return {
        totalFarmers,
        approvedFarmers: statusMap.get(USER_STATUS.APPROVED) ?? 0,
        pendingFarmers: statusMap.get(USER_STATUS.PENDING) ?? 0,
        suspendedFarmers: statusMap.get(USER_STATUS.SUSPENDED) ?? 0,
        rejectedFarmers: statusMap.get(USER_STATUS.REJECTED) ?? 0,
        statusBreakdown: Object.values(USER_STATUS).map((status) => ({
          status,
          count: statusMap.get(status) ?? 0,
        })),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch farmer statistics",
        cause: error,
      });
    }
  }),
});
