"use client";

import { Wallet, Eye, TrendingUp, TrendingDown, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SavingsSnapshotCardProps = {
  farmerId: string;
};

type SavingsAccount = {
  id: string;
  accountId: string;
  balance: number;
  currency: string;
  status: "active" | "inactive" | "frozen";
  type: "vsla" | "cooperative" | "mobile_money";
  organizationName: string;
  createdAt: string;
};

type SavingsEntry = {
  id: string;
  type: "contribution" | "withdrawal" | "interest" | "dividend";
  amount: number;
  currency: string;
  reference: string;
  date: string;
  description?: string;
};

export function SavingsSnapshotCard({ farmerId }: SavingsSnapshotCardProps) {
  // Mock savings accounts data - replace with actual API call
  const accounts: SavingsAccount[] = [
    {
      id: "1",
      accountId: "VSLA-001-2024",
      balance: 2450.50,
      currency: "GHS",
      status: "active",
      type: "vsla",
      organizationName: "Mampong VSLA Group",
      createdAt: "2023-01-15T10:30:00Z",
    },
    {
      id: "2",
      accountId: "COOP-789-2024",
      balance: 890.75,
      currency: "GHS",
      status: "active",
      type: "cooperative",
      organizationName: "Ashanti Farmers Cooperative",
      createdAt: "2023-03-20T14:45:00Z",
    },
  ];

  // Mock recent entries data
  const recentEntries: SavingsEntry[] = [
    {
      id: "1",
      type: "contribution",
      amount: 150.00,
      currency: "GHS",
      reference: "CONT-2024-001",
      date: "2024-03-15T10:30:00Z",
      description: "Monthly contribution",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: -50.00,
      currency: "GHS",
      reference: "WTH-2024-002",
      date: "2024-03-10T14:45:00Z",
      description: "Emergency withdrawal",
    },
    {
      id: "3",
      type: "dividend",
      amount: 75.25,
      currency: "GHS",
      reference: "DIV-2024-001",
      date: "2024-02-28T09:15:00Z",
      description: "Annual dividend payment",
    },
    {
      id: "4",
      type: "contribution",
      amount: 150.00,
      currency: "GHS",
      reference: "CONT-2024-002",
      date: "2024-02-15T10:30:00Z",
      description: "Monthly contribution",
    },
    {
      id: "5",
      type: "interest",
      amount: 25.50,
      currency: "GHS",
      reference: "INT-2024-001",
      date: "2024-01-31T23:59:00Z",
      description: "Interest payment",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "frozen":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "contribution":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "withdrawal":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case "interest":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "dividend":
        return <DollarSign className="h-4 w-4 text-purple-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "contribution":
        return "default";
      case "withdrawal":
        return "destructive";
      case "interest":
        return "secondary";
      case "dividend":
        return "default";
      default:
        return "outline";
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const mainCurrency = accounts.length > 0 ? accounts[0].currency : "GHS";

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Savings Snapshot (VSLA)
          </CardTitle>
          <CardDescription>
            Savings accounts and recent transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-medium">No Savings Accounts</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              This farmer hasn't registered any savings accounts yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Savings Snapshot (VSLA)
        </CardTitle>
        <CardDescription>
          Total Balance: {formatCurrency(totalBalance, mainCurrency)} across {accounts.length} accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accounts Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Accounts</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account ID</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium font-mono text-sm">{account.accountId}</p>
                      <p className="text-muted-foreground text-xs">{account.organizationName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{account.currency}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(account.status)}>
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Recent Entries Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Recent Entries (Last 5)</h4>
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  {getTypeIcon(entry.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeVariant(entry.type)} className="text-xs">
                        {entry.type}
                      </Badge>
                      <span className="font-mono text-sm">{entry.reference}</span>
                    </div>
                    {entry.description && (
                      <p className="text-muted-foreground text-xs">{entry.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${
                    entry.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {entry.amount > 0 ? "+" : ""}{formatCurrency(entry.amount, entry.currency)}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatDate(entry.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}