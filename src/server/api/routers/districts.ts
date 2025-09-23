import { asc, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { district, region } from "@/server/db/schema";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const districtsRouter = createTRPCRouter({
	list: publicProcedure.query(async () => {
		const rows = await db
			.select({
				id: district.id,
				code: district.code,
				name: district.name,
				regionCode: region.code,
				regionName: region.name,
			})
			.from(district)
			.innerJoin(region, eq(district.regionCode, region.code))
			.orderBy(asc(region.name), asc(district.name));

		const groupedMap = rows.reduce(
			(map, row) => {
				const entry = map.get(row.regionCode) ?? {
					code: row.regionCode,
					name: row.regionName,
					districts: [] as Array<{
						id: string;
						name: string;
						code: string | null;
					}>,
				};

				entry.districts.push({
					id: row.id,
					name: row.name,
					code: row.code ?? null,
				});

				map.set(row.regionCode, entry);
				return map;
			},
			new Map<
				string,
				{
					code: string;
					name: string;
					districts: Array<{ id: string; name: string; code: string | null }>;
				}
			>(),
		);

		const regions = Array.from(groupedMap.values()).map((entry) => ({
			...entry,
			districts: entry.districts.sort((a, b) =>
				a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
			),
		}));

		regions.sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
		);

		return { regions };
	}),
});
