"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { BulkReviewStep } from "@/features/admin/farmers/components/farmer-create/bulk-review-step";
import { BulkUploadStep } from "@/features/admin/farmers/components/farmer-create/bulk-upload-step";
import { FarmsStep } from "@/features/admin/farmers/components/farmer-create/farms-step";
import { OrganizationSelectionStep } from "@/features/admin/farmers/components/farmer-create/organization-selection-step";
import { SingleFarmerStep } from "@/features/admin/farmers/components/farmer-create/single-farmer-step";
import { UploadModeStep } from "@/features/admin/farmers/components/farmer-create/upload-mode-step";
import { FarmerPageTitle } from "@/features/admin/farmers/components/farmer-page-title";
import { useFarmerCreateStore } from "@/features/admin/farmers/store/farmer-create-store";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const stepTitles = ["Upload method", "Farmer details", "Farm details"] as const;
const bulkStepTitles = [
  "Upload method",
  "Select organization",
  "Upload file",
  "Review farmers",
] as const;

const STEP_MODE = 1;
const STEP_ORGANIZATION = 2;
const STEP_DETAILS = 3;
const STEP_FARMS = 4;

// Utility function to extract error messages
const extractErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  if (error instanceof Error && error.message?.trim()) {
    return error.message.trim();
  }

  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Try different message paths
    if (typeof errorObj.message === "string" && errorObj.message.trim()) {
      return errorObj.message.trim();
    }

    if (
      errorObj.error &&
      typeof errorObj.error === "object" &&
      errorObj.error !== null
    ) {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (
        typeof nestedError.message === "string" &&
        nestedError.message.trim()
      ) {
        return nestedError.message.trim();
      }
    }

    if (
      errorObj.data &&
      typeof errorObj.data === "object" &&
      errorObj.data !== null
    ) {
      const dataError = errorObj.data as Record<string, unknown>;
      if (typeof dataError.message === "string" && dataError.message.trim()) {
        return dataError.message.trim();
      }
    }
  }

  return null;
};

// Component props types
type StepIndicatorProps = {
  current: number;
  labels: string[];
};

// CSS classes for step indicator
const indicatorBaseClass =
  "flex size-8 items-center justify-center rounded-full border font-semibold text-sm transition";
const indicatorActiveClass =
  "border-primary bg-primary text-primary-foreground";
const indicatorCompletedClass = "border-primary/40 bg-primary/10 text-primary";
const indicatorIdleClass = "border-border bg-muted text-muted-foreground";

// Step indicator component
const StepIndicator = ({ current, labels }: StepIndicatorProps) => (
  <ol aria-label="Setup progress" className="flex flex-wrap items-center gap-4">
    {labels.map((label, index) => {
      const stepNumber = index + 1;
      const isActive = stepNumber === current;
      const isCompleted = stepNumber < current;

      let indicatorVariant = indicatorIdleClass;
      if (isActive) {
        indicatorVariant = indicatorActiveClass;
      } else if (isCompleted) {
        indicatorVariant = indicatorCompletedClass;
      }

      return (
        <li className="flex items-center gap-3" key={label}>
          <span
            aria-current={isActive ? "step" : undefined}
            className={cn(indicatorBaseClass, indicatorVariant)}
          >
            {isCompleted ? (
              <Check aria-hidden className="size-4" />
            ) : (
              stepNumber
            )}
          </span>
          <span
            className={cn(
              "font-medium text-sm",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

export function FarmerCreatePage() {
  const router = useRouter();
  const step = useFarmerCreateStore((state) => state.step);
  const mode = useFarmerCreateStore((state) => state.mode);
  const farmer = useFarmerCreateStore((state) => state.farmer);
  const farms = useFarmerCreateStore((state) => state.farms);
  const bulkUpload = useFarmerCreateStore((state) => state.bulkUpload);
  const selectedOrganization = useFarmerCreateStore(
    (state) => state.selectedOrganization
  );
  const setBulkUploadData = useFarmerCreateStore(
    (state) => state.setBulkUploadData
  );
  const nextStep = useFarmerCreateStore((state) => state.nextStep);
  const prevStep = useFarmerCreateStore((state) => state.prevStep);
  const resetStore = useFarmerCreateStore((state) => state.reset);

  const createFarmerMutation = api.admin.farmers.create.useMutation();

  // Simplified label calculation
  const currentLabels = useMemo(() => {
    const labelMap = {
      single: [...stepTitles] as string[],
      "bulk-upload": [...bulkStepTitles] as string[],
    } as const;

    return (
      labelMap[mode as keyof typeof labelMap] ?? ([...stepTitles] as string[])
    );
  }, [mode]);

  // Single farmer creation handler
  const createSingleFarmer = async () => {
    try {
      const farmerPayload = {
        firstName: farmer.firstName,
        lastName: farmer.lastName,
        gender: farmer.gender,
        dateOfBirth: farmer.dateOfBirth
          ? new Date(farmer.dateOfBirth)
          : undefined,
        phone: farmer.phone || undefined,
        isPhoneSmart: farmer.isPhoneSmart,
        idNumber: farmer.idNumber || undefined,
        idType: farmer.idType as
          | "ghana_card"
          | "voters_id"
          | "passport"
          | "drivers_license"
          | undefined,
        address: farmer.address || undefined,
        districtId: farmer.districtId || undefined,
        community: farmer.community || undefined,
        householdSize: farmer.householdSize || undefined,
        isLeader: farmer.isLeader,
        organizationId: farmer.organizationId,
        farms: farms.map((farm) => ({
          name: farm.name,
          acreage: farm.acreage || undefined,
          cropType: farm.cropType || undefined,
          soilType: farm.soilType || undefined,
          locationLat: farm.locationLat,
          locationLng: farm.locationLng,
        })),
      };

      await createFarmerMutation.mutateAsync(farmerPayload);

      toast.success(
        `Farmer "${farmer.firstName} ${farmer.lastName}" created successfully${
          farms.length > 0 ? ` with ${farms.length} farm(s)` : ""
        }`
      );
      resetStore();
      router.push("/admin/farmers");
    } catch (error) {
      const message = extractErrorMessage(error) ?? "Failed to create farmer";
      toast.error(message);
    }
  };

  // Get organizations and districts for mapping
  const { data: organizations = [] } =
    api.admin.farmers.getOrganizations.useQuery();
  const { data: districts = [] } = api.admin.farmers.getDistricts.useQuery();

  // Helper function to find organization ID by name
  const findOrganizationId = (organizationName: string): string | undefined => {
    console.log("🔍 Looking for organization:", organizationName);
    console.log("📋 Available organizations:", organizations);

    // First try exact match
    let org = organizations.find(
      (o) => o.name.toLowerCase() === organizationName.toLowerCase()
    );

    // If no exact match and we have organizations, use the first one as fallback
    if (!org && organizations.length > 0) {
      org = organizations[0];
      console.log("⚠️ Organization not found, using fallback:", org);
    }

    console.log("✅ Found/Selected organization:", org);
    return org?.id;
  };

  // Helper function to find district ID by name
  const findDistrictId = (districtName: string): string | undefined => {
    console.log("🔍 Looking for district:", districtName);
    console.log("📍 Available districts:", districts);

    // First try exact match
    let district = districts.find(
      (d) => d.name.toLowerCase() === districtName.toLowerCase()
    );

    // If no exact match and we have districts, use the first one as fallback
    if (!district && districts.length > 0) {
      district = districts[0];
      console.log("⚠️ District not found, using fallback:", district);
    }

    console.log("✅ Found/Selected district:", district);
    return district?.id;
  };

  // Helper functions for bulk upload - simplified for immediate testing
  const processValidFarmers = async (
    validFarmersForUpload: typeof bulkUpload.parsedFarmers
  ) => {
    let successful = 0;
    let failed = 0;
    const errors: Array<{
      row: number;
      message: string;
      data?: Record<string, unknown>;
    }> = [];

    if (!selectedOrganization) {
      throw new Error("No organization selected");
    }

    for (const farmerItem of validFarmersForUpload) {
      try {
        const farmerPayload = {
          firstName: farmerItem.data.firstName,
          lastName: farmerItem.data.lastName,
          gender: farmerItem.data.gender,
          dateOfBirth: farmerItem.data.dateOfBirth
            ? new Date(farmerItem.data.dateOfBirth)
            : undefined,
          phone: farmerItem.data.phone || undefined,
          isPhoneSmart: farmerItem.data.isPhoneSmart,
          idNumber: farmerItem.data.idNumber || undefined,
          idType: farmerItem.data.idType,
          address: farmerItem.data.address || undefined,
          districtId: undefined, // Skip district for now
          community: farmerItem.data.community || undefined,
          householdSize: farmerItem.data.householdSize || undefined,
          isLeader: farmerItem.data.isLeader,
          organizationId: selectedOrganization.id,
          farms: farmerItem.farms
            .filter((f) => f.isValid)
            .map((farm) => ({
              name: farm.name,
              acreage: farm.acreage || undefined,
              cropType: farm.cropType || undefined,
              soilType: farm.soilType || undefined,
              locationLat: farm.locationLat,
              locationLng: farm.locationLng,
            })),
        };

        await createFarmerMutation.mutateAsync(farmerPayload);
        successful++;
      } catch (error) {
        failed++;
        errors.push({
          row: farmerItem.rowNumber,
          message: extractErrorMessage(error) || "Failed to create farmer",
          data: {
            firstName: farmerItem.data.firstName,
            lastName: farmerItem.data.lastName,
            districtName: farmerItem.data.districtName,
          },
        });
      }
    }

    return { successful, failed, errors };
  };

  // Bulk upload completion handler
  const createBulkFarmers = async () => {
    const validFarmersForUpload = bulkUpload.parsedFarmers.filter(
      (farmerData) => farmerData.isValid
    );

    console.log("📋 Total parsed farmers:", bulkUpload.parsedFarmers.length);
    console.log("✅ Valid farmers for upload:", validFarmersForUpload.length);
    console.log("👩‍🌾 First farmer data:", validFarmersForUpload[0]);

    if (validFarmersForUpload.length === 0) {
      toast.error("No valid farmers to create");
      return;
    }

    try {
      const { successful, failed, errors } = await processValidFarmers(
        validFarmersForUpload
      );

      console.log("📈 Results:", { successful, failed, errors });

      setBulkUploadData({
        uploadResults: { successful, failed, errors },
      });

      const message =
        successful > 0
          ? `Bulk upload completed: ${successful} farmers created${failed > 0 ? `, ${failed} failed` : ""}`
          : "No farmers were created successfully";

      if (successful > 0) {
        toast.success(message);
      } else {
        toast.error(message);
      }

      resetStore();
      router.push("/admin/farmers");
    } catch (error) {
      console.error("❌ Bulk upload error:", error);
      toast.error("Failed to process bulk upload");
    }
  };

  // Step rendering helpers
  const renderDetailsStep = () => {
    if (mode === "single") {
      return <SingleFarmerStep onBack={prevStep} onNext={nextStep} />;
    }
    if (mode === "bulk-upload") {
      return <BulkUploadStep onBack={prevStep} onNext={nextStep} />;
    }
    return <Card className="p-6">Unexpected step.</Card>;
  };

  const renderFarmsStep = () => {
    if (mode === "single") {
      return <FarmsStep onBack={prevStep} onNext={createSingleFarmer} />;
    }
    if (mode === "bulk-upload") {
      return <BulkReviewStep onBack={prevStep} onNext={createBulkFarmers} />;
    }
    return <Card className="p-6">Unexpected step.</Card>;
  };

  // Main step rendering
  const renderStepContent = () => {
    if (step === STEP_MODE) {
      return <UploadModeStep onNext={nextStep} />;
    }
    if (step === STEP_ORGANIZATION && mode === "bulk-upload") {
      return <OrganizationSelectionStep onBack={prevStep} onNext={nextStep} />;
    }
    if (step === STEP_DETAILS) {
      return renderDetailsStep();
    }
    if (step === STEP_FARMS) {
      return renderFarmsStep();
    }
    return <Card className="p-6">Unexpected step.</Card>;
  };

  // Description generator
  const getDescription = () => {
    const descriptions = {
      single:
        "Create a new farmer profile with complete details including personal information, contact details, and identification.",
      "bulk-upload":
        "Upload multiple farmer profiles at once using an Excel or CSV file. Perfect for importing existing farmer databases.",
    } as const;

    return (
      descriptions[mode as keyof typeof descriptions] ??
      "Add new farmers to the system either individually with complete details or in bulk using file upload."
    );
  };

  return (
    <FarmerPageTitle
      action={{
        href: "/admin/farmers",
        icon: ArrowLeft,
        label: "Back to farmers",
      }}
      description={getDescription()}
      title="Add farmers"
    >
      <div className="space-y-6">
        <StepIndicator current={step} labels={currentLabels} />
        {renderStepContent()}
        <p className="text-muted-foreground text-xs">
          Need to pause? You can safely navigate away; no changes are committed
          until you complete the final step.
        </p>
      </div>
    </FarmerPageTitle>
  );
}

export default FarmerCreatePage;
