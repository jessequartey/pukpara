/**
 * Quick script to create a sample organization for testing farmer bulk upload
 */

import { randomUUID } from "node:crypto";
import { db } from "../src/server/db/index.js";
import { organization } from "../src/server/db/schema.js";

async function createSampleOrganization() {
  try {
    const orgId = randomUUID();

    const newOrg = await db
      .insert(organization)
      .values({
        id: orgId,
        name: "Demo Farmers Cooperative",
        slug: "demo-farmers-coop",
        createdAt: new Date(),
        contactEmail: "demo@farmers.coop",
        contactPhone: "+233200000000",
        address: "Demo Address, Ghana",
        status: "active",
        subscriptionType: "freemium",
        licenseStatus: "issued",
        organizationType: "farmer_org",
        kycStatus: "verified",
      })
      .returning();

    console.log("✅ Created sample organization:", newOrg[0]);

    // Create a second organization for testing
    const orgId2 = randomUUID();

    const newOrg2 = await db
      .insert(organization)
      .values({
        id: orgId2,
        name: "Test Agricultural Society",
        slug: "test-agro-society",
        createdAt: new Date(),
        contactEmail: "test@agro.society",
        contactPhone: "+233200000001",
        address: "Test Address, Ghana",
        status: "active",
        subscriptionType: "freemium",
        licenseStatus: "issued",
        organizationType: "farmer_org",
        kycStatus: "verified",
      })
      .returning();

    console.log("✅ Created second organization:", newOrg2[0]);

    console.log("🎉 Sample organizations created successfully!");
  } catch (error) {
    console.error("❌ Error creating organizations:", error);
  }
}

createSampleOrganization().catch(console.error);
