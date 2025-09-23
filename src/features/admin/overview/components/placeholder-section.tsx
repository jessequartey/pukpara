type PlaceholderSectionProps = {
	title: string;
	description: string;
};

export function PlaceholderSection({
	title,
	description,
}: PlaceholderSectionProps) {
	return (
		<section className="rounded-xl border bg-card p-6 shadow-sm">
			<h3 className="font-semibold text-base">{title}</h3>
			<p className="mt-3 text-muted-foreground text-sm">{description}</p>
		</section>
	);
}
