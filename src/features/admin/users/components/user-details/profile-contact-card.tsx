"use client";

import { Calendar, Edit, MapPin, Shield, Upload, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type ProfileContactCardProps = {
	userId: string;
};

export function ProfileContactCard({ userId }: ProfileContactCardProps) {
	const [_isEditing, setIsEditing] = useState(false);

	// Mock user data - replace with actual API call
	const user = {
		id: userId,
		name: "John Doe",
		email: "john.doe@example.com",
		phoneNumber: "+233201234567",
		address: "123 Main Street, Accra",
		districtName: "Accra Metropolitan",
		regionName: "Greater Accra",
		image: null,
		createdAt: new Date("2024-01-15T10:30:00Z"),
		updatedAt: new Date("2024-01-20T14:30:00Z"),
		lastLogin: new Date("2024-01-20T14:30:00Z"),
		consentTermsAt: new Date("2024-01-15T10:30:00Z"),
		consentPrivacyAt: new Date("2024-01-15T10:30:00Z"),
		kycStatus: "verified" as const,
	};

	const handleEditProfile = () => {
		setIsEditing(true);
		toast.success("Edit profile drawer would open here");
	};

	const handleMarkKycVerified = () => {
		toast.success("KYC status updated to verified");
	};

	const handleUploadAvatar = () => {
		toast.success("Avatar upload would be triggered here");
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Profile & Contact
				</CardTitle>
				<CardDescription>
					Personal information, contact details, and account metadata
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Profile Picture & Basic Info */}
				<div className="flex items-start gap-4">
					<div className="relative">
						<Avatar className="h-16 w-16">
							{user.image ? (
								<AvatarImage alt={user.name} src={user.image} />
							) : (
								<AvatarFallback className="text-lg">
									{user.name
										.split(" ")
										.map((part) => part.charAt(0))
										.join("")
										.slice(0, 2)
										.toUpperCase()}
								</AvatarFallback>
							)}
						</Avatar>
						<Button
							className="-bottom-2 -right-2 absolute h-8 w-8 rounded-full p-0"
							onClick={handleUploadAvatar}
							size="sm"
							variant="outline"
						>
							<Upload className="h-3 w-3" />
						</Button>
					</div>
					<div className="space-y-1">
						<h3 className="font-semibold text-lg">{user.name}</h3>
						<p className="text-muted-foreground text-sm">{user.email}</p>
						<p className="text-muted-foreground text-sm">{user.phoneNumber}</p>
					</div>
				</div>

				{/* Address & Location */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-sm">Location</span>
					</div>
					<div className="space-y-1 pl-6">
						<p className="text-sm">{user.address}</p>
						<p className="text-muted-foreground text-sm">
							{user.districtName}, {user.regionName}
						</p>
					</div>
				</div>

				{/* Metadata */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-sm">Account Timeline</span>
					</div>
					<div className="space-y-2 pl-6 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Created:</span>
							<span>{formatDate(user.createdAt)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Updated:</span>
							<span>{formatDate(user.updatedAt)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Last Login:</span>
							<span>{formatDate(user.lastLogin)}</span>
						</div>
					</div>
				</div>

				{/* Consent */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<Shield className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-sm">Consent</span>
					</div>
					<div className="space-y-2 pl-6 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Terms:</span>
							<span>{formatDate(user.consentTermsAt)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Privacy:</span>
							<span>{formatDate(user.consentPrivacyAt)}</span>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					<Button onClick={handleEditProfile} size="sm" variant="outline">
						<Edit className="mr-2 h-4 w-4" />
						Edit Profile
					</Button>
					{user.kycStatus !== "verified" && (
						<Button onClick={handleMarkKycVerified} size="sm">
							Mark KYC Verified
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
