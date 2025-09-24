import { z } from "zod";
import {
	createCallerFactory,
	createTRPCRouter,
	publicProcedure,
} from "@/server/api/trpc";
import { adminRouter } from "./routers/admin";
import { authRouter } from "./routers/auth";
import { districtsRouter } from "./routers/districts";
import { organizationRouter } from "./routers/organization";
import { organizationsRouter } from "./routers/organizations";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	auth: authRouter,
	districts: districtsRouter,
	organizations: organizationsRouter,
	organization: organizationRouter,
	admin: adminRouter,
	hello: publicProcedure
		.meta({
			openapi: {
				method: "GET",
				path: "/hello",
				tags: ["general"],
				summary: "Simple hello endpoint",
				description: "Returns a greeting message",
			},
		})
		.input(z.object({ text: z.string().optional() }))
		.output(z.object({ greeting: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input?.text ?? "world"}`,
			};
		}),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
