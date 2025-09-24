import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { farmer, team, teamFarmer, teamMember, user } from "@/server/db/schema";

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

export const organizationGroupsRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const activeOrganizationId = ensureActiveOrganization(ctx.session);

		// If no active organization, return empty list for now
		if (!activeOrganizationId) {
			return [];
		}

		try {
			const groupsData = await ctx.db
				.select({
					id: team.id,
					name: team.name,
					createdAt: team.createdAt,
					updatedAt: team.updatedAt,
					memberCount: sql<number>`COUNT(DISTINCT ${teamMember.userId})`,
					farmerCount: sql<number>`COUNT(DISTINCT ${teamFarmer.farmerId})`,
				})
				.from(team)
				.leftJoin(teamMember, eq(teamMember.teamId, team.id))
				.leftJoin(teamFarmer, eq(teamFarmer.teamId, team.id))
				.where(eq(team.organizationId, activeOrganizationId))
				.groupBy(team.id, team.name, team.createdAt, team.updatedAt)
				.orderBy(team.createdAt);

			return groupsData.map((row) => ({
				id: row.id,
				name: row.name,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
				memberCount: Number(row.memberCount ?? 0),
				farmerCount: Number(row.farmerCount ?? 0),
				totalParticipants:
					Number(row.memberCount ?? 0) + Number(row.farmerCount ?? 0),
			}));
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch organization groups",
				cause: error,
			});
		}
	}),

	detail: protectedProcedure
		.input(z.object({ groupId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const activeOrganizationId = ensureActiveOrganization(ctx.session);

			if (!activeOrganizationId) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
			}

			try {
				// Get group basic info
				const groupResult = await ctx.db
					.select({
						id: team.id,
						name: team.name,
						createdAt: team.createdAt,
						updatedAt: team.updatedAt,
					})
					.from(team)
					.where(eq(team.id, input.groupId))
					.limit(1);

				const group = groupResult[0];
				if (!group) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Group not found",
					});
				}

				// Verify the group belongs to the active organization
				if (group.id !== input.groupId) {
					throw new TRPCError({ code: "FORBIDDEN" });
				}

				// Get team members (users)
				const members = await ctx.db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
						joinedAt: teamMember.createdAt,
					})
					.from(teamMember)
					.innerJoin(user, eq(user.id, teamMember.userId))
					.where(eq(teamMember.teamId, input.groupId));

				// Get team farmers
				const farmers = await ctx.db
					.select({
						id: farmer.id,
						firstName: farmer.firstName,
						lastName: farmer.lastName,
						phone: farmer.phone,
						imgUrl: farmer.imgUrl,
						joinedAt: teamFarmer.joinedAt,
						role: teamFarmer.role,
					})
					.from(teamFarmer)
					.innerJoin(farmer, eq(farmer.id, teamFarmer.farmerId))
					.where(eq(teamFarmer.teamId, input.groupId));

				return {
					group,
					members: members.map((member) => ({
						...member,
						type: "user" as const,
					})),
					farmers: farmers.map((farmer) => ({
						...farmer,
						name: `${farmer.firstName} ${farmer.lastName}`,
						type: "farmer" as const,
					})),
					stats: {
						memberCount: members.length,
						farmerCount: farmers.length,
						totalParticipants: members.length + farmers.length,
					},
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch group details",
					cause: error,
				});
			}
		}),

	stats: protectedProcedure.query(async ({ ctx }) => {
		const activeOrganizationId = ensureActiveOrganization(ctx.session);

		// If no active organization, return empty stats
		if (!activeOrganizationId) {
			return {
				totalGroups: 0,
				totalMembers: 0,
				totalFarmers: 0,
				totalParticipants: 0,
			};
		}

		try {
			const statsResult = await ctx.db
				.select({
					totalGroups: sql<number>`COUNT(*)`,
				})
				.from(team)
				.where(eq(team.organizationId, activeOrganizationId));

			const memberStatsResult = await ctx.db
				.select({
					totalMembers: sql<number>`COUNT(DISTINCT ${teamMember.userId})`,
					totalFarmers: sql<number>`COUNT(DISTINCT ${teamFarmer.farmerId})`,
				})
				.from(team)
				.leftJoin(teamMember, eq(teamMember.teamId, team.id))
				.leftJoin(teamFarmer, eq(teamFarmer.teamId, team.id))
				.where(eq(team.organizationId, activeOrganizationId));

			const stats = statsResult[0] || { totalGroups: 0 };
			const memberStats = memberStatsResult[0] || {
				totalMembers: 0,
				totalFarmers: 0,
			};

			return {
				totalGroups: Number(stats.totalGroups),
				totalMembers: Number(memberStats.totalMembers),
				totalFarmers: Number(memberStats.totalFarmers),
				totalParticipants:
					Number(memberStats.totalMembers) + Number(memberStats.totalFarmers),
			};
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch group statistics",
				cause: error,
			});
		}
	}),
});
