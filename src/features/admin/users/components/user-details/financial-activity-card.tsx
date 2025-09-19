"use client";

import { DollarSign, TrendingUp, PiggyBank, CreditCard, Package, ExternalLink } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

type FinancialActivityCardProps = {
  userId: string;
};

type SavingsEntry = {
  id: string;
  date: Date;
  accountName: string;
  type: "deposit" | "withdrawal";
  amount: number;
  reference: string;
  currency: string;
};

type LoanRepayment = {
  id: string;
  date: Date;
  loanId: string;
  amount: number;
  method: string;
  reference: string;
  currency: string;
};

type StockMovement = {
  id: string;
  date: Date;
  lotName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  unit: string;
};

const RECENT_ENTRIES_LIMIT = 5;

export function FinancialActivityCard({ userId: _ }: FinancialActivityCardProps) {
  // Mock data - replace with actual API calls
  const financialStats = {
    savingsEntriesRecorded: 45,
    loanRepaymentsRecorded: 12,
    stockMovementsRecorded: 23,
  };

  const recentSavingsEntries: SavingsEntry[] = [
    {
      id: "se_1",
      date: new Date("2024-01-20T10:00:00Z"),
      accountName: "Main Savings",
      type: "deposit",
      amount: 500.00,
      reference: "REF-2024-001",
      currency: "GHS",
    },
    {
      id: "se_2",
      date: new Date("2024-01-19T14:30:00Z"),
      accountName: "Emergency Fund",
      type: "withdrawal",
      amount: 100.00,
      reference: "REF-2024-002",
      currency: "GHS",
    },
    {
      id: "se_3",
      date: new Date("2024-01-18T09:15:00Z"),
      accountName: "Main Savings",
      type: "deposit",
      amount: 750.00,
      reference: "REF-2024-003",
      currency: "GHS",
    },
  ];

  const recentLoanRepayments: LoanRepayment[] = [
    {
      id: "lr_1",
      date: new Date("2024-01-20T11:00:00Z"),
      loanId: "LOAN-2024-001",
      amount: 1200.00,
      method: "Bank Transfer",
      reference: "PAY-2024-001",
      currency: "GHS",
    },
    {
      id: "lr_2",
      date: new Date("2024-01-15T16:45:00Z"),
      loanId: "LOAN-2024-002",
      amount: 800.00,
      method: "Mobile Money",
      reference: "PAY-2024-002",
      currency: "GHS",
    },
  ];

  const recentStockMovements: StockMovement[] = [
    {
      id: "sm_1",
      date: new Date("2024-01-20T13:30:00Z"),
      lotName: "Maize Lot #ML001",
      type: "in",
      quantity: 500,
      unit: "kg",
    },
    {
      id: "sm_2",
      date: new Date("2024-01-19T10:15:00Z"),
      lotName: "Rice Lot #RL005",
      type: "out",
      quantity: 200,
      unit: "kg",
    },
    {
      id: "sm_3",
      date: new Date("2024-01-18T15:00:00Z"),
      lotName: "Beans Lot #BL003",
      type: "adjustment",
      quantity: 50,
      unit: "kg",
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getEntryTypeVariant = (type: string) => {
    switch (type) {
      case "deposit":
      case "in":
        return "default";
      case "withdrawal":
      case "out":
        return "secondary";
      case "adjustment":
        return "outline";
      default:
        return "outline";
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "out":
        return <TrendingUp className="h-3 w-3 rotate-180 text-red-600" />;
      case "adjustment":
        return <Package className="h-3 w-3 text-yellow-600" />;
      default:
        return <Package className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Activity Snapshot
        </CardTitle>
        <CardDescription>
          Overview of financial transactions and inventory movements recorded by this user
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Counters */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-2xl">{financialStats.savingsEntriesRecorded}</span>
            </div>
            <p className="mt-1 text-muted-foreground text-sm">Savings Entries</p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-2xl">{financialStats.loanRepaymentsRecorded}</span>
            </div>
            <p className="mt-1 text-muted-foreground text-sm">Loan Repayments</p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-2xl">{financialStats.stockMovementsRecorded}</span>
            </div>
            <p className="mt-1 text-muted-foreground text-sm">Stock Movements</p>
          </div>
        </div>

        <Separator />

        {/* Recent Savings Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recent Savings Entries</h4>
            <Button size="sm" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Full Ledger
            </Button>
          </div>
          {recentSavingsEntries.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">
              No savings entries recorded
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSavingsEntries.slice(0, RECENT_ENTRIES_LIMIT).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell>{entry.accountName}</TableCell>
                      <TableCell>
                        <Badge variant={getEntryTypeVariant(entry.type)}>
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(entry.amount, entry.currency)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.reference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <Separator />

        {/* Recent Loan Repayments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recent Loan Repayments</h4>
            <Button size="sm" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Loan
            </Button>
          </div>
          {recentLoanRepayments.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">
              No loan repayments recorded
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLoanRepayments.slice(0, RECENT_ENTRIES_LIMIT).map((repayment) => (
                    <TableRow key={repayment.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(repayment.date)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {repayment.loanId}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(repayment.amount, repayment.currency)}
                      </TableCell>
                      <TableCell>{repayment.method}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {repayment.reference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <Separator />

        {/* Recent Stock Movements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recent Stock Movements</h4>
            <Button size="sm" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Lot
            </Button>
          </div>
          {recentStockMovements.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">
              No stock movements recorded
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStockMovements.slice(0, RECENT_ENTRIES_LIMIT).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(movement.date)}
                      </TableCell>
                      <TableCell>{movement.lotName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementTypeIcon(movement.type)}
                          <Badge variant={getEntryTypeVariant(movement.type)}>
                            {movement.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {movement.quantity} {movement.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}