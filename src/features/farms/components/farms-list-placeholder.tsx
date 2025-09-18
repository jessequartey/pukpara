export function FarmsListPlaceholder() {
  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
        <h3 className="font-semibold text-base">Registered farms</h3>
        <p className="text-muted-foreground text-sm">
          List of farms, acreage, crop mix, and monitoring cadence.
        </p>
      </header>
      <div className="px-6 py-10 text-muted-foreground text-sm">
        Farm records with upcoming visits and harvest projections will be listed
        here.
      </div>
    </section>
  );
}
