"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { BulkUploadStep } from "@/features/admin/farmers/components/farmer-create/bulk-upload-step";
import { SingleFarmerStep } from "@/features/admin/farmers/components/farmer-create/single-farmer-step";
import { UploadModeStep } from "@/features/admin/farmers/components/farmer-create/upload-mode-step";
import { FarmerPageTitle } from "@/features/admin/farmers/components/farmer-page-title";
import { useFarmerCreateStore } from "@/features/admin/farmers/store/farmer-create-store";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const stepTitles = ["Upload method", "Farmer details"] as const;

const STEP_MODE = 1;
const STEP_DETAILS = 2;

const extractErrorMessage = (error: unknown) => {
  if (!error) {
    return null;
  }

  if (error instanceof Error && typeof error.message === "string") {
    const trimmed = error.message.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  if (typeof error === "object" && error !== null) {
    const candidateSources: unknown[] = [];
    if ("message" in error) {
      candidateSources.push((error as { message?: unknown }).message);
    }
    if ("error" in error) {
      const nested = (error as { error?: { message?: unknown } }).error;
      if (nested && "message" in nested) {
        candidateSources.push(nested.message);
      }
    }
    if ("data" in error) {
      const nested = (error as { data?: { message?: unknown } }).data;
      if (nested && "message" in nested) {
        candidateSources.push(nested.message);
      }
    }

    for (const candidate of candidateSources) {
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (trimmed.length > 0) {
          return trimmed;
        }
      }
    }
  }

  return null;
};

type StepIndicatorProps = {
  current: number;
  labels: string[];
};

const indicatorBaseClass =
  "flex size-8 items-center justify-center rounded-full border font-semibold text-sm transition";
const indicatorActiveClass =
  "border-primary bg-primary text-primary-foreground";
const indicatorCompletedClass = "border-primary/40 bg-primary/10 text-primary";
const indicatorIdleClass = "border-border bg-muted text-muted-foreground";

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
  const nextStep = useFarmerCreateStore((state) => state.nextStep);
  const prevStep = useFarmerCreateStore((state) => state.prevStep);
  const resetStore = useFarmerCreateStore((state) => state.reset);

  const createFarmerMutation = api.admin.farmers.create.useMutation();

  const [_isSubmitting, setIsSubmitting] = useState(false);

  const currentLabels = useMemo(() => {
    if (mode === "single") {
      return [stepTitles[0], stepTitles[1]];
    }
    if (mode === "bulk-upload") {
      return [stepTitles[0], "Upload file"];
    }
    return [...stepTitles];
  }, [mode]);

  const _validateFarmerData = () => {
    if (
      !(
        farmer.firstName &&
        farmer.lastName &&
        farmer.phone &&
        farmer.dateOfBirth &&
        farmer.gender &&
        farmer.community &&
        farmer.address &&
        farmer.districtId &&
        farmer.idType &&
        farmer.idNumber
      )
    ) {
      return {
        valid: false,
        message: "Complete all required farmer details before continuing.",
      } as const;
    }
    return { valid: true } as const;
  };

  const handleCreateSingleFarmer = async () => {
    setIsSubmitting(true);

    try {
      // Prepare farmer data for API
      const farmerPayload = {
        firstName: farmer.firstName,
        lastName: farmer.lastName,
        gender: farmer.gender,
        dateOfBirth: farmer.dateOfBirth ? new Date(farmer.dateOfBirth) : undefined,
        phone: farmer.phone || undefined,
        isPhoneSmart: farmer.isPhoneSmart,
        idNumber: farmer.idNumber || undefined,
        idType: farmer.idType as "ghana_card" | "voters_id" | "passport" | "drivers_license" | undefined,
        address: farmer.address || undefined,
        districtId: farmer.districtId || undefined,
        community: farmer.community || undefined,
        householdSize: farmer.householdSize || undefined,
        isLeader: farmer.isLeader,
        organizationId: farmer.organizationId,
        farms: farms.map(farm => ({
          name: farm.name,
          acreage: farm.acreage || undefined,
          cropType: farm.cropType || undefined,
          soilType: farm.soilType || undefined,
          locationLat: farm.locationLat,
          locationLng: farm.locationLng,
        })),
      };

      const result = await createFarmerMutation.mutateAsync(farmerPayload);

      toast.success(
        `Farmer "${farmer.firstName} ${farmer.lastName}" created successfully${farms.length > 0 ? ` with ${farms.length} farm(s)` : ""}`
      );
      resetStore();
      router.push("/admin/farmers");
    } catch (error) {
      const message = extractErrorMessage(error) ?? "Failed to create farmer";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUploadComplete = () => {
    if (!bulkUpload.uploadResults) {
      toast.error("No upload results found");
      return;
    }

    const { successful, failed } = bulkUpload.uploadResults;

    if (successful > 0) {
      toast.success(
        `Bulk upload completed: ${successful} farmers created${
          failed > 0 ? `, ${failed} failed` : ""
        }`
      );
    } else {
      toast.error("No farmers were created successfully");
    }

    resetStore();
    router.push("/admin/farmers");
  };

  const renderStep = () => {
    switch (step) {
      case STEP_MODE:
        return <UploadModeStep onNext={nextStep} />;
      case STEP_DETAILS:
        return mode === "single" ? (
          <SingleFarmerStep
            onBack={prevStep}
            onNext={handleCreateSingleFarmer}
          />
        ) : mode === "bulk-upload" ? (
          <BulkUploadStep onBack={prevStep} onNext={handleBulkUploadComplete} />
        ) : (
          <Card className="p-6">Unexpected step.</Card>
        );
      default:
        return <Card className="p-6">Unexpected step.</Card>;
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "single":
        return "Create a new farmer profile with complete details including personal information, contact details, and identification.";
      case "bulk-upload":
        return "Upload multiple farmer profiles at once using an Excel or CSV file. Perfect for importing existing farmer databases.";
      default:
        return "Add new farmers to the system either individually with complete details or in bulk using file upload.";
    }
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
        <StepIndicator current={step} labels={currentLabels as string[]} />
        {renderStep()}
        <p className="text-muted-foreground text-xs">
          Need to pause? You can safely navigate away; no changes are committed
          until you complete the final step.
        </p>
      </div>
    </FarmerPageTitle>
  );
}

export default FarmerCreatePage;
