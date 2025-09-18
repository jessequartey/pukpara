import { create } from "zustand";

import {
  ORGANIZATION_LICENSE_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
  ORGANIZATION_TYPE,
} from "@/config/constants/auth";

export type OrganizationCreationMode = "new-user" | "existing-user";

type NewUserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  districtId: string;
  address: string;
};

type ExistingUserSelection = {
  userId: string;
  name: string;
  email: string;
};

type OrganizationDetailsData = {
  name: string;
  slug: string;
  organizationType: (typeof ORGANIZATION_TYPE)[keyof typeof ORGANIZATION_TYPE];
  organizationSubType: string;
  subscriptionType: (typeof ORGANIZATION_SUBSCRIPTION_TYPE)[keyof typeof ORGANIZATION_SUBSCRIPTION_TYPE];
  licenseStatus: (typeof ORGANIZATION_LICENSE_STATUS)[keyof typeof ORGANIZATION_LICENSE_STATUS];
  maxUsers: number | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
  regionId: string;
  regionName: string;
  districtId: string;
  districtName: string;
  billingEmail: string;
  notes: string;
};

type OrganizationCreateStoreState = {
  step: number;
  mode: OrganizationCreationMode | null;
  newUser: NewUserFormData;
  existingUser: ExistingUserSelection | null;
  organization: OrganizationDetailsData;
  setMode: (mode: OrganizationCreationMode) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setNewUserData: (data: Partial<NewUserFormData>) => void;
  setExistingUser: (user: ExistingUserSelection | null) => void;
  setOrganizationData: (data: Partial<OrganizationDetailsData>) => void;
  reset: () => void;
};

const TOTAL_STEPS = 4;

const initialNewUserState: NewUserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  districtId: "",
  address: "",
};

const initialOrganizationState: OrganizationDetailsData = {
  name: "",
  slug: "",
  organizationType: ORGANIZATION_TYPE.FARMER_ORG,
  organizationSubType: "",
  subscriptionType: ORGANIZATION_SUBSCRIPTION_TYPE.FREEMIUM,
  licenseStatus: ORGANIZATION_LICENSE_STATUS.ISSUED,
  maxUsers: 100,
  contactEmail: "",
  contactPhone: "",
  address: "",
  regionId: "",
  regionName: "",
  districtId: "",
  districtName: "",
  billingEmail: "",
  notes: "",
};

const clampStep = (step: number) => {
  if (step < 1) {
    return 1;
  }
  if (step > TOTAL_STEPS) {
    return TOTAL_STEPS;
  }
  return step;
};

export const useOrganizationCreateStore = create<OrganizationCreateStoreState>(
  (set) => ({
    step: 1,
    mode: null,
    newUser: { ...initialNewUserState },
    existingUser: null,
    organization: { ...initialOrganizationState },
    setMode: (mode) => set({ mode }),
    setStep: (step) => set({ step: clampStep(step) }),
    nextStep: () =>
      set((state) => ({
        step: clampStep(state.step + 1),
      })),
    prevStep: () =>
      set((state) => ({
        step: clampStep(state.step - 1),
      })),
    setNewUserData: (data) =>
      set((state) => ({
        newUser: { ...state.newUser, ...data },
      })),
    setExistingUser: (user) => set({ existingUser: user }),
    setOrganizationData: (data) =>
      set((state) => ({
        organization: { ...state.organization, ...data },
      })),
    reset: () =>
      set({
        step: 1,
        mode: null,
        newUser: { ...initialNewUserState },
        existingUser: null,
        organization: { ...initialOrganizationState },
      }),
  })
);

export const organizationWizardTotalSteps = TOTAL_STEPS;
