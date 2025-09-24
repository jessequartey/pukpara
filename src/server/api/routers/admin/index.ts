import { createTRPCRouter } from "../../trpc";
import { adminFarmersRouter } from "./farmers";
import { adminOrganizationsRouter } from "./organizations";
import { adminUsersRouter } from "./users";

export const adminRouter = createTRPCRouter({
	organizations: adminOrganizationsRouter,
	farmers: adminFarmersRouter,
	users: adminUsersRouter,
});
