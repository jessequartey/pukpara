export function FarmersDirectoryPlaceholder() {
	return (
		<section className="rounded-xl border bg-card shadow-sm">
			<header className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
				<h3 className="font-semibold text-base">Farmers directory</h3>
				<p className="text-muted-foreground text-sm">
					Search, filter, and bulk manage farmer records.
				</p>
			</header>
			<div className="px-6 py-10 text-muted-foreground text-sm">
				Upcoming farmer data grids and quick filters will live here.
			</div>
		</section>
	);
}
