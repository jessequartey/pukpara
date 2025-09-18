/** biome-ignore-all lint/style/noMagicNumbers: <necessary> */
/** biome-ignore-all lint/style/useNumericSeparators: <neccessary> */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import {
  ORGANIZATION_KYC_STATUS,
  ORGANIZATION_LICENSE_STATUS,
  ORGANIZATION_MEMBER_ROLE,
  ORGANIZATION_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  USER_KYC_STATUS,
  USER_STATUS,
} from "@/config/constants/auth";

/* ----------------------------- Reference Data ----------------------------- */

export const region = pgTable("region", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
});

export const district = pgTable("district", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code"),
  regionCode: text("region_code")
    .notNull()
    .references(() => region.code, { onDelete: "cascade" }),
});

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
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified"),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  districtId: text("district_id")
    .notNull()
    .references(() => district.id, { onDelete: "restrict" }),
  address: text("address").notNull(),
  kycStatus: text("kyc_status").default(USER_KYC_STATUS.PENDING),
  status: text("status").default(USER_STATUS.PENDING),
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

export const team = pgTable("team", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(
    () => /* @__PURE__ */ new Date()
  ),
});

export const teamMember = pgTable(
  "team_member",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    uqTeamUser: unique().on(t.teamId, t.userId),
  })
);

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
  districtId: text("district_id").references(() => district.id, {
    onDelete: "set null",
  }),
  regionId: text("region_id").references(() => region.code, {
    onDelete: "set null",
  }),
  status: text("status").default(ORGANIZATION_STATUS.PENDING),
  subscriptionType: text("subscription_type").default(
    ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM
  ),
  licenseStatus: text("license_status").default(
    ORGANIZATION_LICENSE_STATUS.ISSUED
  ),
  planRenewsAt: timestamp("plan_renews_at"),
  maxUsers: integer("max_users").default(100),
  billingEmail: text("billing_email"),
  taxId: text("tax_id"),
  defaultCurrency: text("default_currency").default("GHS"),
  timezone: text("timezone").default("Africa/Accra"),
  ussdShortCode: text("ussd_short_code"),
  smsSenderId: text("sms_sender_id"),
  kycStatus: text("kyc_status").default(ORGANIZATION_KYC_STATUS.PENDING),
  limits: jsonb("limits"),
});

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default(ORGANIZATION_MEMBER_ROLE.MEMBER).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    uqOrgUser: unique().on(t.organizationId, t.userId),
  })
);

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
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

/* ----------------------------- Farmer Domain ------------------------------ */

export const farmer = pgTable(
  "farmer",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }), // tenant
    pukparaId: text("pukpara_id").unique(), // business code
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    gender: text("gender"),
    dateOfBirth: timestamp("date_of_birth"),
    phone: text("phone"),
    isPhoneSmart: boolean("is_phone_smart").default(false),
    idNumber: text("id_number"),
    idType: text("id_type"),
    address: text("address"),
    districtId: text("district_id").references(() => district.id, {
      onDelete: "set null",
    }),
    community: text("community"),
    householdSize: integer("household_size"),
    isLeader: boolean("is_leader").default(false),
    imgUrl: text("img_url"),
    kycStatus: text("kyc_status").default("pending"), // unverified|pending|verified|rejected
    legacyFarmerId: text("legacy_farmer_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false),
  },
  (t) => ({
    uqOrgPhone: unique().on(t.organizationId, t.phone),
    idxOrgLastName: index("idx_farmer_org_lastname").on(
      t.organizationId,
      t.lastName
    ),
  })
);

export const teamFarmer = pgTable(
  "team_farmer",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }), // group (VSLA/FBO/Coop/Agg)
    farmerId: text("farmer_id")
      .notNull()
      .references(() => farmer.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow(),
    role: text("role"), // optional: chair, secretary, treasurer
  },
  (t) => ({
    uqTeamFarmer: unique().on(t.teamId, t.farmerId),
  })
);

export const farm = pgTable("farm", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  farmerId: text("farmer_id")
    .notNull()
    .references(() => farmer.id, { onDelete: "cascade" }),
  name: text("name"),
  acreage: numeric("acreage", { precision: 12, scale: 2 }),
  cropType: text("crop_type"),
  soilType: text("soil_type"),
  locationLat: numeric("location_lat", { precision: 10, scale: 6 }),
  locationLng: numeric("location_lng", { precision: 10, scale: 6 }),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false),
});

export const farmCoordinate = pgTable("farm_coordinate", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farm.id, { onDelete: "cascade" }),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  elevation: numeric("elevation", { precision: 10, scale: 2 }),
  accuracy: numeric("accuracy", { precision: 10, scale: 2 }),
  capturedAt: timestamp("captured_at").defaultNow(),
});

export const farmYield = pgTable("farm_yield", {
  id: text("id").primaryKey(),
  farmId: text("farm_id")
    .notNull()
    .references(() => farm.id, { onDelete: "cascade" }),
  season: text("season"), // e.g., "Main 2025"
  commodityId: text("commodity_id"),
  variety: text("variety"),
  harvestedQty: numeric("harvested_qty", { precision: 14, scale: 2 }),
  uom: text("uom"), // kg, tons, bags
  harvestedAt: timestamp("harvested_at"),
  notes: text("notes"),
});

/* ----------------------- VSLA Savings & Microloans ------------------------ */
/* Tip: If you want richer accounting later, replace this with (account, ledger_entry). */

export const savingsAccount = pgTable(
  "savings_account",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(), // "farmer" | "team"
    farmerId: text("farmer_id").references(() => farmer.id, {
      onDelete: "set null",
    }),
    teamId: text("team_id").references(() => team.id, { onDelete: "set null" }),
    balance: numeric("balance", { precision: 14, scale: 2 }).default("0"),
    currency: text("currency").default("GHS"),
    status: text("status").default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    uqAccountFarmer: unique().on(t.organizationId, t.entityType, t.farmerId),
    uqAccountTeam: unique().on(t.organizationId, t.entityType, t.teamId),
  })
);

export const savingsEntry = pgTable(
  "savings_entry",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => savingsAccount.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "contribution" | "withdrawal" | "adjustment"
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    reference: text("reference"),
    recordedByUserId: text("recorded_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    metadata: jsonb("metadata"), // MoMo ref, bank tx id, etc.
  },
  (t) => ({
    ckAmountNotZero: check("ck_savings_amount_not_zero", sql`${t.amount} != 0`),
    ckType: check(
      "ck_savings_type",
      sql`${t.type} IN ('contribution', 'withdrawal', 'adjustment')`
    ),
    idxOrgCreated: index("idx_savings_entry_org_created").on(
      t.organizationId,
      t.createdAt
    ),
  })
);

export const loan = pgTable(
  "loan",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    applicantType: text("applicant_type").notNull(), // "farmer" | "team"
    farmerId: text("farmer_id").references(() => farmer.id, {
      onDelete: "set null",
    }),
    teamId: text("team_id").references(() => team.id, { onDelete: "set null" }),
    principal: numeric("principal", { precision: 14, scale: 2 }).notNull(),
    interestRate: numeric("interest_rate", {
      precision: 5,
      scale: 2,
    }).notNull(), // %
    termDays: integer("term_days").notNull(),
    status: text("status").default("pending"), // pending|approved|rejected|active|repaid|defaulted
    requestedAt: timestamp("requested_at").defaultNow(),
    approvedAt: timestamp("approved_at"),
    approvedByUserId: text("approved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    disbursedAt: timestamp("disbursed_at"),
    dueDate: timestamp("due_date"),
    currency: text("currency").default("GHS"),
    source: text("source"), // e.g., partner bank name
    metadata: jsonb("metadata"),
  },
  (t) => ({
    ckPrincipalPositive: check(
      "ck_loan_principal_pos",
      sql`${t.principal} > 0`
    ),
    ckInterestRange: check(
      "ck_loan_rate_range",
      sql`${t.interestRate} >= 0 AND ${t.interestRate} <= 100`
    ),
    ckTermDaysPositive: check("ck_loan_term_days_pos", sql`${t.termDays} > 0`),
    ckApplicantType: check(
      "ck_loan_applicant_type",
      sql`${t.applicantType} IN ('farmer', 'team')`
    ),
    ckStatus: check(
      "ck_loan_status",
      sql`${t.status} IN ('pending', 'approved', 'rejected', 'active', 'repaid', 'defaulted')`
    ),
    idxOrgStatus: index("idx_loan_org_status_due").on(
      t.organizationId,
      t.status,
      t.dueDate
    ),
  })
);

export const loanRepayment = pgTable(
  "loan_repayment",
  {
    id: text("id").primaryKey(),
    loanId: text("loan_id")
      .notNull()
      .references(() => loan.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    paidAt: timestamp("paid_at").defaultNow(),
    method: text("method"), // cash|MoMo|bank
    reference: text("reference"),
    recordedByUserId: text("recorded_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    ckAmountPositive: check("ck_repayment_amount_pos", sql`${t.amount} > 0`),
  })
);

/* ------------------------- Warehouses & Inventory ------------------------- */

export const commodity = pgTable("commodity", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // Maize, Rice
  uom: text("uom").default("kg"),
  imgUrl: text("img_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const commodityVariety = pgTable("commodity_variety", {
  id: text("id").primaryKey(),
  commodityId: text("commodity_id").references(() => commodity.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  maturityDays: integer("maturity_days"),
});

export const warehouse = pgTable("warehouse", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }), // owned by supplier/aggregator org
  name: text("name").notNull(),
  description: text("description"),
  districtId: text("district_id").references(() => district.id, {
    onDelete: "set null",
  }),
  community: text("community"),
  capacity: numeric("capacity", { precision: 14, scale: 2 }),
  gpsLat: numeric("gps_lat", { precision: 10, scale: 6 }),
  gpsLng: numeric("gps_lng", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const stockLot = pgTable("stock_lot", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  warehouseId: text("warehouse_id")
    .notNull()
    .references(() => warehouse.id, { onDelete: "cascade" }),
  commodityId: text("commodity_id")
    .notNull()
    .references(() => commodity.id, { onDelete: "cascade" }),
  varietyId: text("variety_id").references(() => commodityVariety.id, {
    onDelete: "set null",
  }),
  batchNumber: text("batch_number"),
  qty: numeric("qty", { precision: 14, scale: 2 }).notNull(),
  uom: text("uom").default("kg"),
  costPerUnit: numeric("cost_per_unit", { precision: 14, scale: 2 }),
  expiryDate: timestamp("expiry_date"),
  supplierName: text("supplier_name"),
  purchasedAt: timestamp("purchased_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockMovement = pgTable(
  "stock_movement",
  {
    id: text("id").primaryKey(),
    stockLotId: text("stock_lot_id")
      .notNull()
      .references(() => stockLot.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // in|out|adjustment|reserve|release
    qty: numeric("qty", { precision: 14, scale: 2 }).notNull(),
    reference: text("reference"),
    relatedEntity: text("related_entity"), // e.g., "purchase_order_item:ID"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (t) => ({
    ckQtyNotZero: check("ck_stock_movement_qty_not_zero", sql`${t.qty} != 0`),
    ckType: check(
      "ck_stock_movement_type",
      sql`${t.type} IN ('in', 'out', 'adjustment', 'reserve', 'release')`
    ),
    idxStockLotCreated: index("idx_stock_movement_lot_created").on(
      t.stockLotId,
      t.createdAt
    ),
  })
);

/* ---------------------------- Marketplace / PO ---------------------------- */

export const marketplaceListing = pgTable(
  "marketplace_listing",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }), // seller org
    commodityId: text("commodity_id")
      .notNull()
      .references(() => commodity.id, { onDelete: "cascade" }),
    varietyId: text("variety_id").references(() => commodityVariety.id, {
      onDelete: "set null",
    }),
    quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
    uom: text("uom").default("kg"),
    price: numeric("price", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").default("GHS"),
    status: text("status").default("available"), // available|reserved|sold|withdrawn
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    ckQuantityPositive: check("ck_listing_qty_pos", sql`${t.quantity} > 0`),
    ckPricePositive: check("ck_listing_price_pos", sql`${t.price} > 0`),
    ckStatus: check(
      "ck_listing_status",
      sql`${t.status} IN ('available', 'reserved', 'sold', 'withdrawn')`
    ),
    idxOrgStatus: index("idx_listing_org_status").on(
      t.organizationId,
      t.status
    ),
  })
);

export const purchaseOrder = pgTable(
  "purchase_order",
  {
    id: text("id").primaryKey(),
    poNumber: text("po_number").notNull(), // human-friendly
    buyerOrgId: text("buyer_org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    sellerOrgId: text("seller_org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    status: text("status").default("pending"), // pending|confirmed|fulfilled|cancelled
    paymentTerms: text("payment_terms").default("net7"), // net7|net30|immediate
    deferredPercent: integer("deferred_percent"), // e.g., 50
    createdAt: timestamp("created_at").defaultNow().notNull(),
    approvedAt: timestamp("approved_at"),
    approvedByUserId: text("approved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata"), // traceability flags, etc.
  },
  (t) => ({
    uqPoNumber: unique().on(t.poNumber),
    ckStatus: check(
      "ck_po_status",
      sql`${t.status} IN ('pending', 'confirmed', 'fulfilled', 'cancelled')`
    ),
    ckPaymentTerms: check(
      "ck_po_payment_terms",
      sql`${t.paymentTerms} IN ('net7', 'net30', 'immediate')`
    ),
    ckDeferredPercent: check(
      "ck_po_deferred_pct",
      sql`${t.deferredPercent} >= 0 AND ${t.deferredPercent} <= 100`
    ),
    idxBuyerStatus: index("idx_po_buyer_status").on(t.buyerOrgId, t.status),
    idxSellerStatus: index("idx_po_seller_status").on(t.sellerOrgId, t.status),
  })
);

export const purchaseOrderItem = pgTable(
  "purchase_order_item",
  {
    id: text("id").primaryKey(),
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrder.id, { onDelete: "cascade" }),
    commodityId: text("commodity_id")
      .notNull()
      .references(() => commodity.id, { onDelete: "restrict" }),
    varietyId: text("variety_id").references(() => commodityVariety.id, {
      onDelete: "set null",
    }),
    qty: numeric("qty", { precision: 14, scale: 2 }).notNull(),
    uom: text("uom").default("kg"),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").default("GHS"),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    ckQtyPositive: check("ck_poi_qty_pos", sql`${t.qty} > 0`),
    ckUnitPricePositive: check(
      "ck_poi_unit_price_pos",
      sql`${t.unitPrice} > 0`
    ),
  })
);

export const delivery = pgTable(
  "delivery",
  {
    id: text("id").primaryKey(),
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrder.id, { onDelete: "cascade" }),
    deliveredAt: timestamp("delivered_at").defaultNow(),
    deliveredQty: numeric("delivered_qty", { precision: 14, scale: 2 }),
    warehouseId: text("warehouse_id").references(() => warehouse.id, {
      onDelete: "set null",
    }),
    vehicleReg: text("vehicle_reg"),
    waybillNumber: text("waybill_number"),
    qrTag: text("qr_tag"), // for traceability
    deliveryLat: numeric("delivery_lat", { precision: 10, scale: 6 }),
    deliveryLng: numeric("delivery_lng", { precision: 10, scale: 6 }),
    receivedByUserId: text("received_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    idxPoId: index("idx_delivery_po_id").on(t.purchaseOrderId),
  })
);

export const receipt = pgTable(
  "receipt",
  {
    id: text("id").primaryKey(),
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrder.id, { onDelete: "cascade" }),
    receiptNo: text("receipt_no").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").default("GHS"),
    postedAt: timestamp("posted_at"),
    postedByUserId: text("posted_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (t) => ({
    ckTotalAmountPositive: check(
      "ck_receipt_total_pos",
      sql`${t.totalAmount} > 0`
    ),
  })
);

export const payment = pgTable(
  "payment",
  {
    id: text("id").primaryKey(),
    purchaseOrderId: text("purchase_order_id").references(
      () => purchaseOrder.id,
      { onDelete: "set null" }
    ),
    payerOrgId: text("payer_org_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    payeeOrgId: text("payee_org_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").default("GHS"),
    method: text("method"), // momo|bank|cash
    provider: text("provider"), // "mtn_momo" | "bank_transfer"
    feeAmount: numeric("fee_amount", { precision: 14, scale: 2 }).default("0"),
    netAmount: numeric("net_amount", { precision: 14, scale: 2 }),
    reference: text("reference"),
    idempotencyKey: text("idempotency_key"),
    status: text("status").default("completed"),
    paidAt: timestamp("paid_at").defaultNow(),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    ckAmountPositive: check("ck_payment_amount_pos", sql`${t.amount} > 0`),
    ckFeeNonNegative: check("ck_payment_fee_nonneg", sql`${t.feeAmount} >= 0`),
    ckStatus: check(
      "ck_payment_status",
      sql`${t.status} IN ('pending', 'completed', 'failed', 'cancelled')`
    ),
    uqIdempotency: unique().on(t.idempotencyKey),
    idxPoStatus: index("idx_payment_po_status").on(t.purchaseOrderId, t.status),
  })
);

/* ---------------------------- Supplier Input Credit ----------------------- */

export const inputCredit = pgTable(
  "input_credit",
  {
    id: text("id").primaryKey(),
    supplierOrgId: text("supplier_org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }), // supplier
    borrowerType: text("borrower_type").notNull(), // "farmer" | "team"
    farmerId: text("farmer_id").references(() => farmer.id, {
      onDelete: "set null",
    }),
    teamId: text("team_id").references(() => team.id, { onDelete: "set null" }),
    status: text("status").default("pending"), // pending|approved|issued|settled|defaulted
    requestedAt: timestamp("requested_at").defaultNow(),
    approvedAt: timestamp("approved_at"),
    issuedAt: timestamp("issued_at"),
    dueDate: timestamp("due_date"),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    ckBorrowerType: check(
      "ck_input_credit_borrower_type",
      sql`${t.borrowerType} IN ('farmer', 'team')`
    ),
    ckStatus: check(
      "ck_input_credit_status",
      sql`${t.status} IN ('pending', 'approved', 'issued', 'settled', 'defaulted')`
    ),
  })
);

export const inputCreditItem = pgTable("input_credit_item", {
  id: text("id").primaryKey(),
  inputCreditId: text("input_credit_id")
    .notNull()
    .references(() => inputCredit.id, { onDelete: "cascade" }),
  stockLotId: text("stock_lot_id").references(() => stockLot.id, {
    onDelete: "set null",
  }),
  commodityId: text("commodity_id")
    .notNull()
    .references(() => commodity.id, { onDelete: "restrict" }),
  qty: numeric("qty", { precision: 14, scale: 2 }).notNull(),
  uom: text("uom").default("kg"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").default("GHS"),
});

/* --------------------------------- Comms ---------------------------------- */

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "set null",
  }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  channel: text("channel").notNull(), // email|sms|inapp|webhook
  templateKey: text("template_key").notNull(), // e.g., "receipt.created"
  toAddress: text("to_address"), // email or phone
  payload: jsonb("payload"), // rendered content or params
  status: text("status").default("queued"), // queued|sent|failed
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

/* --------------------------------- Audit ---------------------------------- */

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "set null",
  }),
  actorUserId: text("actor_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(), // e.g., "loan.approve"
  entity: text("entity").notNull(), // e.g., "loan:ID"
  context: jsonb("context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* -------------------------------- Relations -------------------------------- */

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  memberships: many(member),
  teamMemberships: many(teamMember),
  invitations: many(invitation),
  savingsEntries: many(savingsEntry),
  loanApprovals: many(loan, { relationName: "loanApprover" }),
  loanRepayments: many(loanRepayment),
  stockMovements: many(stockMovement),
  purchaseOrderApprovals: many(purchaseOrder),
  deliveries: many(delivery),
  auditLogs: many(auditLog),
  notifications: many(notification),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  teams: many(team),
  members: many(member),
  invitations: many(invitation),
  farmers: many(farmer),
  farms: many(farm),
  savingsAccounts: many(savingsAccount),
  savingsEntries: many(savingsEntry),
  loans: many(loan),
  warehouses: many(warehouse),
  stockLots: many(stockLot),
  marketplaceListings: many(marketplaceListing),
  purchaseOrdersBuyer: many(purchaseOrder, { relationName: "buyerOrg" }),
  purchaseOrdersSeller: many(purchaseOrder, { relationName: "sellerOrg" }),
  inputCreditsSupplier: many(inputCredit, { relationName: "supplierOrg" }),
  paymentsPayer: many(payment, { relationName: "payerOrg" }),
  paymentsPayee: many(payment, { relationName: "payeeOrg" }),
  notifications: many(notification),
  auditLogs: many(auditLog),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id],
  }),
  teamMembers: many(teamMember),
  teamFarmers: many(teamFarmer),
  savingsAccounts: many(savingsAccount),
  loans: many(loan),
  inputCredits: many(inputCredit),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const regionRelations = relations(region, ({ many }) => ({
  districts: many(district),
}));

export const districtRelations = relations(district, ({ one, many }) => ({
  region: one(region, {
    fields: [district.regionCode],
    references: [region.code],
  }),
  farmers: many(farmer),
  warehouses: many(warehouse),
}));

export const farmerRelations = relations(farmer, ({ one, many }) => ({
  organization: one(organization, {
    fields: [farmer.organizationId],
    references: [organization.id],
  }),
  district: one(district, {
    fields: [farmer.districtId],
    references: [district.id],
  }),
  teamFarmers: many(teamFarmer),
  farms: many(farm),
  savingsAccounts: many(savingsAccount),
  loans: many(loan),
  inputCredits: many(inputCredit),
}));

export const teamFarmerRelations = relations(teamFarmer, ({ one }) => ({
  team: one(team, {
    fields: [teamFarmer.teamId],
    references: [team.id],
  }),
  farmer: one(farmer, {
    fields: [teamFarmer.farmerId],
    references: [farmer.id],
  }),
}));

export const farmRelations = relations(farm, ({ one, many }) => ({
  organization: one(organization, {
    fields: [farm.organizationId],
    references: [organization.id],
  }),
  farmer: one(farmer, {
    fields: [farm.farmerId],
    references: [farmer.id],
  }),
  coordinates: many(farmCoordinate),
  yields: many(farmYield),
}));

export const farmCoordinateRelations = relations(farmCoordinate, ({ one }) => ({
  farm: one(farm, {
    fields: [farmCoordinate.farmId],
    references: [farm.id],
  }),
}));

export const farmYieldRelations = relations(farmYield, ({ one }) => ({
  farm: one(farm, {
    fields: [farmYield.farmId],
    references: [farm.id],
  }),
}));

export const savingsAccountRelations = relations(
  savingsAccount,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [savingsAccount.organizationId],
      references: [organization.id],
    }),
    farmer: one(farmer, {
      fields: [savingsAccount.farmerId],
      references: [farmer.id],
    }),
    team: one(team, {
      fields: [savingsAccount.teamId],
      references: [team.id],
    }),
    entries: many(savingsEntry),
  })
);

export const savingsEntryRelations = relations(savingsEntry, ({ one }) => ({
  account: one(savingsAccount, {
    fields: [savingsEntry.accountId],
    references: [savingsAccount.id],
  }),
  organization: one(organization, {
    fields: [savingsEntry.organizationId],
    references: [organization.id],
  }),
  recordedBy: one(user, {
    fields: [savingsEntry.recordedByUserId],
    references: [user.id],
  }),
}));

export const loanRelations = relations(loan, ({ one, many }) => ({
  organization: one(organization, {
    fields: [loan.organizationId],
    references: [organization.id],
  }),
  farmer: one(farmer, {
    fields: [loan.farmerId],
    references: [farmer.id],
  }),
  team: one(team, {
    fields: [loan.teamId],
    references: [team.id],
  }),
  approvedBy: one(user, {
    fields: [loan.approvedByUserId],
    references: [user.id],
    relationName: "loanApprover",
  }),
  repayments: many(loanRepayment),
}));

export const loanRepaymentRelations = relations(loanRepayment, ({ one }) => ({
  loan: one(loan, {
    fields: [loanRepayment.loanId],
    references: [loan.id],
  }),
  recordedBy: one(user, {
    fields: [loanRepayment.recordedByUserId],
    references: [user.id],
  }),
}));

export const commodityRelations = relations(commodity, ({ many }) => ({
  varieties: many(commodityVariety),
  stockLots: many(stockLot),
  marketplaceListings: many(marketplaceListing),
  purchaseOrderItems: many(purchaseOrderItem),
  inputCreditItems: many(inputCreditItem),
}));

export const commodityVarietyRelations = relations(
  commodityVariety,
  ({ one, many }) => ({
    commodity: one(commodity, {
      fields: [commodityVariety.commodityId],
      references: [commodity.id],
    }),
    stockLots: many(stockLot),
    marketplaceListings: many(marketplaceListing),
    purchaseOrderItems: many(purchaseOrderItem),
  })
);

export const warehouseRelations = relations(warehouse, ({ one, many }) => ({
  organization: one(organization, {
    fields: [warehouse.organizationId],
    references: [organization.id],
  }),
  district: one(district, {
    fields: [warehouse.districtId],
    references: [district.id],
  }),
  stockLots: many(stockLot),
  deliveries: many(delivery),
}));

export const stockLotRelations = relations(stockLot, ({ one, many }) => ({
  organization: one(organization, {
    fields: [stockLot.organizationId],
    references: [organization.id],
  }),
  warehouse: one(warehouse, {
    fields: [stockLot.warehouseId],
    references: [warehouse.id],
  }),
  commodity: one(commodity, {
    fields: [stockLot.commodityId],
    references: [commodity.id],
  }),
  variety: one(commodityVariety, {
    fields: [stockLot.varietyId],
    references: [commodityVariety.id],
  }),
  movements: many(stockMovement),
  inputCreditItems: many(inputCreditItem),
}));

export const stockMovementRelations = relations(stockMovement, ({ one }) => ({
  stockLot: one(stockLot, {
    fields: [stockMovement.stockLotId],
    references: [stockLot.id],
  }),
  createdBy: one(user, {
    fields: [stockMovement.createdByUserId],
    references: [user.id],
  }),
}));

export const marketplaceListingRelations = relations(
  marketplaceListing,
  ({ one }) => ({
    organization: one(organization, {
      fields: [marketplaceListing.organizationId],
      references: [organization.id],
    }),
    commodity: one(commodity, {
      fields: [marketplaceListing.commodityId],
      references: [commodity.id],
    }),
    variety: one(commodityVariety, {
      fields: [marketplaceListing.varietyId],
      references: [commodityVariety.id],
    }),
  })
);

export const purchaseOrderRelations = relations(
  purchaseOrder,
  ({ one, many }) => ({
    buyerOrg: one(organization, {
      fields: [purchaseOrder.buyerOrgId],
      references: [organization.id],
      relationName: "buyerOrg",
    }),
    sellerOrg: one(organization, {
      fields: [purchaseOrder.sellerOrgId],
      references: [organization.id],
      relationName: "sellerOrg",
    }),
    approvedBy: one(user, {
      fields: [purchaseOrder.approvedByUserId],
      references: [user.id],
    }),
    items: many(purchaseOrderItem),
    deliveries: many(delivery),
    receipts: many(receipt),
    payments: many(payment),
  })
);

export const purchaseOrderItemRelations = relations(
  purchaseOrderItem,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrder, {
      fields: [purchaseOrderItem.purchaseOrderId],
      references: [purchaseOrder.id],
    }),
    commodity: one(commodity, {
      fields: [purchaseOrderItem.commodityId],
      references: [commodity.id],
    }),
    variety: one(commodityVariety, {
      fields: [purchaseOrderItem.varietyId],
      references: [commodityVariety.id],
    }),
  })
);

export const deliveryRelations = relations(delivery, ({ one }) => ({
  purchaseOrder: one(purchaseOrder, {
    fields: [delivery.purchaseOrderId],
    references: [purchaseOrder.id],
  }),
  warehouse: one(warehouse, {
    fields: [delivery.warehouseId],
    references: [warehouse.id],
  }),
  receivedBy: one(user, {
    fields: [delivery.receivedByUserId],
    references: [user.id],
  }),
}));

export const receiptRelations = relations(receipt, ({ one }) => ({
  purchaseOrder: one(purchaseOrder, {
    fields: [receipt.purchaseOrderId],
    references: [purchaseOrder.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  purchaseOrder: one(purchaseOrder, {
    fields: [payment.purchaseOrderId],
    references: [purchaseOrder.id],
  }),
  payerOrg: one(organization, {
    fields: [payment.payerOrgId],
    references: [organization.id],
    relationName: "payerOrg",
  }),
  payeeOrg: one(organization, {
    fields: [payment.payeeOrgId],
    references: [organization.id],
    relationName: "payeeOrg",
  }),
}));

export const inputCreditRelations = relations(inputCredit, ({ one, many }) => ({
  supplierOrg: one(organization, {
    fields: [inputCredit.supplierOrgId],
    references: [organization.id],
    relationName: "supplierOrg",
  }),
  farmer: one(farmer, {
    fields: [inputCredit.farmerId],
    references: [farmer.id],
  }),
  team: one(team, {
    fields: [inputCredit.teamId],
    references: [team.id],
  }),
  items: many(inputCreditItem),
}));

export const inputCreditItemRelations = relations(
  inputCreditItem,
  ({ one }) => ({
    inputCredit: one(inputCredit, {
      fields: [inputCreditItem.inputCreditId],
      references: [inputCredit.id],
    }),
    stockLot: one(stockLot, {
      fields: [inputCreditItem.stockLotId],
      references: [stockLot.id],
    }),
    commodity: one(commodity, {
      fields: [inputCreditItem.commodityId],
      references: [commodity.id],
    }),
  })
);

export const notificationRelations = relations(notification, ({ one }) => ({
  organization: one(organization, {
    fields: [notification.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  organization: one(organization, {
    fields: [auditLog.organizationId],
    references: [organization.id],
  }),
  actor: one(user, {
    fields: [auditLog.actorUserId],
    references: [user.id],
  }),
}));
