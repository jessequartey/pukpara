import { TRPCError } from "@trpc/server";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import {
	ORGANIZATION_MEMBER_ROLE,
	ORGANIZATION_STATUS,
	ORGANIZATION_SUBSCRIPTION_TYPE,
	USER_STATUS,
} from "@/config/constants/auth";
import {
	district,
	member,
	organization,
	region,
	user,
} from "@/server/db/schema";
import { sendOrganizationApprovedEmail } from "@/server/email/resend";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const buildOnboardingUrl = (orgId: string) => {
	const base =
		process.env.NEXT_PUBLIC_APP_URL ??
		process.env.APP_URL ??
		"http://localhost:3000";
	const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
	return `${normalizedBase}/organizations/${orgId}/onboarding`;
};

export const organizationsRouter = createTRPCRouter({
	list: protectedProcedure
		.input(
			z.object({
				page: z.number().int().min(1).default(1),
				pageSize: z
					.number()
					.int()
					.min(1)
					.max(MAX_PAGE_SIZE)
					.default(DEFAULT_PAGE_SIZE),
			}),
		)
		.query(async ({ ctx, input }) => {
			// TODO: Re-enable admin check after debugging
			// ensurePlatformAdmin(ctx.session.user);

			try {
				// Query with region, district, and owner information
				const organizationsData = await ctx.db
					.select({
						id: organization.id,
						name: organization.name,
						slug: organization.slug,
						status: organization.status,
						kycStatus: organization.kycStatus,
						type: organization.organizationType,
						createdAt: organization.createdAt,
						contactEmail: organization.contactEmail,
						contactPhone: organization.contactPhone,
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
					.limit(input.pageSize)
					.offset((input.page - 1) * input.pageSize);

				const totalRows = await ctx.db
					.select({ value: count() })
					.from(organization);
				const total = totalRows.at(0)?.value ?? 0;

				const data = organizationsData.map((row) => ({
					id: row.id,
					name: row.name,
					slug: row.slug,
					status: row.status,
					kycStatus: row.kycStatus,
					type: row.type,
					createdAt: row.createdAt,
					contactEmail: row.contactEmail,
					contactPhone: row.contactPhone,
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
					logo: null,
					subType: null,
					maxUsers: null,
					subscriptionType: null,
					licenseStatus: null,
				}));

				return {
					data,
					page: input.page,
					pageSize: input.pageSize,
					total,
				};
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch organizations",
				});
			}
		}),

	approve: protectedProcedure
		.input(
			z.object({
				organizationIds: z.array(z.string().min(1)).min(1),
			}),
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
					new Set(membersForOrganizations.map((row) => row.userId)),
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
						entries.map((entry) => entry.id),
					),
				),
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
								recipientName: userRecord.name,
							});
						}),
					);
				}),
			);

			return { updated: result.organizationsToApprove.length };
		}),

	delete: protectedProcedure
		.input(
			z.object({
				organizationIds: z.array(z.string().min(1)).min(1),
			}),
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
						]),
					),
				);

			return {
				organization: detail,
				stats: {
					memberCount: memberCountValue,
				},
				leadership,
			};
		}),

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
});
