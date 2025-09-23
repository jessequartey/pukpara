"use client";

import { Eye, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KpisFinanceCard() {
	// Mock data - replace with actual API call
	const kpis = {
		totalFarmers: 127,
		groupsTeams: 8,
		savingsBalance: 45_680.5,
		outstandingLoans: 23_450.0,
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
				{sign}
				{trend.value}%
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
							<div className="font-bold text-2xl text-blue-600">
								{kpis.totalFarmers}
							</div>
							{formatTrend(kpis.trends.farmers)}
						</div>
						<div className="text-muted-foreground text-xs">Total Farmers</div>
					</div>

					<div className="rounded-lg border p-3">
						<div className="font-bold text-2xl text-green-600">
							{kpis.groupsTeams}
						</div>
						<div className="text-muted-foreground text-xs">Groups/Teams</div>
					</div>

					<div className="rounded-lg border p-3">
						<div className="flex items-center justify-between">
							<div className="font-bold text-emerald-600 text-lg">
								{formatCurrency(kpis.savingsBalance)}
							</div>
							{formatTrend(kpis.trends.savings)}
						</div>
						<div className="text-muted-foreground text-xs">Savings Balance</div>
					</div>

					<div className="rounded-lg border p-3">
						<div className="flex items-center justify-between">
							<div className="font-bold text-lg text-orange-600">
								{formatCurrency(kpis.outstandingLoans)}
							</div>
							{formatTrend(kpis.trends.loans)}
						</div>
						<div className="text-muted-foreground text-xs">
							Outstanding Loans
						</div>
					</div>
				</div>

				{/* Mini Chart Placeholder */}
				<div className="rounded-lg border p-3">
					<h4 className="mb-2 font-medium text-sm">Savings Trend (12 weeks)</h4>
					<div className="flex h-12 items-end justify-between gap-1">
						{Array.from({ length: 12 }, (_, i) => (
							<div
								className="w-2 rounded-t bg-blue-200"
								key={i}
								style={{ height: `${Math.random() * 100}%` }}
							/>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="space-y-2">
					<Button className="w-full" size="sm" variant="outline">
						<Eye className="mr-2 size-4" />
						View Savings Ledger
					</Button>
					<Button className="w-full" size="sm" variant="outline">
						<Eye className="mr-2 size-4" />
						View Loans
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
