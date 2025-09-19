"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { CreationModeStep } from "@/features/admin/organizations/components/organization-create/creation-mode-step";
import { ExistingUserStep } from "@/features/admin/organizations/components/organization-create/existing-user-step";
import { NewUserStep } from "@/features/admin/organizations/components/organization-create/new-user-step";
import { OrganizationDetailsStep } from "@/features/admin/organizations/components/organization-create/organization-details-step";
import { ReviewStep } from "@/features/admin/organizations/components/organization-create/review-step";
import { OrganizationPageTitle } from "@/features/admin/organizations/components/organization-page-title";
import { useOrganizationCreateStore } from "@/features/admin/organizations/store/organization-create-store";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

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

const isNewUserDataValid = (
  newUser: ReturnType<typeof useOrganizationCreateStore.getState>["newUser"]
) => {
  const requiredFields = [
    newUser.email,
    newUser.firstName,
    newUser.lastName,
    newUser.phoneNumber,
    newUser.districtId,
    newUser.address,
  ];
  return requiredFields.every(Boolean);
};

const validateUserData = (
  mode: ReturnType<typeof useOrganizationCreateStore.getState>["mode"],
  newUser: ReturnType<typeof useOrganizationCreateStore.getState>["newUser"],
  existingUser: ReturnType<
    typeof useOrganizationCreateStore.getState
  >["existingUser"]
) => {
  if (mode === "new-user") {
    return isNewUserDataValid(newUser)
      ? ({ valid: true } as const)
      : ({
          valid: false,
          message:
            "Complete the new user details before creating the organization.",
        } as const);
  }

  if (mode === "existing-user") {
    return existingUser?.userId
      ? ({ valid: true } as const)
      : ({
          valid: false,
          message: "Select an existing owner before continuing.",
        } as const);
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
  const validationRules = [
    {
      condition: !(organization.name && organization.slug),
      message: "Organization name and slug are required.",
    },
    {
      condition: !organization.districtId,
      message: "Select the organization's district before provisioning.",
    },
    {
      condition: !organization.organizationType,
      message: "Choose an organization type.",
    },
  ];

  const failedRule = validationRules.find((rule) => rule.condition);

  return failedRule
    ? ({ valid: false, message: failedRule.message } as const)
    : ({ valid: true } as const);
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

  // tRPC mutations
  const createNewUserWorkspace =
    api.admin.organizations.createNewUserWorkspace.useMutation();
  const addOrganizationToUser =
    api.admin.organizations.addOrganizationToUser.useMutation();

  const currentLabels = useMemo(() => {
    if (mode === "existing-user") {
      return [stepTitles[0], "Select owner", stepTitles[2], stepTitles[3]];
    }

    return [...stepTitles];
  }, [mode]);

  const validateBeforeCreation = () => {
    const userValidation = validateUserData(mode, newUser, existingUser);
    if (!userValidation.valid) {
      toast.error(userValidation.message);
      return false;
    }

    const organizationValidation = validateOrganizationData(organization);
    if (!organizationValidation.valid) {
      toast.error(organizationValidation.message);
      return false;
    }

    return true;
  };

  const createNewUserWorkspaceFlow = async () => {
    const result = await createNewUserWorkspace.mutateAsync({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      districtId: newUser.districtId,
      address: newUser.address,
      organizationName: organization.name,
      organizationType: organization.organizationType,
      organizationSubType: organization.organizationSubType,
      contactEmail: organization.contactEmail,
      contactPhone: organization.contactPhone,
      regionId: organization.regionId,
    });

    if (!result.success) {
      throw new Error("Failed to create user workspace");
    }

    toast.success(
      `Organization "${organization.name}" and user created successfully`
    );
  };

  const addOrganizationToExistingUserFlow = async () => {
    if (!existingUser?.userId) {
      throw new Error("No user selected");
    }

    const result = await addOrganizationToUser.mutateAsync({
      userId: existingUser.userId,
      organizationName: organization.name,
      organizationType: organization.organizationType,
      organizationSubType: organization.organizationSubType,
      contactEmail: organization.contactEmail,
      contactPhone: organization.contactPhone,
      address: organization.address,
      districtId: organization.districtId,
      regionId: organization.regionId,
    });

    if (!result.success) {
      throw new Error("Failed to create organization");
    }

    toast.success(`Organization "${organization.name}" created`);
  };

  const handleCreateOrganization = async () => {
    if (!validateBeforeCreation()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "new-user") {
        await createNewUserWorkspaceFlow();
      } else if (mode === "existing-user") {
        await addOrganizationToExistingUserFlow();
      }

      resetStore();
      router.push("/admin/organizations");
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
