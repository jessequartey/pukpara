"use client";

import { Edit, Mail, MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContactAddressCard() {
	// Mock data - replace with actual API call
	const contact = {
		contactEmail: "info@greenvalley.coop",
		contactPhone: "+233 20 123 4567",
		address: "123 Farmers Road, Tema",
		district: "Tema Metropolitan",
		region: "Greater Accra",
		kycStatus: "verified" as const,
	};

	const getKycBadge = (status: string) => {
		switch (status) {
			case "verified":
				return <Badge variant="default">Verified</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "rejected":
				return <Badge variant="destructive">Rejected</Badge>;
			default:
				return <Badge variant="outline">Not Started</Badge>;
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Contact & Address</CardTitle>
					<Button size="sm" variant="outline">
						<Edit className="mr-2 size-4" />
						Edit Contact
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Contact Information */}
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<Mail className="size-4 text-muted-foreground" />
						<div>
							<dt className="font-medium text-sm">Email</dt>
							<dd className="text-muted-foreground text-sm">
								{contact.contactEmail}
							</dd>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Phone className="size-4 text-muted-foreground" />
						<div>
							<dt className="font-medium text-sm">Phone</dt>
							<dd className="text-muted-foreground text-sm">
								{contact.contactPhone}
							</dd>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<MapPin className="mt-0.5 size-4 text-muted-foreground" />
						<div>
							<dt className="font-medium text-sm">Address</dt>
							<dd className="text-muted-foreground text-sm">
								{contact.address}
								<br />
								{contact.district}, {contact.region}
							</dd>
						</div>
					</div>
				</div>

				{/* KYC Status */}
				<div className="border-t pt-4">
					<div className="flex items-center justify-between">
						<div>
							<dt className="font-medium text-sm">KYC Status</dt>
							<dd className="text-muted-foreground text-sm">
								Know Your Customer verification
							</dd>
						</div>
						{getKycBadge(contact.kycStatus)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
