import { create } from "zustand";
import {
	FormPersistence,
	stripTimestamp,
	withTimestamp,
} from "@/lib/form-persistence";

export type UserCreationMode = "new-organization" | "existing-organization";

type UserFormData = {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	districtId: string;
	address: string;
};

type ExistingOrganizationSelection = {
	organizationId: string;
	name: string;
	slug: string;
};

type NewOrganizationData = {
	name: string;
	slug: string;
	organizationType: string;
	organizationSubType: string;
	subscriptionType: string;
	licenseStatus: string;
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

type UserCreateStoreState = {
	step: number;
	mode: UserCreationMode | null;
	user: UserFormData;
	existingOrganization: ExistingOrganizationSelection | null;
	newOrganization: NewOrganizationData;
	setMode: (mode: UserCreationMode) => void;
	setStep: (step: number) => void;
	nextStep: () => void;
	prevStep: () => void;
	setUserData: (data: Partial<UserFormData>) => void;
	setExistingOrganization: (org: ExistingOrganizationSelection | null) => void;
	setNewOrganizationData: (data: Partial<NewOrganizationData>) => void;
	saveProgress: () => void;
	loadProgress: () => boolean;
	clearProgress: () => void;
	hasSavedProgress: () => boolean;
	reset: () => void;
};

const TOTAL_STEPS = 4;

const initialUserState: UserFormData = {
	firstName: "",
	lastName: "",
	email: "",
	phoneNumber: "",
	districtId: "",
	address: "",
};

const initialNewOrganizationState: NewOrganizationData = {
	name: "",
	slug: "",
	organizationType: "FARMER_ORG",
	organizationSubType: "",
	subscriptionType: "FREEMIUM",
	licenseStatus: "ISSUED",
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

export const useUserCreateStore = create<UserCreateStoreState>((set, get) => ({
	step: 1,
	mode: null,
	user: { ...initialUserState },
	existingOrganization: null,
	newOrganization: { ...initialNewOrganizationState },
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
	setUserData: (data) =>
		set((state) => ({
			user: { ...state.user, ...data },
		})),
	setExistingOrganization: (org) => set({ existingOrganization: org }),
	setNewOrganizationData: (data) =>
		set((state) => ({
			newOrganization: { ...state.newOrganization, ...data },
		})),
	saveProgress: () => {
		const state = get();
		const dataToSave = {
			step: state.step,
			mode: state.mode,
			user: state.user,
			existingOrganization: state.existingOrganization,
			newOrganization: state.newOrganization,
		};
		FormPersistence.save("USER", withTimestamp(dataToSave));
	},
	loadProgress: () => {
		const savedData = FormPersistence.load("USER");
		if (!savedData) return false;

		const data = stripTimestamp(savedData);
		set({
			step: data.step || 1,
			mode: data.mode || null,
			user: { ...initialUserState, ...data.user },
			existingOrganization: data.existingOrganization || null,
			newOrganization: {
				...initialNewOrganizationState,
				...data.newOrganization,
			},
		});
		return true;
	},
	clearProgress: () => {
		FormPersistence.clear("USER");
	},
	hasSavedProgress: () => {
		return FormPersistence.hasSavedData("USER");
	},
	reset: () =>
		set({
			step: 1,
			mode: null,
			user: { ...initialUserState },
			existingOrganization: null,
			newOrganization: { ...initialNewOrganizationState },
		}),
}));

export const userWizardTotalSteps = TOTAL_STEPS;
