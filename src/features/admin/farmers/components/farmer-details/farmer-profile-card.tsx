"use client";

import { Calendar, CreditCard, Edit, MapPin, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type FarmerProfileCardProps = {
  farmer: {
    id: string;
    firstName: string;
    lastName: string;
    pukparaId?: string;
    phone: string;
    community: string;
    district: string;
    region: string;
    kycStatus: "pending" | "verified" | "rejected";
    isLeader: boolean;
    isPhoneSmart: boolean;
    gender: "male" | "female" | "other";
    dateOfBirth: string;
    photoUrl?: string;
    address: string;
    idType: string;
    idNumber: string;
    createdAt: string;
    updatedAt: string;
    legacyFarmerId?: string;
  };
};

export function FarmerProfileCard({ farmer }: FarmerProfileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getKycStatusVariant = (status: string) => {
    if (status === "verified") {
      return "default";
    }
    if (status === "pending") {
      return "secondary";
    }
    return "destructive";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Farmer Profile
          </CardTitle>
          <CardDescription>
            Personal information and identity verification
          </CardDescription>
        </div>
        <Button size="sm" variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Farmer
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Identity Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Identity</h4>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                alt={`${farmer.firstName} ${farmer.lastName}`}
                src={farmer.photoUrl}
              />
              <AvatarFallback className="text-lg">
                {getInitials(farmer.firstName, farmer.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">
                  Full Name
                </Label>
                <p className="font-medium">
                  {farmer.firstName} {farmer.lastName}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Gender</Label>
                <p className="capitalize">{farmer.gender}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Date of Birth
                </Label>
                <p>{formatDate(farmer.dateOfBirth)}</p>
              </div>
              {farmer.pukparaId && (
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Pukpara ID
                  </Label>
                  <Badge variant="outline">{farmer.pukparaId}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-medium text-sm">
            <MapPin className="h-4 w-4" />
            Contact & Address
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground text-xs">Phone</Label>
              <p>{farmer.phone}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Address</Label>
              <p>{farmer.address}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Community</Label>
              <p>{farmer.community}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">District</Label>
              <p>{farmer.district}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Region</Label>
              <p>{farmer.region}</p>
            </div>
          </div>
        </div>

        {/* ID Information */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-medium text-sm">
            <CreditCard className="h-4 w-4" />
            ID Information
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground text-xs">ID Type</Label>
              <p>{farmer.idType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">ID Number</Label>
              <p className="font-mono">{farmer.idNumber}</p>
            </div>
          </div>
        </div>

        {/* Meta Information */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-medium text-sm">
            <Calendar className="h-4 w-4" />
            Meta Information
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground text-xs">
                Created At
              </Label>
              <p>{formatDate(farmer.createdAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">
                Updated At
              </Label>
              <p>{formatDate(farmer.updatedAt)}</p>
            </div>
            {farmer.legacyFarmerId && (
              <div>
                <Label className="text-muted-foreground text-xs">
                  Legacy Farmer ID
                </Label>
                <p className="font-mono">{farmer.legacyFarmerId}</p>
              </div>
            )}
          </div>
        </div>

        {/* KYC Section */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium text-sm">KYC Verification</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">
                KYC Status
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant={getKycStatusVariant(farmer.kycStatus)}>
                  {farmer.kycStatus}
                </Badge>
                <Switch
                  checked={farmer.kycStatus === "verified"}
                  disabled={farmer.kycStatus === "pending"}
                />
              </div>
            </div>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
