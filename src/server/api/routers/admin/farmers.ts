import { TRPCError } from "@trpc/server";
import { count, eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

import {
  district,
  farmer,
  farm as farmTable,
  organization,
  region,
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
        const createdFarms: (typeof farmTable.$inferInsert)[] = [];
        if (farms.length > 0) {
          const farmRecords = farms.map((farmData) => ({
            id: nanoid(),
            farmerId,
            organizationId: input.organizationId,
            name: farmData.name,
            acreage: farmData.acreage ? farmData.acreage.toString() : null,
            cropType: farmData.cropType || null,
            soilType: farmData.soilType || null,
            locationLat: farmData.locationLat
              ? farmData.locationLat.toString()
              : null,
            locationLng: farmData.locationLng
              ? farmData.locationLng.toString()
              : null,
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
          slug: organization.slug,
          organizationType: organization.organizationType,
          memberCount: sql<number>`COUNT(DISTINCT ${farmer.id})`,
        })
        .from(organization)
        .leftJoin(farmer, eq(farmer.organizationId, organization.id))
        .groupBy(
          organization.id,
          organization.name,
          organization.slug,
          organization.organizationType
        )
        .orderBy(organization.name);

      return organizations.map((org) => ({
        ...org,
        memberCount: Number(org.memberCount ?? 0),
      }));
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
          id: farmer.id,
          pukparaId: farmer.pukparaId,
          firstName: farmer.firstName,
          lastName: farmer.lastName,
          gender: farmer.gender,
          dateOfBirth: farmer.dateOfBirth,
          phone: farmer.phone,
          isPhoneSmart: farmer.isPhoneSmart,
          idNumber: farmer.idNumber,
          idType: farmer.idType,
          address: farmer.address,
          community: farmer.community,
          householdSize: farmer.householdSize,
          isLeader: farmer.isLeader,
          imgUrl: farmer.imgUrl,
          kycStatus: farmer.kycStatus,
          createdAt: farmer.createdAt,
          updatedAt: farmer.updatedAt,
          districtId: farmer.districtId,
          districtName: district.name,
          regionName: region.name,
          organizationId: farmer.organizationId,
          organizationName: organization.name,
          farmCount: sql<number>`COUNT(DISTINCT ${farmTable.id})`,
          totalAcreage: sql<number>`COALESCE(SUM(CAST(${farmTable.acreage} AS DECIMAL)), 0)`,
        })
        .from(farmer)
        .leftJoin(district, eq(district.id, farmer.districtId))
        .leftJoin(region, eq(region.code, district.regionCode))
        .leftJoin(organization, eq(organization.id, farmer.organizationId))
        .leftJoin(farmTable, eq(farmTable.farmerId, farmer.id))
        .where(eq(farmer.isDeleted, false))
        .groupBy(
          farmer.id,
          farmer.pukparaId,
          farmer.firstName,
          farmer.lastName,
          farmer.gender,
          farmer.dateOfBirth,
          farmer.phone,
          farmer.isPhoneSmart,
          farmer.idNumber,
          farmer.idType,
          farmer.address,
          farmer.community,
          farmer.householdSize,
          farmer.isLeader,
          farmer.imgUrl,
          farmer.kycStatus,
          farmer.createdAt,
          farmer.updatedAt,
          farmer.districtId,
          district.name,
          region.name,
          farmer.organizationId,
          organization.name
        )
        .orderBy(farmer.createdAt);

      return farmersData.map((row) => ({
        id: row.id,
        pukparaId: row.pukparaId || "",
        name: `${row.firstName} ${row.lastName}`,
        firstName: row.firstName,
        lastName: row.lastName,
        gender: row.gender,
        dateOfBirth: row.dateOfBirth,
        phone: row.phone,
        isPhoneSmart: row.isPhoneSmart ?? false,
        idNumber: row.idNumber,
        idType: row.idType,
        address: row.address || "",
        community: row.community,
        householdSize: row.householdSize,
        isLeader: row.isLeader ?? false,
        imgUrl: row.imgUrl,
        kycStatus: row.kycStatus || "pending",
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        districtId: row.districtId,
        districtName: row.districtName,
        regionName: row.regionName,
        organizationId: row.organizationId,
        organizationName: row.organizationName,
        farmCount: Number(row.farmCount ?? 0),
        totalAcreage: Number(row.totalAcreage ?? 0),
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch farmers",
        cause: error,
      });
    }
  }),

  // Approve farmers (update KYC status to verified)
  approve: protectedProcedure
    .input(
      z.object({
        farmerIds: z.array(z.string().min(1)).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.farmerIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      try {
        const farmersToApprove = await ctx.db
          .select({
            id: farmer.id,
            firstName: farmer.firstName,
            lastName: farmer.lastName,
          })
          .from(farmer)
          .where(inArray(farmer.id, uniqueIds));

        if (farmersToApprove.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await ctx.db
          .update(farmer)
          .set({ kycStatus: "verified" })
          .where(inArray(farmer.id, uniqueIds));

        return { updated: farmersToApprove.length };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to approve farmers",
          cause: error,
        });
      }
    }),

  // Reject farmers (update KYC status to rejected)
  reject: protectedProcedure
    .input(
      z.object({
        farmerIds: z.array(z.string().min(1)).min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.farmerIds));

      if (uniqueIds.length === 0) {
        return { updated: 0 };
      }

      try {
        await ctx.db
          .update(farmer)
          .set({ kycStatus: "rejected" })
          .where(inArray(farmer.id, uniqueIds));

        return { updated: uniqueIds.length };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reject farmers",
          cause: error,
        });
      }
    }),

  // Soft delete farmers
  delete: protectedProcedure
    .input(
      z.object({
        farmerIds: z.array(z.string().min(1)).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ensurePlatformAdmin(ctx.session.user);

      const uniqueIds = Array.from(new Set(input.farmerIds));

      if (uniqueIds.length === 0) {
        return { deleted: 0 };
      }

      try {
        await ctx.db
          .update(farmer)
          .set({ isDeleted: true })
          .where(inArray(farmer.id, uniqueIds));

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
      const kycStatusCounts = await ctx.db
        .select({
          kycStatus: farmer.kycStatus,
          count: count(),
        })
        .from(farmer)
        .where(eq(farmer.isDeleted, false))
        .groupBy(farmer.kycStatus);

      const statusMap = new Map<string, number>();
      for (const entry of kycStatusCounts) {
        if (entry.kycStatus) {
          statusMap.set(entry.kycStatus, Number(entry.count ?? 0));
        }
      }

      const totalFarmers = Array.from(statusMap.values()).reduce(
        (total, currentCount) => total + currentCount,
        0
      );

      return {
        totalFarmers,
        verifiedFarmers: statusMap.get("verified") ?? 0,
        pendingFarmers: statusMap.get("pending") ?? 0,
        rejectedFarmers: statusMap.get("rejected") ?? 0,
        kycStatusBreakdown: ["pending", "verified", "rejected"].map(
          (status) => ({
            status,
            count: statusMap.get(status) ?? 0,
          })
        ),
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
