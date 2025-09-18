export function GroupsListPlaceholder() {
  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="font-semibold text-base">All groups</h3>
        <p className="text-muted-foreground text-sm">
          Filter by region, lead, or lifecycle stage.
        </p>
      </header>
      <div className="px-6 py-10 text-muted-foreground text-sm">
        Group records, leaders, and membership stats will surface here.
      </div>
    </section>
  );
}
