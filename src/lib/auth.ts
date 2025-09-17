import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, organization, phoneNumber } from "better-auth/plugins";
import { db } from "@/server/db";
import { AdminRoles, ac } from "./admin-permissions";
import { OrgRoles, ac as orgAC } from "./org-permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      districtId: {
        type: "string",
        required: true,
      },
      address: {
        type: "string",
        required: true,
      },
      approvedAt: {
        type: "date",
        input: false,
      },
    },
  },
  plugins: [
    phoneNumber({
      requireVerification: false,
      // biome-ignore lint/suspicious/useAwait: <necessary>
      // biome-ignore lint/nursery/noShadow: <necessary>
      sendOTP: async ({ phoneNumber, code }) => {
        // biome-ignore lint/suspicious/noConsole: <necessary>
        console.log(`Sending OTP ${code} to phone number ${phoneNumber}`);
      },
    }),
    admin({
      ac,
      roles: {
        ...AdminRoles,
      },
    }),
    organization({
      ac: orgAC,
      roles: {
        ...OrgRoles,
      },
      schema: {
        organization: {
          additionalFields: {
            OrgType: {
              type: "string",
              input: true,
              required: true,
            },
          },
        },
      },
    }),
    openAPI(),
  ],
});
