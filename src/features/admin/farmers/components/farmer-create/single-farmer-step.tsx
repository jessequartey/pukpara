"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSelect } from "@/components/ui/async-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFarmerCreateStore } from "@/features/admin/farmers/store/farmer-create-store";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const PHONE_MIN_LENGTH = 6;
const ADDRESS_MIN_LENGTH = 5;
const ID_NUMBER_MIN_LENGTH = 5;

const farmerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(PHONE_MIN_LENGTH, "Phone number is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    message: "Select a gender",
  }),
  community: z.string().min(1, "Community is required"),
  address: z.string().min(ADDRESS_MIN_LENGTH, "Address is required"),
  districtId: z.string().min(1, "Select a district"),
  idType: z.enum(["national_id", "passport", "drivers_license", "voter_id"], {
    message: "Select an ID type",
  }),
  idNumber: z.string().min(ID_NUMBER_MIN_LENGTH, "ID number is required"),
  isLeader: z.boolean().default(false),
  isPhoneSmart: z.boolean().default(false),
  legacyFarmerId: z.string().optional(),
});

type FarmerSchema = z.infer<typeof farmerSchema>;

type DistrictOption = {
  id: string;
  name: string;
  regionName: string;
  regionCode: string;
};

const idTypeOptions = [
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "voter_id", label: "Voter ID" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

type SingleFarmerStepProps = {
  onNext: (data: FarmerSchema) => void;
  onBack: () => void;
};

export const SingleFarmerStep = ({ onBack, onNext }: SingleFarmerStepProps) => {
  const setFarmerData = useFarmerCreateStore((state) => state.setFarmerData);
  const storedFarmer = useFarmerCreateStore((state) => state.farmer);

  const {
    data: districtData,
    isLoading: districtsLoading,
    isError: districtsError,
  } = api.districts.list.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const regions = useMemo(() => districtData?.regions ?? [], [districtData]);

  const districtIndex = useMemo(() => {
    const map = new Map<string, DistrictOption>();

    for (const regionEntry of regions) {
      for (const districtEntry of regionEntry.districts) {
        map.set(districtEntry.id, {
          id: districtEntry.id,
          name: districtEntry.name,
          regionName: regionEntry.name,
          regionCode: regionEntry.code,
        });
      }
    }

    return map;
  }, [regions]);

  const districtOptionsList = useMemo(
    () => Array.from(districtIndex.values()),
    [districtIndex]
  );

  const fetchDistrictOptions = useCallback(
    (query?: string) => {
      if (districtsLoading) {
        return Promise.resolve([] as DistrictOption[]);
      }

      if (!query) {
        return Promise.resolve(districtOptionsList);
      }

      const normalized = query.trim().toLowerCase();
      return Promise.resolve(
        districtOptionsList.filter((option) =>
          `${option.name} ${option.regionName}`
            .toLowerCase()
            .includes(normalized)
        )
      );
    },
    [districtOptionsList, districtsLoading]
  );

  const form = useForm<FarmerSchema>({
    resolver: zodResolver(farmerSchema) as any,
    defaultValues: {
      firstName: storedFarmer.firstName,
      lastName: storedFarmer.lastName,
      phone: storedFarmer.phone,
      email: storedFarmer.email,
      dateOfBirth: storedFarmer.dateOfBirth,
      gender: storedFarmer.gender,
      community: storedFarmer.community,
      address: storedFarmer.address,
      districtId: storedFarmer.districtId,
      idType: storedFarmer.idType as any,
      idNumber: storedFarmer.idNumber,
      isLeader: storedFarmer.isLeader,
      isPhoneSmart: storedFarmer.isPhoneSmart,
      legacyFarmerId: storedFarmer.legacyFarmerId,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset({
      firstName: storedFarmer.firstName,
      lastName: storedFarmer.lastName,
      phone: storedFarmer.phone,
      email: storedFarmer.email,
      dateOfBirth: storedFarmer.dateOfBirth,
      gender: storedFarmer.gender,
      community: storedFarmer.community,
      address: storedFarmer.address,
      districtId: storedFarmer.districtId,
      idType: storedFarmer.idType as any,
      idNumber: storedFarmer.idNumber,
      isLeader: storedFarmer.isLeader,
      isPhoneSmart: storedFarmer.isPhoneSmart,
      legacyFarmerId: storedFarmer.legacyFarmerId,
    });
  }, [form, storedFarmer]);

  const handleSubmit = (data: FarmerSchema) => {
    const selectedDistrict = districtIndex.get(data.districtId);

    if (!selectedDistrict) {
      toast.error("Select a valid district before continuing");
      return;
    }

    const farmerData = {
      ...data,
      regionId: selectedDistrict.regionCode,
      email: data.email || "",
    };

    setFarmerData(farmerData);
    onNext(farmerData);
  };

  const handleBack = () => {
    const values = form.getValues();
    setFarmerData({
      ...values,
      email: values.email || "",
    });
    onBack();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farmer details</CardTitle>
        <CardDescription>
          Enter the complete profile information for the new farmer. All fields
          marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Personal Information</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name *</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="given-name"
                          placeholder="Kwame"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name *</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="family-name"
                          placeholder="Asante"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of birth *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              variant="outline"
                            >
                              {field.value ? (
                                new Date(field.value).toLocaleDateString()
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            mode="single"
                            onSelect={(date) =>
                              field.onChange(date?.toISOString().split("T")[0])
                            }
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Contact Information</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number *</FormLabel>
                      <FormControl>
                        <PhoneInput
                          defaultCountry="GH"
                          placeholder="024 123 4567"
                          {...field}
                          onChange={(value) => field.onChange(value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="email"
                          inputMode="email"
                          placeholder="farmer@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Location Information</h4>
              <FormField
                control={form.control}
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District *</FormLabel>
                    <FormControl>
                      <AsyncSelect<DistrictOption>
                        disabled={
                          districtsLoading || districtOptionsList.length === 0
                        }
                        fetcher={fetchDistrictOptions}
                        getDisplayValue={(option) =>
                          `${option.name} • ${option.regionName}`
                        }
                        getOptionValue={(option) => option.id}
                        label="District"
                        onChange={field.onChange}
                        placeholder={
                          districtsLoading
                            ? "Loading districts…"
                            : "Search district"
                        }
                        renderOption={(option) => (
                          <div className="flex flex-col">
                            <span className="font-medium">{option.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {option.regionName}
                            </span>
                          </div>
                        )}
                        triggerClassName="w-full justify-between"
                        value={field.value}
                        width="var(--radix-popover-trigger-width)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="community"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community *</FormLabel>
                      <FormControl>
                        <Input placeholder="Akim Oda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="street-address"
                          placeholder="House 12, Market Street"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Identification */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Identification</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="idType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {idTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID number *</FormLabel>
                      <FormControl>
                        <Input placeholder="GHA-123456789-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Additional Information</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isLeader"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Community leader</FormLabel>
                        <FormDescription>
                          Mark this farmer as a community or group leader
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPhoneSmart"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Has smartphone</FormLabel>
                        <FormDescription>
                          Indicate if the farmer has access to a smartphone
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legacyFarmerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legacy farmer ID (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Previous system ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        Reference ID from previous farmer management system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {districtsError ? (
              <p className="text-destructive text-sm">
                Unable to load districts right now. Try refreshing the page.
              </p>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
              <Button onClick={handleBack} type="button" variant="ghost">
                Back
              </Button>
              <Button
                disabled={form.formState.isSubmitting}
                size="lg"
                type="submit"
              >
                Create Farmer
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-muted-foreground text-xs">
        The farmer profile can be updated later with additional information like
        farm details and crop preferences.
      </CardFooter>
    </Card>
  );
};
