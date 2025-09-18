// src/lib/auth.ts
/** biome-ignore-all lint/performance/noNamespaceImport: <neccessary> */
import { randomUUID } from "node:crypto";
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
  ORGANIZATION_MEMBER_ROLE,
  ORGANIZATION_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  ORGANIZATION_TYPE,
  USER_KYC_STATUS,
  USER_STATUS,
} from "@/config/constants/auth";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { sendPasswordResetEmail, sendOrganizationInviteEmail } from "@/server/email/resend";
import { AdminRoles, ac as adminAC } from "./admin-permissions";
import { OrgRoles, ac as orgAC } from "./org-permissions";

const DEFAULT_ORGANIZATION_SUFFIX = "Organization" as const;
const SLUG_SUFFIX_LENGTH = 6;

const createSlug = (value: string) => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  return base.length > 0 ? base : "org";
};

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

          if (!(authContext && userId)) {
            return;
          }

          const existingMembership = await authContext.adapter.findMany({
            model: "member",
            where: [
              {
                field: "userId",
                value: userId,
              },
            ],
            limit: 1,
          });

          if (existingMembership.length > 0) {
            return;
          }

          const now = new Date();
          const displayName =
            typeof newUser.name === "string" && newUser.name.trim().length > 0
              ? newUser.name.trim()
              : "New";

          // Check if this is an admin-created user with organization metadata
          const orgMetadata = newUser.organizationMetadata as {
            organizationName?: string;
            organizationSlug?: string;
            organizationType?: string;
            organizationSubType?: string;
            subscriptionType?: string;
            licenseStatus?: string;
            maxUsers?: number;
            contactEmail?: string;
            contactPhone?: string;
            billingEmail?: string;
            address?: string;
            districtId?: string;
            regionId?: string;
            source?: "admin" | "signup";
          } | null;

          let organizationName: string;
          let slug: string;
          let organizationType: string;
          let organizationData: Record<string, unknown>;

          if (orgMetadata?.source === "admin" && orgMetadata.organizationName) {
            // Admin-created user with specific organization details
            organizationName = orgMetadata.organizationName;
            slug = orgMetadata.organizationSlug || createSlug(organizationName);
            organizationType = orgMetadata.organizationType || ORGANIZATION_TYPE.FARMER_ORG;

            organizationData = {
              name: organizationName,
              slug,
              organizationType,
              createdAt: now,
              ...(orgMetadata.organizationSubType && { organizationSubType: orgMetadata.organizationSubType }),
              ...(orgMetadata.subscriptionType && { subscriptionType: orgMetadata.subscriptionType }),
              ...(orgMetadata.licenseStatus && { licenseStatus: orgMetadata.licenseStatus }),
              ...(orgMetadata.maxUsers && { maxUsers: orgMetadata.maxUsers }),
              ...(orgMetadata.contactEmail && { contactEmail: orgMetadata.contactEmail }),
              ...(orgMetadata.contactPhone && { contactPhone: orgMetadata.contactPhone }),
              ...(orgMetadata.billingEmail && { billingEmail: orgMetadata.billingEmail }),
              ...(orgMetadata.address && { address: orgMetadata.address }),
              ...(orgMetadata.districtId && { districtId: orgMetadata.districtId }),
              ...(orgMetadata.regionId && { regionId: orgMetadata.regionId }),
            };
          } else {
            // Regular sign-up user - create farmer organization by default
            organizationName = `${displayName} ${DEFAULT_ORGANIZATION_SUFFIX}`.trim();
            const baseSlug = createSlug(displayName);
            const suffixSource =
              typeof userId === "string" && userId.length > 0
                ? userId.slice(-SLUG_SUFFIX_LENGTH)
                : randomUUID().slice(0, SLUG_SUFFIX_LENGTH);
            const sanitizedSuffix = suffixSource
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
            const suffix =
              sanitizedSuffix.length > 0
                ? sanitizedSuffix
                : randomUUID().replace(/-/g, "").slice(0, SLUG_SUFFIX_LENGTH);
            slug = `${baseSlug}-${suffix}`;
            organizationType = ORGANIZATION_TYPE.FARMER_ORG;

            organizationData = {
              name: organizationName,
              slug,
              organizationType,
              createdAt: now,
            };
          }

          const organizationId =
            authContext.generateId({ model: "organization" }) ||
            `org_${randomUUID().replace(/-/g, "")}`;
          const memberId =
            authContext.generateId({ model: "member" }) ||
            `mem_${randomUUID().replace(/-/g, "")}`;

          await authContext.adapter.transaction(async (transaction) => {
            await transaction.create({
              model: "organization",
              data: {
                id: organizationId,
                ...organizationData,
              },
            });

            await transaction.create({
              model: "member",
              data: {
                id: memberId,
                organizationId,
                userId,
                role: ORGANIZATION_MEMBER_ROLE.OWNER,
                createdAt: now,
              },
            });
          });
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

          const memberships = await authContext.adapter.findMany({
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
          });

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
