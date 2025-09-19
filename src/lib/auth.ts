// src/lib/auth.ts
/** biome-ignore-all lint/performance/noNamespaceImport: <neccessary> */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  apiKey,
  openAPI,
  organization,
  phoneNumber,
} from "better-auth/plugins";
import {
  ORGANIZATION_KYC_STATUS,
  ORGANIZATION_LICENSE_STATUS,
  ORGANIZATION_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  USER_KYC_STATUS,
  USER_STATUS,
} from "@/config/constants/auth";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { sendPasswordResetEmail } from "@/server/email/resend";
import { AdminRoles, ac as adminAC } from "./admin-permissions";
import {
  buildAdminOrganizationData,
  buildDefaultOrganizationData,
  createOrganizationWithMembership,
  type OrganizationMetadata,
  shouldCreateOrganization,
} from "./auth-organization-utils";
import { OrgRoles, ac as orgAC } from "./org-permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
    async sendResetPassword({ user, url }) {
      if (!url) {
        return;
      }
      await sendPasswordResetEmail({
        email: "jessefquartey@gmail.com",
        resetUrl: url,
        userName: user.name,
      });
    },
  },

  // Optional: new signups wait for manual approval
  signup: {
    requireAdminApproval: true,
  },

  /**
   * USER MODEL EXTRAS
   * Keep these to support approval flow, KYC, location, and legacy IDs—while staying Better-Auth compatible.
   */
  user: {
    additionalFields: {
      // Onboarding / KYC
      districtId: { type: "string", required: true },
      address: { type: "string", required: true },
      phoneNumber: { type: "string", required: true },
      kycStatus: {
        type: "string",
        defaultValue: USER_KYC_STATUS.PENDING,
      },

      // Account lifecycle
      status: {
        type: "string",
        defaultValue: USER_STATUS.PENDING,
      },
      approvedAt: { type: "date", input: false },

      // Auditing / privacy
      lastLogin: { type: "date", input: false },
      consentTermsAt: { type: "date", input: false },
      consentPrivacyAt: { type: "date", input: false },

      // Preferences & legacy
      notificationPrefs: { type: "json", input: false },
      legacyUserId: { type: "string", input: false },
      legacyTenantId: { type: "string", input: false }, // if old system stored user->tenant directly

      // Organization metadata for admin-created users
      organizationMetadata: { type: "json", input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (newUser, ctx) => {
          const authContext = ctx?.context;
          const userId = newUser.id;

          if (!(await shouldCreateOrganization(authContext, userId))) {
            return;
          }

          if (!authContext) {
            return;
          }

          const now = new Date();
          const displayName =
            typeof newUser.name === "string" && newUser.name.trim().length > 0
              ? newUser.name.trim()
              : "New";

          const orgMetadata =
            newUser.organizationMetadata as OrganizationMetadata | null;
          const isAdminCreated =
            orgMetadata?.source === "admin" && orgMetadata.organizationName;

          const organizationData = isAdminCreated
            ? buildAdminOrganizationData(orgMetadata, now)
            : buildDefaultOrganizationData(displayName, userId, now);

          await createOrganizationWithMembership(
            authContext,
            organizationData,
            userId,
            now
          );
        },
      },
    },
    session: {
      create: {
        after: async (newSession, ctx) => {
          const authContext = ctx?.context;

          if (!authContext) {
            return;
          }

          if (newSession.activeOrganizationId) {
            return;
          }

          if (!(newSession.token && newSession.userId)) {
            return;
          }

          const memberships = (await authContext.adapter.findMany({
            model: "member",
            where: [
              {
                field: "userId",
                value: newSession.userId,
              },
            ],
            sortBy: {
              field: "createdAt",
              direction: "asc",
            },
            limit: 1,
          })) as Array<{ organizationId?: string }>;

          const primaryMembership = memberships.at(0);

          if (!primaryMembership?.organizationId) {
            return;
          }

          await authContext.internalAdapter.updateSession(newSession.token, {
            activeOrganizationId: primaryMembership.organizationId,
          });
        },
      },
    },
  },

  plugins: [
    /**
     * Phone number plugin (OTP later for sensitive actions)
     * You can flip `requireVerification` to true when ready.
     */
    phoneNumber({
      requireVerification: false,
      // biome-ignore lint/suspicious/useAwait: <testing>
      // biome-ignore lint/nursery/noShadow: <testing>
      async sendOTP({ phoneNumber, code }) {
        // integrate your SMS sender here
        // biome-ignore lint/suspicious/noConsole: <testing>
        console.log(`Sending OTP ${code} to ${phoneNumber}`);
      },
    }),

    /**
     * Platform Admin
     */
    admin({
      ac: adminAC,
      roles: { ...AdminRoles },
    }),

    /**
     * Organizations / Tenants
     * Teams map to “Groups” in your domain.
     */
    organization({
      ac: orgAC,
      roles: { ...OrgRoles },
      teams: { enabled: true },
      // If you want stricter invites:
      // requireEmailVerificationOnInvitation: true,

      /**
       * ORGANIZATION MODEL EXTRAS
       * Everything needed for organization type, licensing, billing, contact, regionalization, and legacy mapping.
       */
      schema: {
        organization: {
          additionalFields: {
            // Classification
            organizationType: {
              type: "string",
              input: true,
              required: true,
            },
            organizationSubType: {
              type: "string", // "VSLA" | "FBO" | "Cooperative" | "Aggregator"
              input: true,
              required: false,
            },

            // Contact & address
            contactEmail: { type: "string", input: true, required: false },
            contactPhone: { type: "string", input: true, required: false },
            address: { type: "string", input: true, required: false },
            districtId: { type: "string", input: true, required: false },
            regionId: { type: "string", input: true, required: false },

            // Lifecycle
            status: {
              type: "string",
              input: true,
              required: false,
              defaultValue: ORGANIZATION_STATUS.PENDING,
            },

            // Subscription & licensing
            subscriptionType: {
              type: "string",
              input: true,
              required: false,
              defaultValue: ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM,
            },
            licenseStatus: {
              type: "string",
              input: true,
              required: false,
              defaultValue: ORGANIZATION_LICENSE_STATUS.ISSUED,
            },
            planRenewsAt: { type: "date", input: true, required: false },
            maxUsers: {
              type: "number",
              input: true,
              required: false,
              defaultValue: 100,
            },

            // Billing
            billingEmail: { type: "string", input: true, required: false },
            taxId: { type: "string", input: true, required: false },

            // Regionalization & comms
            defaultCurrency: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "GHS",
            },
            timezone: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "Africa/Accra",
            },
            ussdShortCode: { type: "string", input: true, required: false },
            smsSenderId: { type: "string", input: true, required: false },

            // Compliance
            kycStatus: {
              type: "string",
              input: true,
              required: false,
              defaultValue: ORGANIZATION_KYC_STATUS.PENDING,
            },

            // Limits / feature flags / legacy
            limits: { type: "json", input: true, required: false }, // e.g. { teams: 10, warehouses: 5 }
          },
        },
      },
    }),
    apiKey(),
    openAPI(),
  ],
});
