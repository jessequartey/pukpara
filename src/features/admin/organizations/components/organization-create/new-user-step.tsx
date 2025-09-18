"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AsyncSelect } from "@/components/ui/async-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useOrganizationCreateStore } from "@/features/admin/organizations/store/organization-create-store";
import { api } from "@/trpc/react";

const PHONE_MIN_LENGTH = 6;
const ADDRESS_MIN_LENGTH = 5;

const newUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().min(PHONE_MIN_LENGTH, "Phone number is required"),
  districtId: z.string().min(1, "Select a district"),
  address: z.string().min(ADDRESS_MIN_LENGTH, "Address is required"),
});

type NewUserSchema = z.infer<typeof newUserSchema>;

type DistrictOption = {
  id: string;
  name: string;
  regionName: string;
  regionCode: string;
};

type OrganizationState = ReturnType<
  typeof useOrganizationCreateStore.getState
>["organization"];

type NewUserStepProps = {
  onNext: () => void;
  onBack: () => void;
};

export const NewUserStep = ({ onBack, onNext }: NewUserStepProps) => {
  const setNewUserData = useOrganizationCreateStore(
    (state) => state.setNewUserData
  );
  const storedUser = useOrganizationCreateStore((state) => state.newUser);
  const setOrganizationData = useOrganizationCreateStore(
    (state) => state.setOrganizationData
  );
  const organization = useOrganizationCreateStore(
    (state) => state.organization
  );

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
    async (query?: string) => {
      if (districtsLoading) {
        return [] as DistrictOption[];
      }

      if (!query) {
        return districtOptionsList;
      }

      const normalized = query.trim().toLowerCase();
      return districtOptionsList.filter((option) =>
        `${option.name} ${option.regionName}`.toLowerCase().includes(normalized)
      );
    },
    [districtOptionsList, districtsLoading]
  );

  const form = useForm<NewUserSchema>({
    resolver: zodResolver(newUserSchema),
    defaultValues: storedUser,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(storedUser);
  }, [form, storedUser]);

  const handleSubmit = (data: NewUserSchema) => {
    const selectedDistrict = districtIndex.get(data.districtId);

    if (!selectedDistrict) {
      toast.error("Select a valid district before continuing");
      return;
    }

    setNewUserData(data);

    const updates: Partial<OrganizationState> = {};

    if (!organization.contactEmail) {
      updates.contactEmail = data.email;
    }
    if (!organization.billingEmail) {
      updates.billingEmail = data.email;
    }
    if (!organization.contactPhone) {
      updates.contactPhone = data.phoneNumber;
    }
    if (!organization.address) {
      updates.address = data.address;
    }
    if (!organization.districtId) {
      updates.districtId = selectedDistrict.id;
      updates.districtName = selectedDistrict.name;
      updates.regionId = selectedDistrict.regionCode;
      updates.regionName = selectedDistrict.regionName;
    }

    if (Object.keys(updates).length > 0) {
      setOrganizationData(updates);
    }

    onNext();
  };

  const handleBack = () => {
    const values = form.getValues();
    setNewUserData(values);

    const selectedDistrict = values.districtId
      ? districtIndex.get(values.districtId)
      : null;

    const updates: Partial<OrganizationState> = {};

    if (!organization.contactEmail && values.email) {
      updates.contactEmail = values.email;
    }
    if (!organization.billingEmail && values.email) {
      updates.billingEmail = values.email;
    }
    if (!organization.contactPhone && values.phoneNumber) {
      updates.contactPhone = values.phoneNumber;
    }
    if (!organization.address && values.address) {
      updates.address = values.address;
    }
    if (!organization.districtId && selectedDistrict) {
      updates.districtId = selectedDistrict.id;
      updates.districtName = selectedDistrict.name;
      updates.regionId = selectedDistrict.regionCode;
      updates.regionName = selectedDistrict.regionName;
    }

    if (Object.keys(updates).length > 0) {
      setOrganizationData(updates);
    }

    onBack();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up the new account</CardTitle>
        <CardDescription>
          Capture owner details. They will receive an email invitation to set
          their password after the workspace is created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="given-name"
                        placeholder="Ama"
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
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="family-name"
                        placeholder="Mensah"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      inputMode="email"
                      placeholder="workspace@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
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
              name="districtId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
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
                      onChange={(nextValue) => {
                        field.onChange(nextValue);
                        setNewUserData({
                          districtId: nextValue,
                        });

                        if (!nextValue) {
                          return;
                        }

                        const option = districtIndex.get(nextValue);
                        if (!option) {
                          return;
                        }

                        const updates: Partial<OrganizationState> = {};

                        if (!organization.districtId) {
                          updates.districtId = option.id;
                          updates.districtName = option.name;
                          updates.regionId = option.regionCode;
                          updates.regionName = option.regionName;
                        }

                        if (Object.keys(updates).length > 0) {
                          setOrganizationData(updates);
                        }
                      }}
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
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="street-address"
                      placeholder="12 Market Street, Accra"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-muted-foreground text-xs">
        The owner receives an email to choose their password and activate
        access.
      </CardFooter>
    </Card>
  );
};
