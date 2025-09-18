import { Download, PiggyBank, Receipt, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationDetailsShell } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationFinancePageProps = {
  params: { organizationId: string };
};

const sampleSavingsAccounts = [
  {
    id: "sav-1",
    entity: "Farmer",
    name: "Kofi Owusu",
    balance: "₵4,800",
    lastActivity: "2024-05-18",
  },
  {
    id: "sav-2",
    entity: "Team",
    name: "VSLA — Abetifi",
    balance: "₵12,540",
    lastActivity: "2024-05-17",
  },
];

const sampleLoans = [
  {
    id: "loan-1",
    applicant: "Ama Sarfo",
    principal: "₵8,000",
    rate: "14%",
    term: "120 days",
    status: "Pipeline",
    requestedAt: "2024-05-12",
  },
  {
    id: "loan-2",
    applicant: "Yaw Sarpong",
    principal: "₵5,500",
    rate: "12%",
    term: "90 days",
    status: "Active",
    requestedAt: "2024-04-01",
  },
];

const sampleRepayments = [
  {
    id: "rep-1",
    reference: "RP-1021",
    borrower: "Kofi Owusu",
    amount: "₵1,200",
    collectedAt: "2024-05-15",
  },
  {
    id: "rep-2",
    reference: "RP-1020",
    borrower: "VSLA — Abetifi",
    amount: "₵2,640",
    collectedAt: "2024-05-10",
  },
];

export default function OrganizationFinancePage({
  params,
}: OrganizationFinancePageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const encodedId = encodeURIComponent(organizationId);
  const currentPath = `/admin/organizations/${encodedId}/finance`;

  return (
    <OrganizationDetailsShell
      breadcrumbs={[{ label: "Finance" }]}
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {() => (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <FinanceMetric
              hint="Across 42 accounts"
              icon={<PiggyBank aria-hidden className="size-4" />}
              label="Savings balance"
              value="₵17,340"
            />
            <FinanceMetric
              hint="6 loans disbursed"
              icon={<TrendingUp aria-hidden className="size-4" />}
              label="Active loans"
              value="₵23,500"
            />
            <FinanceMetric
              hint="84% on-time"
              icon={<Receipt aria-hidden className="size-4" />}
              label="Repayments (30d)"
              value="₵9,420"
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Savings accounts</CardTitle>
                <CardDescription>
                  Account summaries by entity type with quick jumps to the
                  ledger.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Last activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleSavingsAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <Badge variant="outline">{account.entity}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {account.name}
                        </TableCell>
                        <TableCell>{account.balance}</TableCell>
                        <TableCell>{account.lastActivity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan pipeline</CardTitle>
                <CardDescription>
                  Approvals, disbursements, and servicing tracked in one view.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">
                          {loan.applicant}
                        </TableCell>
                        <TableCell>{loan.principal}</TableCell>
                        <TableCell>{loan.rate}</TableCell>
                        <TableCell>{loan.term}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{loan.status}</Badge>
                        </TableCell>
                        <TableCell>{loan.requestedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent repayments</CardTitle>
              <CardDescription>
                Monitor cash collections and export for reconciliation with the
                general ledger.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Collected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleRepayments.map((repayment) => (
                    <TableRow key={repayment.id}>
                      <TableCell className="font-mono text-sm">
                        {repayment.reference}
                      </TableCell>
                      <TableCell>{repayment.borrower}</TableCell>
                      <TableCell>{repayment.amount}</TableCell>
                      <TableCell>{repayment.collectedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed p-4">
                <div>
                  <p className="font-medium">Need offline reconciliation?</p>
                  <p className="text-muted-foreground text-sm">
                    Export repayments to CSV and ingest into your accounting
                    stack.
                  </p>
                </div>
                <Button size="sm" variant="secondary">
                  <Download aria-hidden className="mr-2 size-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </OrganizationDetailsShell>
  );
}

const FinanceMetric = ({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="font-medium text-sm">{label}</CardTitle>
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
    </CardHeader>
    <CardContent>
      <div className="font-semibold text-3xl tracking-tight">{value}</div>
      <p className="text-muted-foreground text-xs">{hint}</p>
    </CardContent>
  </Card>
);
