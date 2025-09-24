import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	ORGANIZATION_STATUS,
	ORGANIZATION_TYPE,
} from "@/config/constants/auth";
import { signUpSchema } from "@/features/auth/schema";
import { auth } from "@/lib/auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const authRouter = createTRPCRouter({
	signUp: publicProcedure
		.meta({
			openapi: {
				method: "POST",
				path: "/auth/signup",
				tags: ["auth"],
				summary: "Create a new user account",
				description: "Create a new user account with organization",
			},
		})
		.input(signUpSchema)
		.output(
			z.object({
				success: z.boolean(),
				user: z
					.object({
						id: z.string(),
						name: z.string(),
						email: z.string(),
					})
					.optional(),
				organization: z.any().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const fullName = `${input.firstName} ${input.lastName}`
					.trim()
					.replace(/\s+/g, " ");

				// Create user using better-auth
				const userResult = await auth.api.signUpEmail({
					body: {
						name: fullName,
						email: input.email,
						password: input.password,
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

				const districtData = await db.query.district.findFirst({
					where: (district, { eq }) => eq(district.id, input.districtId),
					columns: {
						regionCode: true,
					},
				});
				// Create organization for the user using better-auth organization plugin
				try {
					const organizationResult = await auth.api.createOrganization({
						body: {
							organizationType: ORGANIZATION_TYPE.FARMER_ORG,
							status: ORGANIZATION_STATUS.PENDING,
							name: `${userResult.user.name}'s Organization`,
							slug: `${userResult.user.name.toLowerCase().split(" ").join("-")}-${userResult.user.id}`,
							userId: userResult.user.id,
							districtId: input.districtId,
							regionId: districtData?.regionCode,
							address: input.address,
							contactEmail: input.email,
							contactPhone: input.phoneNumber,
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
					message: "Unable to create your account right now.",
					cause: error,
				});
			}
		}),
});
