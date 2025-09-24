import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
	district,
	member,
	organization,
	region,
	user,
} from "@/server/db/schema";

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

export const organizationMembersRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const activeOrganizationId = ensureActiveOrganization(ctx.session);

		// If no active organization, return empty list for now
		if (!activeOrganizationId) {
			return [];
		}

		try {
			const membersData = await ctx.db
				.select({
					id: member.id,
					userId: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					role: member.role,
					status: user.status,
					kycStatus: user.kycStatus,
					phoneNumber: user.phoneNumber,
					phoneNumberVerified: user.phoneNumberVerified,
					lastLogin: user.lastLogin,
					createdAt: member.createdAt,
					districtName: district.name,
					regionName: region.name,
					banned: user.banned,
					banReason: user.banReason,
				})
				.from(member)
				.innerJoin(user, eq(user.id, member.userId))
				.leftJoin(district, eq(district.id, user.districtId))
				.leftJoin(region, eq(region.code, district.regionCode))
				.where(eq(member.organizationId, activeOrganizationId))
				.orderBy(member.createdAt);

			return membersData.map((row) => ({
				id: row.userId,
				memberId: row.id,
				name: row.name,
				email: row.email,
				image: row.image,
				role: row.role,
				status: row.status,
				kycStatus: row.kycStatus,
				phoneNumber: row.phoneNumber,
				phoneNumberVerified: row.phoneNumberVerified ?? false,
				lastLogin: row.lastLogin,
				createdAt: row.createdAt,
				districtName: row.districtName,
				regionName: row.regionName,
				banned: row.banned ?? false,
				banReason: row.banReason,
			}));
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch organization members",
				cause: error,
			});
		}
	}),

	stats: protectedProcedure.query(async ({ ctx }) => {
		const activeOrganizationId = ensureActiveOrganization(ctx.session);

		// If no active organization, return empty stats
		if (!activeOrganizationId) {
			return {
				totalMembers: 0,
				activeMembers: 0,
				pendingMembers: 0,
				roleBreakdown: {
					owners: 0,
					admins: 0,
					members: 0,
				},
			};
		}

		try {
			const totalMembersResult = await ctx.db
				.select({
					total: sql<number>`COUNT(*)`,
					active: sql<number>`COUNT(CASE WHEN ${user.status} = 'approved' THEN 1 END)`,
					pending: sql<number>`COUNT(CASE WHEN ${user.status} = 'pending' THEN 1 END)`,
					owners: sql<number>`COUNT(CASE WHEN ${member.role} = 'owner' THEN 1 END)`,
					admins: sql<number>`COUNT(CASE WHEN ${member.role} = 'admin' THEN 1 END)`,
					members: sql<number>`COUNT(CASE WHEN ${member.role} = 'member' THEN 1 END)`,
				})
				.from(member)
				.innerJoin(user, eq(user.id, member.userId))
				.where(eq(member.organizationId, activeOrganizationId));

			const stats = totalMembersResult[0] || {
				total: 0,
				active: 0,
				pending: 0,
				owners: 0,
				admins: 0,
				members: 0,
			};

			return {
				totalMembers: Number(stats.total),
				activeMembers: Number(stats.active),
				pendingMembers: Number(stats.pending),
				roleBreakdown: {
					owners: Number(stats.owners),
					admins: Number(stats.admins),
					members: Number(stats.members),
				},
			};
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch member statistics",
				cause: error,
			});
		}
	}),
});
