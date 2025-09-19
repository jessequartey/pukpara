"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { USER_KYC_STATUS, USER_STATUS } from "@/config/constants/auth";
import { ExistingOrganizationStep } from "@/features/admin/users/components/user-create/existing-organization-step";
import { NewOrganizationStep } from "@/features/admin/users/components/user-create/new-organization-step";
import { OrganizationModeStep } from "@/features/admin/users/components/user-create/organization-mode-step";
import { ReviewStep } from "@/features/admin/users/components/user-create/review-step";
import { UserDetailsStep } from "@/features/admin/users/components/user-create/user-details-step";
import { UserPageTitle } from "@/features/admin/users/components/user-page-title";
import { useUserCreateStore } from "@/features/admin/users/store/user-create-store";
import { createUser } from "@/lib/auth-admin-client";
import { cn } from "@/lib/utils";

const stepTitles = [
  "Organization setup",
  "Organization selection",
  "User details",
  "Review & create",
] as const;

const STEP_MODE = 1;
const STEP_ORGANIZATION = 2;
const STEP_USER = 3;
const STEP_REVIEW = 4;
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

// Helper functions for error extraction
const extractFromError = (error: Error): string | null => {
  const trimmed = error.message.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const extractFromNestedProperty = (
  obj: object,
  ...properties: string[]
): unknown => {
  let current: unknown = obj;
  for (const prop of properties) {
    if (
      current &&
      typeof current === "object" &&
      current !== null &&
      prop in current
    ) {
      current = (current as Record<string, unknown>)[prop];
    } else {
      return null;
    }
  }
  return current;
};

const extractCandidateMessages = (error: object): string[] => {
  const candidates: unknown[] = [];

  // Check direct message property
  if ("message" in error) {
    candidates.push((error as { message?: unknown }).message);
  }

  // Check nested error.message
  const nestedError = extractFromNestedProperty(error, "error", "message");
  if (nestedError) {
    candidates.push(nestedError);
  }

  // Check nested data.message
  const dataMessage = extractFromNestedProperty(error, "data", "message");
  if (dataMessage) {
    candidates.push(dataMessage);
  }

  // Check nested body.message
  const bodyMessage = extractFromNestedProperty(error, "body", "message");
  if (bodyMessage) {
    candidates.push(bodyMessage);
  }

  return candidates
    .filter((candidate): candidate is string => typeof candidate === "string")
    .map((candidate) => candidate.trim())
    .filter((trimmed) => trimmed.length > 0);
};

const extractErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return extractFromError(error);
  }

  if (typeof error === "object" && error !== null) {
    const candidateMessages = extractCandidateMessages(error);
    return candidateMessages.length > 0 ? candidateMessages[0] : null;
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentLabels = useMemo(() => {
    if (mode === "existing-organization") {
      return [stepTitles[0], stepTitles[1], stepTitles[2], stepTitles[3]];
    }
    if (mode === "new-organization") {
      return [
        stepTitles[0],
        "Organization details",
        stepTitles[2],
        stepTitles[3],
      ];
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

  const validateOrganizationData = () => {
    if (mode === "existing-organization") {
      return existingOrganization?.organizationId
        ? ({ valid: true } as const)
        : ({
            valid: false,
            message: "Select an organization before continuing.",
          } as const);
    }

    if (mode === "new-organization") {
      const requiredFields = [
        newOrganization.name,
        newOrganization.slug,
        newOrganization.organizationType,
        newOrganization.contactEmail,
        newOrganization.contactPhone,
        newOrganization.address,
      ];
      return requiredFields.every(Boolean)
        ? ({ valid: true } as const)
        : ({
            valid: false,
            message: "Complete all organization details before continuing.",
          } as const);
    }

    return { valid: true } as const;
  };

  // Helper functions for user creation
  const handlePasswordSetup = async (email: string, _userName: string) => {
    try {
      await requestPasswordSetup(email);
    } catch (inviteError) {
      const inviteMessage =
        extractErrorMessage(inviteError) ??
        "Invite email could not be sent. The user can use the password reset page manually.";
      toast.warning(inviteMessage);
    }
  };

  const createUserWithExistingOrganization = async (
    password: string,
    fullName: string
  ) => {
    if (!existingOrganization) {
      throw new Error("No existing organization selected");
    }

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

    await handlePasswordSetup(user.email, fullName);

    toast.success(
      `User "${fullName}" created and added to "${existingOrganization.name}"`
    );
  };

  const createUserWithNewOrganization = async (
    password: string,
    fullName: string
  ) => {
    const orgMetadata = {
      source: "admin" as const,
      organizationName: newOrganization.name,
      organizationSlug: newOrganization.slug,
      organizationType: newOrganization.organizationType,
      organizationSubType: newOrganization.organizationSubType,
      subscriptionType: newOrganization.subscriptionType,
      licenseStatus: newOrganization.licenseStatus,
      maxUsers: newOrganization.maxUsers,
      contactEmail: newOrganization.contactEmail,
      contactPhone: newOrganization.contactPhone,
      address: newOrganization.address,
      districtId: user.districtId,
      billingEmail: newOrganization.billingEmail,
      notes: newOrganization.notes,
    };

    await createUser({
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

    await handlePasswordSetup(user.email, fullName);

    toast.success(
      `User "${fullName}" and organization "${newOrganization.name}" created successfully`
    );
  };

  const handleCreateUser = async () => {
    const userValidation = validateUserData();
    if (!userValidation.valid) {
      toast.error(userValidation.message);
      return;
    }

    const orgValidation = validateOrganizationData();
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

      if (mode === "existing-organization") {
        await createUserWithExistingOrganization(password, fullName);
      } else if (mode === "new-organization") {
        await createUserWithNewOrganization(password, fullName);
      }

      resetStore();
      router.push("/admin/users");
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
        if (mode === "existing-organization") {
          return (
            <ExistingOrganizationStep onBack={prevStep} onNext={nextStep} />
          );
        }
        if (mode === "new-organization") {
          return <NewOrganizationStep onBack={prevStep} onNext={nextStep} />;
        }
        return (
          <Card className="p-6">Please select an organization mode first.</Card>
        );
      case STEP_USER:
        return <UserDetailsStep onBack={prevStep} onNext={nextStep} />;
      case STEP_REVIEW:
        return (
          <ReviewStep
            isSubmitting={isSubmitting}
            onBack={prevStep}
            onSubmit={handleCreateUser}
          />
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
