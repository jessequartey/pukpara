"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
  ORGANIZATION_LICENSE_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  ORGANIZATION_TYPE,
  USER_KYC_STATUS,
  USER_STATUS,
} from "@/config/constants/auth";
import { ExistingOrganizationStep } from "@/features/admin/users/components/user-create/existing-organization-step";
import { OrganizationModeStep } from "@/features/admin/users/components/user-create/organization-mode-step";
import { UserDetailsStep } from "@/features/admin/users/components/user-create/user-details-step";
import { UserPageTitle } from "@/features/admin/users/components/user-page-title";
import { useUserCreateStore } from "@/features/admin/users/store/user-create-store";
import { createUser } from "@/lib/auth-admin-client";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const stepTitles = [
  "Organization setup",
  "Organization selection",
  "User details",
] as const;

const STEP_MODE = 1;
const STEP_ORGANIZATION = 2;
const STEP_USER = 3;
const TEMP_PASSWORD_LENGTH = 20;
const RANDOM_SLICE_START = 2;
const RANDOM_RADIX = 36;
const TRAILING_SLASH_REGEX = /\/$/;

const _optionalString = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

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
    if ("body" in error) {
      const nested = (error as { body?: { message?: unknown } }).body;
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

const interpretCreateUserError = (error: unknown) => {
  const message = extractErrorMessage(error);
  if (message === "User already exists. Use another email.") {
    return "A user with this email already exists. Please use a different email address.";
  }
  return message ?? "Failed to create user";
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

const generateTemporaryPassword = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, TEMP_PASSWORD_LENGTH);
  }
  const randomFallback = Math.random().toString(RANDOM_RADIX);
  return randomFallback.slice(
    RANDOM_SLICE_START,
    RANDOM_SLICE_START + TEMP_PASSWORD_LENGTH
  );
};

const getPasswordResetRedirect = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/reset-password`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(TRAILING_SLASH_REGEX, "")}/reset-password`;
};

const requestPasswordSetup = async (email: string) => {
  const response = await fetch("/api/auth/request-password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      redirectTo: getPasswordResetRedirect(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send password setup email");
  }

  let result: { status?: boolean } | null = null;
  try {
    result = (await response.json()) as { status?: boolean };
  } catch {
    result = null;
  }

  if (!result?.status) {
    throw new Error("Unable to dispatch password setup email");
  }
};

export function UserCreatePage() {
  const router = useRouter();
  const step = useUserCreateStore((state) => state.step);
  const mode = useUserCreateStore((state) => state.mode);
  const user = useUserCreateStore((state) => state.user);
  const existingOrganization = useUserCreateStore(
    (state) => state.existingOrganization
  );
  const newOrganization = useUserCreateStore((state) => state.newOrganization);
  const nextStep = useUserCreateStore((state) => state.nextStep);
  const prevStep = useUserCreateStore((state) => state.prevStep);
  const resetStore = useUserCreateStore((state) => state.reset);

  const [_isSubmitting, setIsSubmitting] = useState(false);

  const currentLabels = useMemo(() => {
    if (mode === "existing-organization") {
      return [stepTitles[0], stepTitles[1], stepTitles[2]];
    }
    if (mode === "new-organization") {
      return [stepTitles[0], "User details", "Review"];
    }
    return [...stepTitles];
  }, [mode]);

  const validateUserData = () => {
    if (
      !(
        user.email &&
        user.firstName &&
        user.lastName &&
        user.phoneNumber &&
        user.districtId &&
        user.address
      )
    ) {
      return {
        valid: false,
        message: "Complete all user details before continuing.",
      } as const;
    }
    return { valid: true } as const;
  };

  const validateOrganizationSelection = () => {
    if (
      mode === "existing-organization" &&
      !existingOrganization?.organizationId
    ) {
      return {
        valid: false,
        message: "Select an organization before continuing.",
      } as const;
    }
    return { valid: true } as const;
  };

  const handleCreateUser = async () => {
    const userValidation = validateUserData();
    if (!userValidation.valid) {
      toast.error(userValidation.message);
      return;
    }

    const orgValidation = validateOrganizationSelection();
    if (!orgValidation.valid) {
      toast.error(orgValidation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const password = generateTemporaryPassword();
      const fullName = `${user.firstName} ${user.lastName}`
        .trim()
        .replace(/\s+/g, " ");

      if (mode === "existing-organization" && existingOrganization) {
        // Create user and add to existing organization
        const response = await createUser({
          email: user.email,
          password,
          name: fullName,
          data: {
            phoneNumber: user.phoneNumber,
            address: user.address,
            districtId: user.districtId,
            status: USER_STATUS.APPROVED,
            kycStatus: USER_KYC_STATUS.PENDING,
          },
        });

        if (!response.data?.user?.id) {
          throw new Error("Failed to create user");
        }

        // TODO: Add user to organization
        // await authClient.organization.addMember({
        //   organizationId: existingOrganization.organizationId,
        //   userId: response.data.user.id,
        //   role: "member",
        // });

        try {
          await requestPasswordSetup(user.email);
        } catch (inviteError) {
          const inviteMessage =
            extractErrorMessage(inviteError) ??
            "Invite email could not be sent. The user can use the password reset page manually.";
          toast.warning(inviteMessage);
        }

        toast.success(
          `User "${fullName}" created and added to "${existingOrganization.name}"`
        );
        resetStore();
        router.push("/admin/users");
      } else if (mode === "new-organization") {
        // Create user with organization metadata for the after hook
        const orgMetadata = {
          source: "admin" as const,
          organizationName:
            newOrganization.name || `${fullName}'s Organization`,
          organizationSlug:
            newOrganization.slug || `${user.firstName.toLowerCase()}-org`,
          organizationType: ORGANIZATION_TYPE.FARMER_ORG,
          subscriptionType: ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM,
          licenseStatus: ORGANIZATION_LICENSE_STATUS.ISSUED,
          maxUsers: 100,
          contactEmail: user.email,
          contactPhone: user.phoneNumber,
          address: user.address,
          districtId: user.districtId,
        };

        const _response = await createUser({
          email: user.email,
          password,
          name: fullName,
          data: {
            phoneNumber: user.phoneNumber,
            address: user.address,
            districtId: user.districtId,
            status: USER_STATUS.APPROVED,
            kycStatus: USER_KYC_STATUS.PENDING,
            organizationMetadata: orgMetadata,
          },
        });

        try {
          await requestPasswordSetup(user.email);
        } catch (inviteError) {
          const inviteMessage =
            extractErrorMessage(inviteError) ??
            "Invite email could not be sent. The user can use the password reset page manually.";
          toast.warning(inviteMessage);
        }

        toast.success(
          `User "${fullName}" and organization created successfully`
        );
        resetStore();
        router.push("/admin/users");
      }
    } catch (error) {
      const message = interpretCreateUserError(error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case STEP_MODE:
        return <OrganizationModeStep onNext={nextStep} />;
      case STEP_ORGANIZATION:
        return mode === "existing-organization" ? (
          <ExistingOrganizationStep onBack={prevStep} onNext={nextStep} />
        ) : (
          <UserDetailsStep onBack={prevStep} onNext={handleCreateUser} />
        );
      case STEP_USER:
        return mode === "existing-organization" ? (
          <UserDetailsStep onBack={prevStep} onNext={handleCreateUser} />
        ) : (
          <Card className="p-6">Unexpected step.</Card>
        );
      default:
        return <Card className="p-6">Unexpected step.</Card>;
    }
  };

  return (
    <UserPageTitle
      action={{
        href: "/admin/users",
        icon: ArrowLeft,
        label: "Back to users",
      }}
      description="Create a new user account and either add them to an existing organization or create a new organization for them."
      title="Create user"
    >
      <div className="space-y-6">
        <StepIndicator current={step} labels={currentLabels as string[]} />
        {renderStep()}
        <p className="text-muted-foreground text-xs">
          Need to pause? You can safely navigate away; no changes are committed
          until you complete the final step.
        </p>
      </div>
    </UserPageTitle>
  );
}

export default UserCreatePage;
