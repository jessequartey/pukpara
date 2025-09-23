import { createTRPCRouter } from "../../trpc";
import { adminFarmersRouter } from "./farmers";
import { adminOrganizationsRouter } from "./organizations";

export const adminRouter = createTRPCRouter({
	organizations: adminOrganizationsRouter,
	farmers: adminFarmersRouter,
});
