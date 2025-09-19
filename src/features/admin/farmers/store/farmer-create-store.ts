import { create } from "zustand";

export type FarmerCreationMode = "single" | "bulk-upload";

type FarmerFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  community: string;
  address: string;
  districtId: string;
  regionId: string;
  idType: string;
  idNumber: string;
  isLeader: boolean;
  isPhoneSmart: boolean;
  legacyFarmerId?: string;
  photoUrl?: string;
};

type BulkUploadData = {
  file: File | null;
  uploadProgress: number;
  isUploading: boolean;
  uploadResults: {
    successful: number;
    failed: number;
    errors: Array<{ row: number; message: string; data?: Record<string, any> }>;
  } | null;
};

type FarmerCreateStoreState = {
  step: number;
  mode: FarmerCreationMode | null;
  farmer: FarmerFormData;
  bulkUpload: BulkUploadData;
  setMode: (mode: FarmerCreationMode) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setFarmerData: (data: Partial<FarmerFormData>) => void;
  setBulkUploadData: (data: Partial<BulkUploadData>) => void;
  reset: () => void;
};

const TOTAL_STEPS = 2;

const initialFarmerState: FarmerFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  dateOfBirth: "",
  gender: "male",
  community: "",
  address: "",
  districtId: "",
  regionId: "",
  idType: "national_id",
  idNumber: "",
  isLeader: false,
  isPhoneSmart: false,
  legacyFarmerId: "",
  photoUrl: "",
};

const initialBulkUploadState: BulkUploadData = {
  file: null,
  uploadProgress: 0,
  isUploading: false,
  uploadResults: null,
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

export const useFarmerCreateStore = create<FarmerCreateStoreState>(
  (set) => ({
    step: 1,
    mode: null,
    farmer: { ...initialFarmerState },
    bulkUpload: { ...initialBulkUploadState },
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
    setFarmerData: (data) =>
      set((state) => ({
        farmer: { ...state.farmer, ...data },
      })),
    setBulkUploadData: (data) =>
      set((state) => ({
        bulkUpload: { ...state.bulkUpload, ...data },
      })),
    reset: () =>
      set({
        step: 1,
        mode: null,
        farmer: { ...initialFarmerState },
        bulkUpload: { ...initialBulkUploadState },
      }),
  })
);

export const farmerWizardTotalSteps = TOTAL_STEPS;