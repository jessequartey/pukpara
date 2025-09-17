// admin-permissions.ts
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

/**
 * Define the permission "vocabulary" for the app.
 * These are the resources and their allowed actions.
 */
const statement = {
  ...defaultStatements,

  tenant: ["create", "update", "delete", "view"],
  users: ["invite", "suspend", "update", "delete", "view"],
  farmers: ["create", "update", "delete", "view"],
  farms: ["create", "update", "delete", "view"],
  financial: ["savings.view", "savings.record", "loan.request", "loan.approve"],
  warehouse: ["create", "update", "delete", "view", "inventory.manage"],
  marketplace: ["create", "update", "delete", "view", "trade"],
} as const;

// Create access controller
export const ac = createAccessControl(statement);

/**
 * Roles extending the built-in Admin roles.
 * These merge app-specific permissions with Better-Auth's admin defaults.
 */
export const admin = ac.newRole({
  ...adminAc.statements, // keep the full admin baseline
  tenant: ["create", "update", "delete", "view"],
  users: ["invite", "suspend", "update", "delete", "view"],
  financial: ["savings.view", "loan.approve"],
  warehouse: ["inventory.manage", "update", "view"],
  marketplace: ["create", "update", "delete", "trade"],
});

export const supportAdmin = ac.newRole({
  ...adminAc.statements,
  users: ["view", "update"],
  farmers: ["view"],
  financial: ["savings.view"],
  warehouse: ["view"],
  marketplace: ["view"],
});

/**
 * Export all available admin roles.
 */
export const AdminRoles = {
  userAc,
  admin,
  supportAdmin,
};
