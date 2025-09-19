"use client";

import { Eye, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KpisFinanceCard() {
  // Mock data - replace with actual API call
  const kpis = {
    totalFarmers: 127,
    groupsTeams: 8,
    savingsBalance: 45680.50,
    outstandingLoans: 23450.00,
    currency: "GHS",
    trends: {
      farmers: { value: 12, isPositive: true },
      savings: { value: 8.5, isPositive: true },
      loans: { value: -2.3, isPositive: false },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: kpis.currency,
    }).format(amount);
  };

  const formatTrend = (trend: { value: number; isPositive: boolean }) => {
    const sign = trend.isPositive ? "+" : "";
    const color = trend.isPositive ? "text-green-600" : "text-red-600";
    return (
      <span className={`text-xs ${color}`}>
        {sign}{trend.value}%
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>KPIs & Finance</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{kpis.totalFarmers}</div>
              {formatTrend(kpis.trends.farmers)}
            </div>
            <div className="text-xs text-muted-foreground">Total Farmers</div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold text-green-600">{kpis.groupsTeams}</div>
            <div className="text-xs text-muted-foreground">Groups/Teams</div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-emerald-600">
                {formatCurrency(kpis.savingsBalance)}
              </div>
              {formatTrend(kpis.trends.savings)}
            </div>
            <div className="text-xs text-muted-foreground">Savings Balance</div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(kpis.outstandingLoans)}
              </div>
              {formatTrend(kpis.trends.loans)}
            </div>
            <div className="text-xs text-muted-foreground">Outstanding Loans</div>
          </div>
        </div>

        {/* Mini Chart Placeholder */}
        <div className="rounded-lg border p-3">
          <h4 className="mb-2 text-sm font-medium">Savings Trend (12 weeks)</h4>
          <div className="flex h-12 items-end justify-between gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="w-2 rounded-t bg-blue-200"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="mr-2 size-4" />
            View Savings Ledger
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="mr-2 size-4" />
            View Loans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}