const adminMetrics = [
  { label: "Active organizations", value: "Coming soon" },
  { label: "Platform users", value: "Coming soon" },
  { label: "Outstanding loans", value: "Coming soon" },
  { label: "Marketplace volume", value: "Coming soon" },
];

export function AdminOverviewCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {adminMetrics.map((item) => (
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
