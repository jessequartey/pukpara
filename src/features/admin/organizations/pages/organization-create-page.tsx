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
import { CreationModeStep } from "@/features/admin/organizations/components/organization-create/creation-mode-step";
import { ExistingUserStep } from "@/features/admin/organizations/components/organization-create/existing-user-step";
import { NewUserStep } from "@/features/admin/organizations/components/organization-create/new-user-step";
import { OrganizationDetailsStep } from "@/features/admin/organizations/components/organization-create/organization-details-step";
import { ReviewStep } from "@/features/admin/organizations/components/organization-create/review-step";
import { OrganizationPageTitle } from "@/features/admin/organizations/components/organization-page-title";
import { useOrganizationCreateStore } from "@/features/admin/organizations/store/organization-create-store";
import { createUser } from "@/lib/auth-admin-client";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const stepTitles = [
  "Select mode",
  "Owner setup",
  "Organization details",
  "Review & create",
] as const;

const STEP_MODE = 1;
const STEP_OWNER = 2;
const STEP_ORGANIZATION = 3;
const STEP_REVIEW = 4;
const DEFAULT_MAX_USERS = 100;
const TEMP_PASSWORD_LENGTH = 20;
const RANDOM_SLICE_START = 2;
const RANDOM_RADIX = 36;
const TRAILING_SLASH_REGEX = /\/$/;

const optionalString = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

type OwnerContext = {
  id: string;
  email?: string;
  phoneNumber?: string;
  districtId?: string;
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
    return "A user with this email already exists. Switch to “Attach to existing user.”";
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

const validateUserData = (
  mode: ReturnType<typeof useOrganizationCreateStore.getState>["mode"],
  newUser: ReturnType<typeof useOrganizationCreateStore.getState>["newUser"],
  existingUser: ReturnType<
    typeof useOrganizationCreateStore.getState
  >["existingUser"]
) => {
  if (mode === "new-user") {
    if (
      !(
        newUser.email &&
        newUser.firstName &&
        newUser.lastName &&
        newUser.phoneNumber &&
        newUser.districtId &&
        newUser.address
      )
    ) {
      return {
        valid: false,
        message:
          "Complete the new user details before creating the organization.",
      } as const;
    }
    return { valid: true } as const;
  }

  if (mode === "existing-user") {
    if (!existingUser?.userId) {
      return {
        valid: false,
        message: "Select an existing owner before continuing.",
      } as const;
    }
    return { valid: true } as const;
  }

  return {
    valid: false,
    message: "Select a creation mode to continue.",
  } as const;
};

const validateOrganizationData = (
  organization: ReturnType<
    typeof useOrganizationCreateStore.getState
  >["organization"]
) => {
  if (!(organization.name && organization.slug)) {
    return {
      valid: false,
      message: "Organization name and slug are required.",
    } as const;
  }

  if (!organization.districtId) {
    return {
      valid: false,
      message: "Select the organization's district before provisioning.",
    } as const;
  }

  if (!organization.organizationType) {
    return {
      valid: false,
      message: "Choose an organization type.",
    } as const;
  }

  return { valid: true } as const;
};

export function OrganizationCreatePage() {
  const router = useRouter();
  const step = useOrganizationCreateStore((state) => state.step);
  const mode = useOrganizationCreateStore((state) => state.mode);
  const newUser = useOrganizationCreateStore((state) => state.newUser);
  const existingUser = useOrganizationCreateStore(
    (state) => state.existingUser
  );
  const organization = useOrganizationCreateStore(
    (state) => state.organization
  );
  const nextStep = useOrganizationCreateStore((state) => state.nextStep);
  const prevStep = useOrganizationCreateStore((state) => state.prevStep);
  const resetStore = useOrganizationCreateStore((state) => state.reset);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentLabels = useMemo(() => {
    if (mode === "existing-user") {
      return [stepTitles[0], "Select owner", stepTitles[2], stepTitles[3]];
    }

    return [...stepTitles];
  }, [mode]);

  const resolveOwner = async (): Promise<OwnerContext | null> => {
    if (mode === "existing-user") {
      if (!existingUser?.userId) {
        return null;
      }

      return {
        id: existingUser.userId,
        email: existingUser.email,
      };
    }

    if (mode !== "new-user") {
      return null;
    }

    const password = generateTemporaryPassword();
    const fullName = `${newUser.firstName} ${newUser.lastName}`
      .trim()
      .replace(/\s+/g, " ");

    try {
      const response = await createUser({
        body: {
          email: newUser.email,
          password,
          name: fullName,
          data: {
            phoneNumber: newUser.phoneNumber,
            address: newUser.address,
            districtId: newUser.districtId,
            status: USER_STATUS.APPROVED,
            kycStatus: USER_KYC_STATUS.PENDING,
          },
        },
      });

      try {
        await requestPasswordSetup(newUser.email);
      } catch (inviteError) {
        const inviteMessage =
          extractErrorMessage(inviteError) ??
          "Invite email could not be sent. The owner can use the password reset page manually.";
        toast.warning(inviteMessage);
      }

      return {
        id: response.user.id,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        districtId: newUser.districtId,
      };
    } catch (error) {
      throw new Error(interpretCreateUserError(error));
    }
  };

  const buildOrganizationPayload = (owner: OwnerContext) => {
    const trimmedNotes = organization.notes.trim();
    const ownerEmail = optionalString(owner.email ?? "");
    const ownerPhone = optionalString(owner.phoneNumber ?? "");
    const contactEmail =
      optionalString(organization.contactEmail) ?? ownerEmail;
    const contactPhone =
      optionalString(organization.contactPhone) ?? ownerPhone;
    const billingEmail =
      optionalString(organization.billingEmail) ?? contactEmail;

    const metadata: Record<string, string> = {};
    if (trimmedNotes.length > 0) {
      metadata.notes = trimmedNotes;
    }
    const regionName = optionalString(organization.regionName);
    if (regionName) {
      metadata.regionName = regionName;
    }
    const districtName = optionalString(organization.districtName);
    if (districtName) {
      metadata.districtName = districtName;
    }

    return {
      name: organization.name,
      slug: organization.slug,
      userId: owner.id,
      organizationType:
        organization.organizationType ?? ORGANIZATION_TYPE.FARMER_ORG,
      organizationSubType: optionalString(organization.organizationSubType),
      subscriptionType:
        organization.subscriptionType ??
        ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM,
      licenseStatus:
        organization.licenseStatus ?? ORGANIZATION_LICENSE_STATUS.ISSUED,
      maxUsers: organization.maxUsers ?? DEFAULT_MAX_USERS,
      contactEmail,
      contactPhone,
      billingEmail,
      address: optionalString(organization.address),
      districtId: optionalString(organization.districtId),
      regionId: optionalString(organization.regionId),
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    } as const;
  };

  const handleCreateOrganization = async () => {
    const userValidation = validateUserData(mode, newUser, existingUser);
    if (!userValidation.valid) {
      toast.error(userValidation.message);
      return;
    }

    const organizationValidation = validateOrganizationData(organization);
    if (!organizationValidation.valid) {
      toast.error(organizationValidation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const owner = await resolveOwner();

      if (!owner?.id) {
        throw new Error("Unable to determine organization owner");
      }

      const payload = buildOrganizationPayload(owner);

      const created = await authClient.organization.create({
        body: payload,
      });

      toast.success(`Organization “${created.name}” created`);
      resetStore();
      router.push(`/admin/organizations/${encodeURIComponent(created.id)}`);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to create organization";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case STEP_MODE:
        return <CreationModeStep onNext={nextStep} />;
      case STEP_OWNER:
        return mode === "existing-user" ? (
          <ExistingUserStep onBack={prevStep} onNext={nextStep} />
        ) : (
          <NewUserStep onBack={prevStep} onNext={nextStep} />
        );
      case STEP_ORGANIZATION:
        return <OrganizationDetailsStep onBack={prevStep} onNext={nextStep} />;
      case STEP_REVIEW:
        return (
          <ReviewStep
            isSubmitting={isSubmitting}
            onBack={prevStep}
            onSubmit={handleCreateOrganization}
          />
        );
      default:
        return <Card className="p-6">Unexpected step.</Card>;
    }
  };

  return (
    <OrganizationPageTitle
      action={{
        href: "/admin/organizations",
        icon: ArrowLeft,
        label: "Back to organizations",
      }}
      description="Provision a new workspace, configure its defaults, and assign an owner in a guided flow."
      title="Create organization"
    >
      <div className="space-y-6">
        <StepIndicator current={step} labels={currentLabels as string[]} />
        {renderStep()}
        <p className="text-muted-foreground text-xs">
          Need to pause? You can safely navigate away; no changes are committed
          until you run the final create step.
        </p>
      </div>
    </OrganizationPageTitle>
  );
}

export default OrganizationCreatePage;
