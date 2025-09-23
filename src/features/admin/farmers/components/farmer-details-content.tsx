"use client";

import { DeleteFarmerCard } from "./farmer-details/delete-farmer-card";
import { FarmerProfileCard } from "./farmer-details/farmer-profile-card";
import { FarmsCard } from "./farmer-details/farms-card";
import { GroupMembershipsCard } from "./farmer-details/group-memberships-card";

type FarmerDetailsContentProps = {
	farmerId: string;
	orgId?: string;
};

export function FarmerDetailsContent({
	farmerId,
	orgId,
}: FarmerDetailsContentProps) {
	// Mock farmer data - replace with actual API call
	const farmer = {
		id: farmerId,
		firstName: "Kofi",
		lastName: "Asante",
		pukparaId: "PUK-12345",
		phone: "+233541234567",
		community: "Asante Mampong",
		district: "Asante Mampong Municipal",
		region: "Ashanti",
		kycStatus: "verified" as const,
		isLeader: true,
		isPhoneSmart: false,
		gender: "male" as const,
		dateOfBirth: "1985-03-15",
		photoUrl: "/images/farmers/farmer-placeholder.jpg",
		address: "House No. 123, Mampong",
		idType: "Ghana Card",
		idNumber: "GHA-123456789-0",
		createdAt: "2023-01-15T10:30:00Z",
		updatedAt: "2024-03-20T14:45:00Z",
		legacyFarmerId: "LEGACY-001",
	};

	const handleDelete = () => {
		// TODO: Implement actual delete logic
		// This would typically call an API to delete the farmer
	};

	return (
		<div className="space-y-6">
			<FarmerProfileCard farmer={farmer} />
			<GroupMembershipsCard farmerId={farmerId} />
			<FarmsCard farmerId={farmerId} orgId={orgId} />
			<DeleteFarmerCard
				farmerName={`${farmer.firstName} ${farmer.lastName}`}
				onDelete={handleDelete}
			/>
		</div>
	);
}
