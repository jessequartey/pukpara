// organization-permissions.ts
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
} from "better-auth/plugins/organization/access";

/**
 * Define the permission "vocabulary" for organization-level features.
 */
const statement = {
  ...defaultStatements,
  farmers: ["create", "update", "delete", "view"],
  groups: ["create", "update", "delete", "view"],
  farms: ["create", "update", "delete", "view"],
  financial: ["savings.record", "savings.view", "loan.request", "loan.approve"],
  warehouse: ["create", "update", "delete", "view", "inventory.manage"],
  marketplace: ["create", "update", "delete", "view", "trade"],
  users: ["invite", "update", "remove", "view"],
  organization: ["update"],
} as const;

// Create access controller
export const ac = createAccessControl(statement);

/**
 * Roles for organization members
 */
export const member = ac.newRole({
  farmers: ["view"],
  groups: ["view"],
  financial: ["savings.view"],
  warehouse: ["view"],
  marketplace: ["view"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  farmers: ["create", "update", "delete", "view"],
  groups: ["create", "update", "delete", "view"],
  farms: ["create", "update", "delete", "view"],
  financial: ["savings.record", "savings.view", "loan.request", "loan.approve"],
  warehouse: ["create", "update", "delete", "view", "inventory.manage"],
  marketplace: ["create", "update", "delete", "trade"],
  users: ["invite", "update", "remove", "view"],
  organization: ["update"],
});

export const owner = ac.newRole({
  ...adminAc.statements,
  farmers: ["create", "update", "delete", "view"],
  groups: ["create", "update", "delete", "view"],
  farms: ["create", "update", "delete", "view"],
  financial: ["savings.record", "savings.view", "loan.request", "loan.approve"],
  warehouse: ["create", "update", "delete", "view", "inventory.manage"],
  marketplace: ["create", "update", "delete", "trade"],
  users: ["invite", "update", "remove", "view"],
  organization: ["update"],
});

export const editor = ac.newRole({
  farmers: ["create", "update", "delete", "view"],
  groups: ["create", "update", "delete", "view"],
  farms: ["create", "update", "delete", "view"],
  financial: ["savings.record", "savings.view", "loan.request", "loan.approve"],
  warehouse: ["create", "update", "delete", "view", "inventory.manage"],
  marketplace: ["create", "update", "delete", "trade"],
});

/**
 * Example custom role — for field officers
 */
export const fieldAgent = ac.newRole({
  farmers: ["create", "update", "view"],
  farms: ["create", "update", "view"],
  groups: ["view"],
  financial: ["savings.record", "savings.view"],
});

export const farmer = ac.newRole({
  farmers: ["create", "update", "view"],
  farms: ["create", "update", "view"],
  groups: ["view"],
  financial: ["savings.record", "savings.view"],
});

export const OrgRoles = {
  member,
  admin,
  owner,
  farmer,
  fieldAgent,
};
