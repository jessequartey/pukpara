"use client";

import { AlertTriangle, Ban, CheckCircle, Clock, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { USER_KYC_STATUS, USER_STATUS } from "@/config/constants/auth";

type AccountStatusComplianceCardProps = {
  userId: string;
};

export function AccountStatusComplianceCard({
  userId,
}: AccountStatusComplianceCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock user data - replace with actual API call
  const user = {
    id: userId,
    status: "pending" as const,
    kycStatus: "verified" as const,
    approvedAt: new Date("2024-01-16T09:00:00Z"),
    emailVerified: true,
    phoneNumberVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
  };

  const handleApproveNow = async () => {
    setIsProcessing(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("User approved successfully");
    } catch {
      toast.error("Failed to approve user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestKyc = () => {
    toast.success("KYC request email sent to user");
  };

  const handleSuspendWithReason = () => {
    toast.success("Suspend with reason dialog would open");
  };

  const handleBanWithReason = () => {
    toast.success("Ban with reason dialog would open");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case USER_STATUS.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case USER_STATUS.PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case USER_STATUS.SUSPENDED:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case USER_STATUS.REJECTED:
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getKycStatusIcon = (kycStatus: string) => {
    switch (kycStatus) {
      case USER_KYC_STATUS.VERIFIED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case USER_KYC_STATUS.PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case USER_KYC_STATUS.REJECTED:
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case USER_STATUS.APPROVED:
        return "default";
      case USER_STATUS.PENDING:
        return "secondary";
      case USER_STATUS.SUSPENDED:
        return "destructive";
      case USER_STATUS.REJECTED:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getKycBadgeVariant = (kycStatus: string) => {
    switch (kycStatus) {
      case USER_KYC_STATUS.VERIFIED:
        return "default";
      case USER_KYC_STATUS.PENDING:
        return "secondary";
      case USER_KYC_STATUS.REJECTED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Account Status & Compliance
        </CardTitle>
        <CardDescription>
          Account lifecycle status, KYC verification, and compliance checks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Row */}
        <div className="space-y-4">
          <h4 className="font-medium">Current Status</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(user.status)}
                <span className="font-medium text-sm">Account Status</span>
              </div>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getKycStatusIcon(user.kycStatus)}
                <span className="font-medium text-sm">KYC Status</span>
              </div>
              <Badge variant={getKycBadgeVariant(user.kycStatus)}>
                {user.kycStatus}
              </Badge>
            </div>
          </div>
          {user.approvedAt && (
            <div className="pt-2">
              <span className="text-muted-foreground text-sm">
                Approved: {formatDate(user.approvedAt)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Verification Status */}
        <div className="space-y-4">
          <h4 className="font-medium">Verification Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Verified</span>
              <Badge variant={user.emailVerified ? "default" : "secondary"}>
                {user.emailVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Phone Verified</span>
              <Badge
                variant={user.phoneNumberVerified ? "default" : "secondary"}
              >
                {user.phoneNumberVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* KYC Checklist - Optional */}
        <div className="space-y-4">
          <h4 className="font-medium">KYC Checklist</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Identity Document</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Address Verification
              </span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone Verification</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Controls */}
        <div className="space-y-3">
          <h4 className="font-medium">Controls</h4>
          <div className="grid grid-cols-2 gap-2">
            {user.status === USER_STATUS.PENDING && (
              <Button
                disabled={isProcessing}
                onClick={handleApproveNow}
                size="sm"
              >
                {isProcessing ? "Processing..." : "Approve Now"}
              </Button>
            )}
            {user.kycStatus !== USER_KYC_STATUS.VERIFIED && (
              <Button onClick={handleRequestKyc} size="sm" variant="outline">
                Request KYC Docs
              </Button>
            )}
            <Button
              onClick={handleSuspendWithReason}
              size="sm"
              variant="outline"
            >
              Suspend with Reason
            </Button>
            <Button
              onClick={handleBanWithReason}
              size="sm"
              variant="destructive"
            >
              Ban with Reason
            </Button>
          </div>
        </div>

        {/* Ban Status - if banned */}
        {user.banned && (
          <>
            <Separator />
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <Ban className="mt-0.5 h-4 w-4 text-red-600" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">User Banned</p>
                  {user.banReason && (
                    <p className="text-red-700">Reason: {user.banReason}</p>
                  )}
                  {user.banExpires && (
                    <p className="text-red-700">
                      Expires: {formatDate(user.banExpires)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
