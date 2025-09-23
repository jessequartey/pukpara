const overviewMetrics = [
	{ label: "Active farmers", value: "Coming soon" },
	{ label: "Total groups", value: "Coming soon" },
	{ label: "Season yield", value: "Coming soon" },
	{ label: "Loan exposure", value: "Coming soon" },
];

export function OrganizationOverviewCards() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{overviewMetrics.map((item) => (
				<div
					className="rounded-xl border bg-card p-6 shadow-sm"
					key={item.label}
				>
					<p className="text-muted-foreground text-sm">{item.label}</p>
					<p className="mt-3 font-semibold text-2xl">{item.value}</p>
				</div>
			))}
		</div>
	);
}
