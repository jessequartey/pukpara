"use client";

import { Eye, ShoppingCart, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function MarketplaceActivityCard() {
	// Mock data - replace with actual API call
	const marketplace = {
		listings: [
			{
				id: "list_1",
				commodity: "Maize",
				quantity: 100,
				unit: "bags",
				price: 250.0,
				status: "active",
				createdAt: "2024-01-18",
			},
			{
				id: "list_2",
				commodity: "Rice",
				quantity: 75,
				unit: "bags",
				price: 320.0,
				status: "sold",
				createdAt: "2024-01-17",
			},
			{
				id: "list_3",
				commodity: "Cocoa",
				quantity: 50,
				unit: "bags",
				price: 450.0,
				status: "pending",
				createdAt: "2024-01-16",
			},
		],
		purchaseOrders: [
			{
				id: "po_1",
				buyer: "Tema Mills Ltd",
				total: 25_000.0,
				status: "completed",
				date: "2024-01-18",
			},
			{
				id: "po_2",
				buyer: "Accra Trading Co",
				total: 18_500.0,
				status: "pending",
				date: "2024-01-17",
			},
			{
				id: "po_3",
				buyer: "Ghana Cocoa Board",
				total: 32_000.0,
				status: "processing",
				date: "2024-01-16",
			},
		],
	};

	const getListingStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge variant="default">Active</Badge>;
			case "sold":
				return <Badge variant="secondary">Sold</Badge>;
			case "pending":
				return <Badge variant="outline">Pending</Badge>;
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const getPOStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return <Badge variant="default">Completed</Badge>;
			case "processing":
				return <Badge variant="secondary">Processing</Badge>;
			case "pending":
				return <Badge variant="outline">Pending</Badge>;
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-GH", {
			style: "currency",
			currency: "GHS",
		}).format(amount);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Store className="size-4" />
					Marketplace Activity
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Listings Section */}
				<div>
					<div className="mb-2 flex items-center justify-between">
						<h4 className="font-medium text-sm">Recent Listings</h4>
						<Button size="sm" variant="outline">
							<Eye className="mr-2 size-4" />
							View All
						</Button>
					</div>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-xs">Commodity</TableHead>
									<TableHead className="text-xs">Price</TableHead>
									<TableHead className="text-xs">Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{marketplace.listings.slice(0, 3).map((listing) => (
									<TableRow key={listing.id}>
										<TableCell className="text-xs">
											<div>
												<div className="font-medium">{listing.commodity}</div>
												<div className="text-muted-foreground">
													{listing.quantity} {listing.unit}
												</div>
											</div>
										</TableCell>
										<TableCell className="text-xs">
											{formatCurrency(listing.price)}
										</TableCell>
										<TableCell className="text-xs">
											{getListingStatusBadge(listing.status)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* Purchase Orders Section */}
				<div>
					<div className="mb-2 flex items-center justify-between">
						<h4 className="font-medium text-sm">Purchase Orders</h4>
						<Button size="sm" variant="outline">
							<ShoppingCart className="mr-2 size-4" />
							View Orders
						</Button>
					</div>
					<div className="space-y-2">
						{marketplace.purchaseOrders.slice(0, 3).map((po) => (
							<div
								className="flex items-center justify-between rounded-lg border p-2"
								key={po.id}
							>
								<div>
									<div className="font-medium text-sm">{po.buyer}</div>
									<div className="text-muted-foreground text-xs">{po.date}</div>
								</div>
								<div className="text-right">
									<div className="font-medium text-sm">
										{formatCurrency(po.total)}
									</div>
									<div className="text-xs">{getPOStatusBadge(po.status)}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
