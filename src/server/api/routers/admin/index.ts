import { createTRPCRouter } from "../../trpc";
import { adminOrganizationsRouter } from "./organizations";

export const adminRouter = createTRPCRouter({
  organizations: adminOrganizationsRouter,
});