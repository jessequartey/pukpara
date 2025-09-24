import { TRPCError } from "@trpc/server";
import { and, count, eq, inArray, like, or } from "drizzle-orm";
import { z } from "zod";

import { USER_KYC_STATUS, USER_STATUS } from "@/config/constants/auth";
import {
	district,
	member,
	organization,
	region,
	user,
} from "@/server/db/schema";

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
		(role): role is string => typeof role === "string" && role.length > 0,
	);

	const hasRole = roles.some((role) => adminRoleSet.has(role));

	if (!hasRole) {
		throw new TRPCError({ code: "FORBIDDEN" });
	}
};

export const adminUsersRouter = createTRPCRouter({
	// Get all users
	all: protectedProcedure.query(async ({ ctx }) => {
		ensurePlatformAdmin(ctx.session.user);

		try {
			const usersData = await ctx.db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					phoneNumber: user.phoneNumber,
					phoneNumberVerified: user.phoneNumberVerified,
					status: user.status,
					kycStatus: user.kycStatus,
					role: user.role,
					banned: user.banned,
					address: user.address,
					districtId: user.districtId,
					districtName: district.name,
					regionName: region.name,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					lastLogin: user.lastLogin,
					approvedAt: user.approvedAt,
					consentTermsAt: user.consentTermsAt,
					consentPrivacyAt: user.consentPrivacyAt,
				})
				.from(user)
				.leftJoin(district, eq(district.id, user.districtId))
				.leftJoin(region, eq(region.code, district.regionCode))
				.orderBy(user.createdAt);

			// Get organization count for each user
			const userIds = usersData.map((u) => u.id);
			const organizationCounts = await ctx.db
				.select({
					userId: member.userId,
					count: count(),
				})
				.from(member)
				.where(inArray(member.userId, userIds))
				.groupBy(member.userId);

			const orgCountMap = new Map(
				organizationCounts.map((item) => [item.userId, item.count]),
			);

			return usersData.map((user) => ({
				...user,
				organizationCount: Number(orgCountMap.get(user.id) ?? 0),
			}));
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch users",
				cause: error,
			});
		}
	}),

	// Get user details by ID
	detail: protectedProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			ensurePlatformAdmin(ctx.session.user);

			const userDetails = await ctx.db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					image: user.image,
					phoneNumber: user.phoneNumber,
					phoneNumberVerified: user.phoneNumberVerified,
					role: user.role,
					banned: user.banned,
					banReason: user.banReason,
					banExpires: user.banExpires,
					districtId: user.districtId,
					districtName: district.name,
					regionName: region.name,
					address: user.address,
					kycStatus: user.kycStatus,
					status: user.status,
					approvedAt: user.approvedAt,
					lastLogin: user.lastLogin,
					consentTermsAt: user.consentTermsAt,
					consentPrivacyAt: user.consentPrivacyAt,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					notificationPrefs: user.notificationPrefs,
				})
				.from(user)
				.leftJoin(district, eq(district.id, user.districtId))
				.leftJoin(region, eq(region.code, district.regionCode))
				.where(eq(user.id, input.userId))
				.limit(1);

			const userDetail = userDetails.at(0);

			if (!userDetail) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			// Get user's organizations
			const organizations = await ctx.db
				.select({
					id: organization.id,
					name: organization.name,
					slug: organization.slug,
					status: organization.status,
					organizationType: organization.organizationType,
					role: member.role,
					joinedAt: member.createdAt,
				})
				.from(member)
				.innerJoin(organization, eq(organization.id, member.organizationId))
				.where(eq(member.userId, input.userId));

			return {
				user: userDetail,
				organizations,
			};
		}),

	// Update user
	update: protectedProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				name: z.string().min(1).optional(),
				email: z.string().email().optional(),
				phoneNumber: z.string().optional(),
				address: z.string().optional(),
				districtId: z.string().optional(),
				role: z.string().optional(),
				status: z.string().optional(),
				kycStatus: z.string().optional(),
				banned: z.boolean().optional(),
				banReason: z.string().optional(),
				banExpires: z.date().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			ensurePlatformAdmin(ctx.session.user);

			const { userId, ...updateData } = input;

			// Remove undefined values
			const cleanedData = Object.fromEntries(
				Object.entries(updateData).filter(([, value]) => value !== undefined),
			);

			if (Object.keys(cleanedData).length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No fields to update",
				});
			}

			await ctx.db.update(user).set(cleanedData).where(eq(user.id, userId));

			return { success: true };
		}),

	// Approve users
	approve: protectedProcedure
		.input(
			z.object({
				userIds: z.array(z.string().min(1)).min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			ensurePlatformAdmin(ctx.session.user);

			const uniqueIds = Array.from(new Set(input.userIds));

			if (uniqueIds.length === 0) {
				return { updated: 0 };
			}

			const now = new Date();

			await ctx.db
				.update(user)
				.set({
					status: USER_STATUS.APPROVED,
					kycStatus: USER_KYC_STATUS.VERIFIED,
					approvedAt: now,
				})
				.where(inArray(user.id, uniqueIds));

			return { updated: uniqueIds.length };
		}),

	// Suspend users
	suspend: protectedProcedure
		.input(
			z.object({
				userIds: z.array(z.string().min(1)).min(1),
				reason: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			ensurePlatformAdmin(ctx.session.user);

			const uniqueIds = Array.from(new Set(input.userIds));

			if (uniqueIds.length === 0) {
				return { updated: 0 };
			}

			await ctx.db
				.update(user)
				.set({
					status: USER_STATUS.SUSPENDED,
					banReason: input.reason,
				})
				.where(inArray(user.id, uniqueIds));

			return { updated: uniqueIds.length };
		}),

	// Delete users (soft delete by banning permanently)
	delete: protectedProcedure
		.input(
			z.object({
				userIds: z.array(z.string().min(1)).min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			ensurePlatformAdmin(ctx.session.user);

			const uniqueIds = Array.from(new Set(input.userIds));

			if (uniqueIds.length === 0) {
				return { deleted: 0 };
			}

			await ctx.db
				.update(user)
				.set({
					banned: true,
					banReason: "Account deleted by admin",
				})
				.where(inArray(user.id, uniqueIds));

			return { deleted: uniqueIds.length };
		}),

	// Search users
	search: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				limit: z.number().positive().max(50).default(10),
			}),
		)
		.query(async ({ ctx, input }) => {
			ensurePlatformAdmin(ctx.session.user);

			const searchQuery = `%${input.query.toLowerCase()}%`;

			const users = await ctx.db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					phoneNumber: user.phoneNumber,
					status: user.status,
					kycStatus: user.kycStatus,
				})
				.from(user)
				.where(
					or(
						like(user.name, searchQuery),
						like(user.email, searchQuery),
						like(user.phoneNumber, searchQuery),
					),
				)
				.limit(input.limit);

			return users;
		}),

	// Get user statistics
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

			const kycCounts = await ctx.db
				.select({
					kycStatus: user.kycStatus,
					count: count(),
				})
				.from(user)
				.groupBy(user.kycStatus);

			const statusMap = new Map<string, number>();
			for (const entry of statusCounts) {
				if (entry.status) {
					statusMap.set(entry.status, Number(entry.count ?? 0));
				}
			}

			const kycMap = new Map<string, number>();
			for (const entry of kycCounts) {
				if (entry.kycStatus) {
					kycMap.set(entry.kycStatus, Number(entry.count ?? 0));
				}
			}

			const totalUsers = Array.from(statusMap.values()).reduce(
				(total, currentCount) => total + currentCount,
				0,
			);

			return {
				totalUsers,
				approvedUsers: statusMap.get(USER_STATUS.APPROVED) ?? 0,
				pendingUsers: statusMap.get(USER_STATUS.PENDING) ?? 0,
				suspendedUsers: statusMap.get(USER_STATUS.SUSPENDED) ?? 0,
				verifiedKyc: kycMap.get(USER_KYC_STATUS.VERIFIED) ?? 0,
				pendingKyc: kycMap.get(USER_KYC_STATUS.PENDING) ?? 0,
				rejectedKyc: kycMap.get(USER_KYC_STATUS.REJECTED) ?? 0,
				statusBreakdown: Object.values(USER_STATUS).map((status) => ({
					status,
					count: statusMap.get(status) ?? 0,
				})),
				kycBreakdown: Object.values(USER_KYC_STATUS).map((kycStatus) => ({
					kycStatus,
					count: kycMap.get(kycStatus) ?? 0,
				})),
			};
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch user statistics",
				cause: error,
			});
		}
	}),
});
