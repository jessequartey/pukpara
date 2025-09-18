import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";

export default function PendingApprovalPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <PageTitle
        breadcrumbs={[{ label: "Access pending" }]}
        description="Your account is awaiting approval from the Pukpara team. We'll notify you as soon as it's ready."
        title="Almost there"
      />
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">
          Our onboarding specialists are reviewing your submission. You can
          return later or get in touch if you need to expedite access.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild>
            <Link href="mailto:support@pukpara.com">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
