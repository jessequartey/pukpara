import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	phoneNumber: text("phone_number").notNull(),
	phoneNumberVerified: boolean("phone_number_verified"),
	role: text("role"),
	banned: boolean("banned").default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
	districtId: text("district_id").notNull(),
	address: text("address").notNull(),
	kycStatus: text("kyc_status").default("pending"),
	status: text("status").default("pending"),
	approvedAt: timestamp("approved_at"),
	lastLogin: timestamp("last_login"),
	consentTermsAt: timestamp("consent_terms_at"),
	consentPrivacyAt: timestamp("consent_privacy_at"),
	notificationPrefs: jsonb("notification_prefs"),
	legacyUserId: text("legacy_user_id"),
	legacyTenantId: text("legacy_tenant_id"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonated_by"),
	activeOrganizationId: text("active_organization_id"),
	activeTeamId: text("active_team_id"),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const organizationRole = pgTable("organization_role", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	role: text("role").notNull(),
	permission: text("permission").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").$onUpdate(
		() => /* @__PURE__ */ new Date(),
	),
});

export const team = pgTable("team", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").$onUpdate(
		() => /* @__PURE__ */ new Date(),
	),
});

export const teamMember = pgTable("team_member", {
	id: text("id").primaryKey(),
	teamId: text("team_id")
		.notNull()
		.references(() => team.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at"),
});

export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at").notNull(),
	metadata: text("metadata"),
	organizationType: text("organization_type").notNull(),
	organizationSubType: text("organization_sub_type"),
	contactEmail: text("contact_email"),
	contactPhone: text("contact_phone"),
	address: text("address"),
	districtId: text("district_id"),
	regionId: text("region_id"),
	status: text("status").default("pending"),
	subscriptionType: text("subscription_type").default("freemium"),
	licenseStatus: text("license_status").default("issued"),
	planRenewsAt: timestamp("plan_renews_at"),
	maxUsers: integer("max_users").default(100),
	billingEmail: text("billing_email"),
	taxId: text("tax_id"),
	defaultCurrency: text("default_currency").default("GHS"),
	timezone: text("timezone").default("Africa/Accra"),
	ussdShortCode: text("ussd_short_code"),
	smsSenderId: text("sms_sender_id"),
	kycStatus: text("kyc_status").default("pending"),
	limits: jsonb("limits"),
});

export const member = pgTable("member", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	role: text("role").default("member").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role"),
	teamId: text("team_id"),
	status: text("status").default("pending").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	inviterId: text("inviter_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const apikey = pgTable("apikey", {
	id: text("id").primaryKey(),
	name: text("name"),
	start: text("start"),
	prefix: text("prefix"),
	key: text("key").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	refillInterval: integer("refill_interval"),
	refillAmount: integer("refill_amount"),
	lastRefillAt: timestamp("last_refill_at"),
	enabled: boolean("enabled").default(true),
	rateLimitEnabled: boolean("rate_limit_enabled").default(true),
	rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
	rateLimitMax: integer("rate_limit_max").default(10),
	requestCount: integer("request_count").default(0),
	remaining: integer("remaining"),
	lastRequest: timestamp("last_request"),
	expiresAt: timestamp("expires_at"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	permissions: text("permissions"),
	metadata: text("metadata"),
});
