import { createTRPCRouter } from "../../trpc";
import { organizationFarmersRouter } from "./farmers";
import { organizationGroupsRouter } from "./groups";
import { organizationMembersRouter } from "./members";

export const organizationRouter = createTRPCRouter({
	members: organizationMembersRouter,
	farmers: organizationFarmersRouter,
	groups: organizationGroupsRouter,
});
