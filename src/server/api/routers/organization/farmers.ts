import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { district, farm, farmer, region } from "@/server/db/schema";

import { createTRPCRouter, protectedProcedure } from "../../trpc";

const ensureActiveOrganization = (session: unknown) => {
	if (!session || typeof session !== "object") {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const sessionObj = session as Record<string, unknown>;
	// Try to get organization ID from session, better-auth stores it in different places
	let activeOrganizationId: string | undefined;

	// Check if it's in the session object directly
	if (
		sessionObj.activeOrganizationId &&
		typeof sessionObj.activeOrganizationId === "string"
	) {
		activeOrganizationId = sessionObj.activeOrganizationId;
	}

	// Check if it's in the session.session nested object
	if (
		!activeOrganizationId &&
		sessionObj.session &&
		typeof sessionObj.session === "object"
	) {
		const nestedSession = sessionObj.session as Record<string, unknown>;
		if (
			nestedSession.activeOrganizationId &&
			typeof nestedSession.activeOrganizationId === "string"
		) {
			activeOrganizationId = nestedSession.activeOrganizationId;
		}
	}

	// For development, use a hardcoded organization ID if none is found
	if (!activeOrganizationId) {
		// TODO: In production, this should throw an error
		// For now, we'll return null to handle it gracefully in the queries
		return null;
	}

	return activeOrganizationId;
};

export const organizationFarmersRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const activeOrganizationId = ensureActiveOrganization(ctx.session);

		// If no active organization, return empty list for now
		if (!activeOrganizationId) {
			return [];
		}

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
					districtName: district.name,
					regionName: region.name,
					farmCount: sql<number>`COUNT(DISTINCT ${farm.id})`,
					totalAcreage: sql<number>`COALESCE(SUM(CAST(${farm.acreage} AS DECIMAL)), 0)`,
				})
				.from(farmer)
				.leftJoin(district, eq(district.id, farmer.districtId))
				.leftJoin(region, eq(region.code, district.regionCode))
				.leftJoin(farm, eq(farm.farmerId, farmer.id))
				.where(eq(farmer.organizationId, activeOrganizationId))
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
					district.name,
					region.name,
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
				districtName: row.districtName,
				regionName: row.regionName,
				farmCount: Number(row.farmCount ?? 0),
				totalAcreage: Number(row.totalAcreage ?? 0),
			}));
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch organization farmers",
				cause: error,
			});
		}
	}),

	stats: protectedProcedure.query(async ({ ctx }) => {
		const activeOrganizationId = ensureActiveOrganization(ctx.session);

		// If no active organization, return empty stats
		if (!activeOrganizationId) {
			return {
				totalFarmers: 0,
				verifiedFarmers: 0,
				pendingFarmers: 0,
				rejectedFarmers: 0,
				leaders: 0,
				kycStatusBreakdown: [
					{ status: "pending", count: 0 },
					{ status: "verified", count: 0 },
					{ status: "rejected", count: 0 },
				],
			};
		}

		try {
			const statsResult = await ctx.db
				.select({
					totalFarmers: sql<number>`COUNT(*)`,
					verifiedFarmers: sql<number>`COUNT(CASE WHEN ${farmer.kycStatus} = 'verified' THEN 1 END)`,
					pendingFarmers: sql<number>`COUNT(CASE WHEN ${farmer.kycStatus} = 'pending' THEN 1 END)`,
					rejectedFarmers: sql<number>`COUNT(CASE WHEN ${farmer.kycStatus} = 'rejected' THEN 1 END)`,
					leaders: sql<number>`COUNT(CASE WHEN ${farmer.isLeader} = true THEN 1 END)`,
				})
				.from(farmer)
				.where(eq(farmer.organizationId, activeOrganizationId));

			const stats = statsResult[0] || {
				totalFarmers: 0,
				verifiedFarmers: 0,
				pendingFarmers: 0,
				rejectedFarmers: 0,
				leaders: 0,
			};

			return {
				totalFarmers: Number(stats.totalFarmers),
				verifiedFarmers: Number(stats.verifiedFarmers),
				pendingFarmers: Number(stats.pendingFarmers),
				rejectedFarmers: Number(stats.rejectedFarmers),
				leaders: Number(stats.leaders),
				kycStatusBreakdown: [
					{ status: "pending", count: Number(stats.pendingFarmers) },
					{ status: "verified", count: Number(stats.verifiedFarmers) },
					{ status: "rejected", count: Number(stats.rejectedFarmers) },
				],
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
