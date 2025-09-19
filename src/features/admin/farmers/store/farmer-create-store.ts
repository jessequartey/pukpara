/** biome-ignore-all lint/performance/useTopLevelRegex: <necessary
 *
> */
import { create } from "zustand";

export type FarmerCreationMode = "single" | "bulk-upload";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
  organizationType: string;
  memberCount?: number;
};

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
  organizationId: string;
  householdSize: number | null;
  legacyFarmerId?: string;
  photoUrl?: string;
};

type FarmData = {
  id?: string;
  name: string;
  acreage: number | null;
  cropType: string;
  soilType: "sandy" | "clay" | "loamy" | "silt" | "rocky" | "";
  locationLat?: number;
  locationLng?: number;
};

type ValidationError = {
  field: string;
  message: string;
};

type UploadedFarmer = {
  id: string; // Temporary ID for tracking
  rowNumber: number;
  isValid: boolean;
  errors: ValidationError[];
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    community: string;
    address: string;
    districtName: string;
    organizationName: string;
    idType: "ghana_card" | "voters_id" | "passport" | "drivers_license";
    idNumber: string;
    householdSize: number | null;
    isLeader: boolean;
    isPhoneSmart: boolean;
    legacyFarmerId?: string;
  };
  farms: Array<{
    id: string; // Temporary ID for tracking
    name: string;
    acreage: number | null;
    cropType: string;
    soilType: "sandy" | "clay" | "loamy" | "silt" | "rocky" | "";
    locationLat?: number;
    locationLng?: number;
    errors: ValidationError[];
    isValid: boolean;
  }>;
};

type BulkUploadData = {
  file: File | null;
  uploadProgress: number;
  isUploading: boolean;
  isProcessing: boolean;
  parsedFarmers: UploadedFarmer[];
  uploadResults: {
    successful: number;
    failed: number;
    errors: Array<{
      row: number;
      message: string;
      data?: Record<string, unknown>;
    }>;
  } | null;
};

type FarmerCreateStoreState = {
  step: number;
  mode: FarmerCreationMode | null;
  farmer: FarmerFormData;
  farms: FarmData[];
  bulkUpload: BulkUploadData;
  selectedOrganization: OrganizationOption | null;
  setMode: (mode: FarmerCreationMode) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setFarmerData: (data: Partial<FarmerFormData>) => void;
  setFarms: (farms: FarmData[]) => void;
  addFarm: (farm: FarmData) => void;
  removeFarm: (index: number) => void;
  updateFarm: (index: number, farm: Partial<FarmData>) => void;
  setBulkUploadData: (data: Partial<BulkUploadData>) => void;
  setSelectedOrganization: (organization: OrganizationOption | null) => void;
  updateUploadedFarmer: (
    farmerId: string,
    data: Partial<UploadedFarmer["data"]>
  ) => void;
  updateUploadedFarm: (
    farmerId: string,
    farmId: string,
    data: Partial<UploadedFarmer["farms"][0]>
  ) => void;
  deleteUploadedFarmer: (farmerId: string) => void;
  deleteUploadedFarm: (farmerId: string, farmId: string) => void;
  validateUploadedFarmers: () => void;
  reset: () => void;
};

const TOTAL_STEPS = 4;

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
  organizationId: "",
  householdSize: null,
  legacyFarmerId: "",
  photoUrl: "",
};

const initialBulkUploadState: BulkUploadData = {
  file: null,
  uploadProgress: 0,
  isUploading: false,
  isProcessing: false,
  parsedFarmers: [],
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

export const useFarmerCreateStore = create<FarmerCreateStoreState>((set) => ({
  step: 1,
  mode: null,
  farmer: { ...initialFarmerState },
  farms: [],
  bulkUpload: { ...initialBulkUploadState },
  selectedOrganization: null,
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
  setFarms: (farms) => set({ farms }),
  addFarm: (farm) =>
    set((state) => ({
      farms: [...state.farms, farm],
    })),
  removeFarm: (index) =>
    set((state) => ({
      farms: state.farms.filter((_, i) => i !== index),
    })),
  updateFarm: (index, farmData) =>
    set((state) => ({
      farms: state.farms.map((farm, i) =>
        i === index ? { ...farm, ...farmData } : farm
      ),
    })),
  setBulkUploadData: (data) =>
    set((state) => ({
      bulkUpload: { ...state.bulkUpload, ...data },
    })),
  setSelectedOrganization: (organization) =>
    set({ selectedOrganization: organization }),
  updateUploadedFarmer: (farmerId, data) =>
    set((state) => ({
      bulkUpload: {
        ...state.bulkUpload,
        parsedFarmers: state.bulkUpload.parsedFarmers.map((farmer) =>
          farmer.id === farmerId
            ? { ...farmer, data: { ...farmer.data, ...data } }
            : farmer
        ),
      },
    })),
  updateUploadedFarm: (farmerId, farmId, data) =>
    set((state) => ({
      bulkUpload: {
        ...state.bulkUpload,
        parsedFarmers: state.bulkUpload.parsedFarmers.map((farmer) =>
          farmer.id === farmerId
            ? {
                ...farmer,
                farms: farmer.farms.map((farm) =>
                  farm.id === farmId ? { ...farm, ...data } : farm
                ),
              }
            : farmer
        ),
      },
    })),
  deleteUploadedFarmer: (farmerId) =>
    set((state) => ({
      bulkUpload: {
        ...state.bulkUpload,
        parsedFarmers: state.bulkUpload.parsedFarmers.filter(
          (farmer) => farmer.id !== farmerId
        ),
      },
    })),
  deleteUploadedFarm: (farmerId, farmId) =>
    set((state) => ({
      bulkUpload: {
        ...state.bulkUpload,
        parsedFarmers: state.bulkUpload.parsedFarmers.map((farmer) =>
          farmer.id === farmerId
            ? {
                ...farmer,
                farms: farmer.farms.filter((farm) => farm.id !== farmId),
              }
            : farmer
        ),
      },
    })),
  validateUploadedFarmers: () =>
    set((state) => {
      const validateFarmer = (
        data: UploadedFarmer["data"]
      ): ValidationError[] => {
        const errors: ValidationError[] = [];

        if (!data.firstName?.trim()) {
          errors.push({
            field: "firstName",
            message: "First name is required",
          });
        }
        if (!data.lastName?.trim()) {
          errors.push({ field: "lastName", message: "Last name is required" });
        }
        if (!data.phone?.trim()) {
          errors.push({ field: "phone", message: "Phone number is required" });
        } else if (!/^\+233\d{9}$/.test(data.phone)) {
          errors.push({
            field: "phone",
            message: "Invalid phone format. Use +233XXXXXXXXX",
          });
        }
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.push({ field: "email", message: "Invalid email format" });
        }
        if (data.dateOfBirth?.trim()) {
          // Validate date format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(data.dateOfBirth)) {
            const parsedDate = new Date(data.dateOfBirth);
            if (Number.isNaN(parsedDate.getTime())) {
              errors.push({ field: "dateOfBirth", message: "Invalid date" });
            }
          } else {
            errors.push({
              field: "dateOfBirth",
              message: "Date must be in YYYY-MM-DD format",
            });
          }
        } else {
          errors.push({
            field: "dateOfBirth",
            message: "Date of birth is required",
          });
        }
        if (!data.community?.trim()) {
          errors.push({ field: "community", message: "Community is required" });
        }
        if (!data.address?.trim() || data.address.length < 5) {
          errors.push({
            field: "address",
            message: "Address must be at least 5 characters",
          });
        }
        if (!data.districtName?.trim()) {
          errors.push({
            field: "districtName",
            message: "District name is required",
          });
        }
        if (!data.idNumber?.trim() || data.idNumber.length < 5) {
          errors.push({
            field: "idNumber",
            message: "ID number must be at least 5 characters",
          });
        }
        if (
          !(
            data.idType &&
            ["ghana_card", "voters_id", "passport", "drivers_license"].includes(
              data.idType
            )
          )
        ) {
          errors.push({ field: "idType", message: "Invalid ID type" });
        }
        if (
          !(data.gender && ["male", "female", "other"].includes(data.gender))
        ) {
          errors.push({ field: "gender", message: "Invalid gender" });
        }
        if (data.householdSize !== null && data.householdSize <= 0) {
          errors.push({
            field: "householdSize",
            message: "Household size must be greater than 0",
          });
        }

        return errors;
      };

      const validateFarm = (
        farm: UploadedFarmer["farms"][0]
      ): ValidationError[] => {
        const errors: ValidationError[] = [];

        if (!farm.name?.trim()) {
          errors.push({ field: "name", message: "Farm name is required" });
        }
        if (
          farm.acreage !== null &&
          farm.acreage !== undefined &&
          farm.acreage <= 0
        ) {
          errors.push({
            field: "acreage",
            message: "Acreage must be greater than 0",
          });
        }
        if (
          farm.soilType &&
          !["sandy", "clay", "loamy", "silt", "rocky"].includes(farm.soilType)
        ) {
          errors.push({ field: "soilType", message: "Invalid soil type" });
        }
        if (
          farm.locationLat !== undefined &&
          (farm.locationLat < -90 || farm.locationLat > 90)
        ) {
          errors.push({
            field: "locationLat",
            message: "Latitude must be between -90 and 90",
          });
        }
        if (
          farm.locationLng !== undefined &&
          (farm.locationLng < -180 || farm.locationLng > 180)
        ) {
          errors.push({
            field: "locationLng",
            message: "Longitude must be between -180 and 180",
          });
        }

        return errors;
      };

      const updatedFarmers = state.bulkUpload.parsedFarmers.map((farmer) => {
        const farmerErrors = validateFarmer(farmer.data);
        const validatedFarms = farmer.farms.map((farm) => {
          const farmErrors = validateFarm(farm);
          return {
            ...farm,
            errors: farmErrors,
            isValid: farmErrors.length === 0,
          };
        });

        return {
          ...farmer,
          errors: farmerErrors,
          isValid:
            farmerErrors.length === 0 && validatedFarms.every((f) => f.isValid),
          farms: validatedFarms,
        };
      });

      return {
        bulkUpload: {
          ...state.bulkUpload,
          parsedFarmers: updatedFarmers,
        },
      };
    }),
  reset: () =>
    set({
      step: 1,
      mode: null,
      farmer: { ...initialFarmerState },
      farms: [],
      bulkUpload: { ...initialBulkUploadState },
      selectedOrganization: null,
    }),
}));

export const farmerWizardTotalSteps = TOTAL_STEPS;

export type { UploadedFarmer, ValidationError, OrganizationOption };
