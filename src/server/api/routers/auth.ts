import { TRPCError } from "@trpc/server";
import { signUpSchema } from "@/features/auth/schema";
import { auth } from "@/lib/auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
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

      // Create organization for the user using better-auth organization plugin
      const organizationResult = await auth.api.createOrganization({
        body: {
          name: `${fullName}'s Organization`,
          slug: `${fullName.toLowerCase().replace(/\s+/g, "-")}-org-${Date.now()}`,
          organizationType: "INDIVIDUAL", // You may want to make this configurable
        },
        headers: {
          // Pass user context - you may need to adjust this based on your auth setup
          authorization: `Bearer ${userResult.token || ""}`,
        },
      });

      return {
        success: true,
        user: userResult.user,
        organization: organizationResult,
      };
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
