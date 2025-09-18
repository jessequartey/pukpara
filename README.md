# Pukpara

Pukpara is a multi-tenant agri-operations platform built by Juu Technologies for WamiAgro to digitize smallholder value chains across Ghana and beyond. It helps farmer organizations and partners manage farmers and groups, capture production data, run VSLA savings and loans, track input inventory and warehouse flows, and transact in a lightweight marketplace—with financiers able to fund inputs or settle deliveries based on real-time, traceable events.

## Who it serves

* **Farmer orgs** (VSLA/FBO/Cooperatives/Aggregators) managing members, groups, farms, savings, and loan requests
* **Suppliers** managing stock, issuing input credit, and fulfilling orders
* **Buyers** placing POs and confirming deliveries
* **Financial partners** underwriting/issuing loans and monitoring repayments
* **Platform admins** overseeing tenants, licensing, compliance, and analytics

## What it does

* **Farmer & Group Management**: onboarding, KYC, team (group) membership, farm profiles, geo-coordinates, yields
* **Finance**: VSLA savings accounts, loan requests/approvals/repayments, input credit issuance, audit trail
* **Warehousing & Inventory**: warehouses, stock lots, movements, receipts, traceability (QR/waybills)
* **Marketplace**: listings, purchase orders, deliveries, receipts, and payments (deferred terms supported)
* **Reporting**: tenant and platform dashboards with KPIs (farmers, groups, savings, outstanding loans), line/bar/pie charts
* **Access & Security**: role/permission model per organization, admin controls, audit logs

## How it's delivered

* **Web app** for rich management workflows; **USSD** for low-bandwidth farmer interactions (requests, balances, updates)
* **Subscription model** with freemium onboarding and annual licensing for aggregators
* **Integration-ready** for SMS/Email, payments, and bank partners; designed for data portability and migration

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) package manager
- Database (Neon PostgreSQL recommended)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd pukpara
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment setup

Copy the environment template and configure your variables:

```bash
cp .env.local.example .env.local
```

Configure the following required environment variables in `.env.local`:

```env
# Database
DATABASE_URL="your-neon-postgresql-connection-string"

# Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Other configuration variables...
```

### 4. Database setup

#### Generate and run migrations

```bash
pnpm db:generate
pnpm db:migrate
```

#### Seed the database

Seed Ghana regions and districts:

```bash
pnpm tsx scripts/seed-districts.ts
```

Seed admin users and demo organization:

```bash
pnpm tsx scripts/seed-admin-tenant.ts
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 6. Default login credentials

After seeding, you can log in with these default accounts:

**Platform Admin:**
- Email: `admin@wamiagro.com`
- Password: `superkey`

**Tenant Administrator:**
- Email: `tenant@wamiagro.com`
- Password: `superkey`

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter (Ultracite)
- `pnpm format` - Format code (Ultracite)
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm deploy` - Deploy to Cloudflare Pages
- `pnpm preview` - Preview Cloudflare Pages build locally

## Database Management

The application uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL. Common database tasks:

### View/Edit Database
```bash
pnpm db:studio
```

### Create New Migration
After modifying schema files, generate new migrations:
```bash
pnpm db:generate
pnpm db:migrate
```

### Reset Database
To completely reset your database:
1. Drop all tables in your database
2. Run migrations: `pnpm db:migrate`
3. Run seeding scripts as described above

## Development

### Code Quality

This project uses [Ultracite](https://ultracite.dev/) for linting and formatting, which enforces strict TypeScript, accessibility, and code quality standards.

### Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── config/             # Configuration constants
├── features/           # Feature-specific modules
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
└── server/             # Server-side code (API, database)
    ├── api/            # tRPC API routes
    ├── db/             # Database schema and connection
    └── email/          # Email templates and sending
```

## Deployment

The application is configured for deployment on Cloudflare Pages:

```bash
pnpm deploy
```

For other platforms, build the application and serve the `.next` directory:

```bash
pnpm build
pnpm start
```

## Contributing

1. Follow the established code patterns and conventions
2. Run `pnpm lint` and `pnpm format` before committing
3. Ensure all database changes include proper migrations
4. Test your changes thoroughly with both admin and tenant accounts

---

In short, Pukpara connects field activity to finance and markets—reducing friction, improving trust, and unlocking affordable capital for smallholders.
