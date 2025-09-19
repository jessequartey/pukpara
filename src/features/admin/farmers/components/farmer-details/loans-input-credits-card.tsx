"use client";

import { CreditCard, Package, Eye, Calendar, Building, Hash, DollarSign } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoansInputCreditsCardProps = {
  farmerId: string;
};

type Loan = {
  id: string;
  loanId: string;
  principal: number;
  interest: number;
  termDays: number;
  currency: string;
  status: "pending" | "approved" | "disbursed" | "repaid" | "defaulted";
  requestedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  dueAt?: string;
  organizationName: string;
};

type InputCredit = {
  id: string;
  creditId: string;
  supplierOrganization: string;
  status: "pending" | "approved" | "issued" | "delivered" | "completed";
  itemsCount: number;
  totalValue: number;
  currency: string;
  issuedAt?: string;
  dueAt?: string;
  completedAt?: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
};

export function LoansInputCreditsCard({ farmerId }: LoansInputCreditsCardProps) {
  // Mock loans data - replace with actual API call
  const loans: Loan[] = [
    {
      id: "1",
      loanId: "LOAN-2024-001",
      principal: 5000.00,
      interest: 15.5,
      termDays: 180,
      currency: "GHS",
      status: "disbursed",
      requestedAt: "2024-01-15T10:30:00Z",
      approvedAt: "2024-01-20T14:45:00Z",
      disbursedAt: "2024-01-25T09:15:00Z",
      dueAt: "2024-07-23T23:59:00Z",
      organizationName: "Ashanti Agricultural Bank",
    },
    {
      id: "2",
      loanId: "LOAN-2024-002",
      principal: 2500.00,
      interest: 12.0,
      termDays: 120,
      currency: "GHS",
      status: "approved",
      requestedAt: "2024-02-10T11:20:00Z",
      approvedAt: "2024-02-15T16:30:00Z",
      dueAt: "2024-06-14T23:59:00Z",
      organizationName: "Mampong Microfinance",
    },
  ];

  // Mock input credits data
  const inputCredits: InputCredit[] = [
    {
      id: "1",
      creditId: "IC-2024-001",
      supplierOrganization: "Ghana Fertilizer Company",
      status: "delivered",
      itemsCount: 3,
      totalValue: 850.00,
      currency: "GHS",
      issuedAt: "2024-02-01T10:00:00Z",
      dueAt: "2024-08-01T23:59:00Z",
      completedAt: "2024-02-05T14:30:00Z",
      items: [
        { name: "NPK Fertilizer", quantity: 10, unit: "bags", unitPrice: 45.00 },
        { name: "Urea", quantity: 5, unit: "bags", unitPrice: 40.00 },
        { name: "Pesticide", quantity: 2, unit: "liters", unitPrice: 75.00 },
      ],
    },
    {
      id: "2",
      creditId: "IC-2024-002",
      supplierOrganization: "Seed Co. Ghana",
      status: "issued",
      itemsCount: 2,
      totalValue: 320.00,
      currency: "GHS",
      issuedAt: "2024-03-01T09:30:00Z",
      dueAt: "2024-12-01T23:59:00Z",
      items: [
        { name: "Hybrid Maize Seeds", quantity: 20, unit: "kg", unitPrice: 12.00 },
        { name: "Cowpea Seeds", quantity: 10, unit: "kg", unitPrice: 8.00 },
      ],
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
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "disbursed":
      case "issued":
      case "delivered":
        return "default";
      case "repaid":
      case "completed":
        return "default";
      case "defaulted":
        return "destructive";
      default:
        return "outline";
    }
  };

  const calculateInterestAmount = (principal: number, interest: number) => {
    return (principal * interest) / 100;
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Loans & Input Credits
        </CardTitle>
        <CardDescription>
          Financial loans and input credit facilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="loans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="loans" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Loans ({loans.length})
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Input Credits ({inputCredits.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="space-y-4">
            {loans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-medium">No Loans</h3>
                <p className="text-muted-foreground text-sm">
                  This farmer hasn't taken any loans yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium font-mono text-sm">{loan.loanId}</p>
                          <p className="text-muted-foreground text-xs">{loan.organizationName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(loan.principal, loan.currency)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Interest: {formatCurrency(calculateInterestAmount(loan.principal, loan.interest), loan.currency)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{loan.interest}%</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{loan.termDays} days</p>
                          {loan.dueAt && (
                            <p className="text-muted-foreground text-xs">
                              {getDaysRemaining(loan.dueAt)} days left
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(loan.status)}>
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Req:</span>
                            <span>{formatDate(loan.requestedAt)}</span>
                          </div>
                          {loan.approvedAt && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">App:</span>
                              <span>{formatDate(loan.approvedAt)}</span>
                            </div>
                          )}
                          {loan.disbursedAt && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Dis:</span>
                              <span>{formatDate(loan.disbursedAt)}</span>
                            </div>
                          )}
                        </div>
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
            )}
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            {inputCredits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-medium">No Input Credits</h3>
                <p className="text-muted-foreground text-sm">
                  This farmer hasn't used any input credit facilities yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inputCredits.map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium font-mono text-sm">{credit.creditId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{credit.supplierOrganization}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(credit.status)}>
                          {credit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{credit.itemsCount} items</p>
                          <div className="text-muted-foreground text-xs">
                            {credit.items.slice(0, 2).map((item, index) => (
                              <div key={index}>
                                {item.name} ({item.quantity} {item.unit})
                              </div>
                            ))}
                            {credit.items.length > 2 && (
                              <div>+{credit.items.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {formatCurrency(credit.totalValue, credit.currency)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          {credit.issuedAt && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Issued:</span>
                              <span>{formatDate(credit.issuedAt)}</span>
                            </div>
                          )}
                          {credit.dueAt && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Due:</span>
                              <span>{formatDate(credit.dueAt)}</span>
                            </div>
                          )}
                        </div>
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
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}