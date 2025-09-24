import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	admin,
	apiKey,
	openAPI,
	organization,
	phoneNumber,
} from "better-auth/plugins";
import { eq } from "drizzle-orm";
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
				email: user.email,
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
			// organizationMetadata: { type: "json", input: true },
		},
	},

	plugins: [
		/**
		 * Phone number plugin (OTP later for sensitive actions)
		 * You can flip `requireVerification` to true when ready.
		 */
		phoneNumber({
			requireVerification: false,
			async sendOTP({ phoneNumber, code }) {
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
			dynamicAccessControl: {
				enabled: true,
			},
			autoCreateOrganizationOnSignUp: true,
			// If you want stricter invites:
			// requireEmailVerificationOnInvitation: true,

			organizationHooks: {
				// After a user creates an organization, make it their active organization
				afterCreateOrganization: async ({ organization, user }) => {
					// Update the user's session to set this as their active organization
					await db
						.update(schema.session)
						.set({ activeOrganizationId: organization.id })
						.where(eq(schema.session.userId, user.id));
				},

				// After a member is added to an organization, make it their active organization
				afterAddMember: async ({ user, organization }) => {
					// Set the organization as the user's active organization in their session
					await db
						.update(schema.session)
						.set({ activeOrganizationId: organization.id })
						.where(eq(schema.session.userId, user.id));
				},

				// After accepting an invitation, set the organization as active
				afterAcceptInvitation: async ({ user, organization }) => {
					// Set the organization as the user's active organization
					await db
						.update(schema.session)
						.set({ activeOrganizationId: organization.id })
						.where(eq(schema.session.userId, user.id));
				},
			},

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
