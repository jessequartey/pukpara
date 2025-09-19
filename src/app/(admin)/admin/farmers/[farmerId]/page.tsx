import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FarmerDetailsContent } from "@/features/admin/farmers/components/farmer-details-content";
import { FarmerPageTitle } from "@/features/admin/farmers/components/farmer-page-title";

export default async function AdminFarmerDetailPage({
  params,
}: {
  params: Promise<{ farmerId: string }>;
}) {
  const { farmerId } = await params;

  // Mock farmer data - replace with actual API call
  const farmer = {
    id: farmerId,
    firstName: "Kofi",
    lastName: "Asante",
    pukparaId: "PUK-12345",
    phone: "+233541234567",
    community: "Asante Mampong",
    district: "Asante Mampong Municipal",
    kycStatus: "verified" as const,
    isLeader: true,
    isPhoneSmart: false,
  };

  const customTitle = (
    <div className="space-y-2">
      <h2 className="font-bold text-2xl text-foreground tracking-tight">
        {farmer.firstName} {farmer.lastName}
      </h2>
      <span className="text-muted-foreground text-sm">
        {farmer.pukparaId && (
          <Badge className="mr-2" variant="outline">
            {farmer.pukparaId}
          </Badge>
        )}
        {farmer.phone} • {farmer.community}, {farmer.district}
      </span>
    </div>
  );

  const getKycStatusVariant = (status: string) => {
    if (status === "verified") {
      return "default";
    }
    if (status === "pending") {
      return "secondary";
    }
    return "destructive";
  };

  const badgeDescription = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={getKycStatusVariant(farmer.kycStatus)}>
        {farmer.kycStatus}
      </Badge>
      {farmer.isLeader && <Badge variant="default">Leader</Badge>}
      <Badge variant={farmer.isPhoneSmart ? "default" : "outline"}>
        {farmer.isPhoneSmart ? "Smart Phone" : "Basic Phone"}
      </Badge>
    </div>
  );

  return (
    <FarmerPageTitle
      action={{
        href: "/admin/farmers",
        icon: ArrowLeft,
        label: "Back to Farmers",
      }}
      breadcrumbs={[{ label: `${farmer.firstName} ${farmer.lastName}` }]}
      description={badgeDescription}
      title={`${farmer.firstName} ${farmer.lastName}`}
      titleContent={customTitle}
    >
      <FarmerDetailsContent farmerId={farmerId} />
    </FarmerPageTitle>
  );
}
