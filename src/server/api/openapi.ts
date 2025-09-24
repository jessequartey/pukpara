import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "./root";

export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: "Pukpara API",
	description: "Pukpara API documentation",
	version: "1.0.0",
	baseUrl:
		process.env.NODE_ENV === "production"
			? "https://your-domain.com/api"
			: "http://localhost:3000/api",
	tags: ["auth", "districts", "organizations", "organization", "admin"],
});
