"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { ORGANIZATION_TYPE } from "@/config/constants/auth";
import { useOrganizationCreateStore } from "@/features/admin/organizations/store/organization-create-store";
import { toSlug } from "@/lib/utils";
import { api } from "@/trpc/react";

const organizationTypes = Object.values(ORGANIZATION_TYPE);
const ORGANIZATION_SUBTYPE_MAX_LENGTH = 60;
const ADDRESS_MAX_LENGTH = 200;
const NOTES_MAX_LENGTH = 280;

const organizationDetailsSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Use lowercase letters, numbers, and dashes only",
    }),
  organizationType: z.enum(organizationTypes),
  organizationSubType: z
    .string()
    .trim()
    .max(ORGANIZATION_SUBTYPE_MAX_LENGTH)
    .optional()
    .transform((value) => value ?? ""),
  address: z
    .string()
    .trim()
    .max(ADDRESS_MAX_LENGTH)
    .optional()
    .transform((value) => value ?? ""),
  districtId: z.string().trim().min(1, "Select a district"),
  notes: z
    .string()
    .trim()
    .max(NOTES_MAX_LENGTH)
    .optional()
    .transform((value) => value ?? ""),
});

type OrganizationDetailsSchema = z.infer<typeof organizationDetailsSchema>;

type OrganizationDetailsStepProps = {
  onBack: () => void;
  onNext: () => void;
};

type RegionOption = {
  name: string;
  code: string;
  districts: { id: string; name: string }[];
};

type DistrictIndexEntry = {
  id: string;
  name: string;
  regionName: string;
  regionCode: string;
};

export const OrganizationDetailsStep = ({
  onBack,
  onNext,
}: OrganizationDetailsStepProps) => {
  const organizationData = useOrganizationCreateStore(
    (state) => state.organization
  );
  const setOrganizationData = useOrganizationCreateStore(
    (state) => state.setOrganizationData
  );

  const {
    data: districtData,
    isLoading: districtsLoading,
    isError: districtsError,
  } = api.districts.list.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const regions = useMemo<RegionOption[]>(
    () => districtData?.regions ?? [],
    [districtData]
  );

  const districtIndex = useMemo(() => {
    const map = new Map<string, DistrictIndexEntry>();

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
        return [] as DistrictIndexEntry[];
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

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    () => organizationData.slug.length > 0
  );

  const defaultValues: OrganizationDetailsSchema = {
    name: organizationData.name,
    slug:
      organizationData.slug ||
      (organizationData.name ? toSlug(organizationData.name) : ""),
    organizationType: organizationData.organizationType,
    organizationSubType: organizationData.organizationSubType,
    address: organizationData.address,
    districtId: organizationData.districtId,
    notes: organizationData.notes,
  };

  const form = useForm<OrganizationDetailsSchema>({
    resolver: zodResolver(organizationDetailsSchema),
    defaultValues,
    mode: "onBlur",
  });

  const nameValue = form.watch("name");

  useEffect(() => {
    if (slugManuallyEdited) {
      return;
    }
    const generated = toSlug(nameValue ?? "");
    form.setValue("slug", generated, { shouldDirty: true });
  }, [form, nameValue, slugManuallyEdited]);

  const handleSubmit = (data: OrganizationDetailsSchema) => {
    const selectedDistrict = districtIndex.get(data.districtId);
    setOrganizationData({
      name: data.name,
      slug: data.slug,
      organizationType: data.organizationType,
      organizationSubType: data.organizationSubType,
      address: data.address,
      districtId: data.districtId,
      districtName: selectedDistrict?.name ?? organizationData.districtName,
      regionId: selectedDistrict?.regionCode ?? organizationData.regionId,
      regionName: selectedDistrict?.regionName ?? organizationData.regionName,
      notes: data.notes,
    });
    onNext();
  };

  const handleBack = () => {
    const values = form.getValues();
    const selectedDistrict = values.districtId
      ? districtIndex.get(values.districtId)
      : null;

    setOrganizationData({
      name: values.name,
      slug: values.slug,
      organizationType: values.organizationType,
      organizationSubType: values.organizationSubType,
      address: values.address,
      districtId: values.districtId,
      districtName: selectedDistrict?.name ?? organizationData.districtName,
      regionId: selectedDistrict?.regionCode ?? organizationData.regionId,
      regionName: selectedDistrict?.regionName ?? organizationData.regionName,
      notes: values.notes,
    });
    onBack();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization details</CardTitle>
        <CardDescription>
          Configure how the workspace should appear across dashboards and
          communications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-5"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Cooperative" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="acme-cooperative"
                        {...field}
                        onChange={(event) => {
                          setSlugManuallyEdited(true);
                          field.onChange(event);
                        }}
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
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization type</FormLabel>
                    <FormControl>
                      <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                        {...field}
                      >
                        {organizationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.replace(/_/g, " ").toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizationSubType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-type (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VSLA, FBO, Cooperative..."
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Market Street, Kumasi" {...field} />
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
                    <AsyncSelect<DistrictIndexEntry>
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
                        const option = nextValue
                          ? districtIndex.get(nextValue)
                          : undefined;
                        setOrganizationData({
                          districtId: nextValue,
                          districtName:
                            option?.name ?? organizationData.districtName,
                          regionId:
                            option?.regionCode ?? organizationData.regionId,
                          regionName:
                            option?.regionName ?? organizationData.regionName,
                        });
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share launch context, compliance notes, or account handover details"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {districtsError ? (
              <p className="text-destructive text-sm">
                Unable to load districts right now. Try again later.
              </p>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
              <Button onClick={handleBack} type="button" variant="ghost">
                Back
              </Button>
              <Button size="lg" type="submit">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-muted-foreground text-xs">
        You can adjust billing and limits later from the organization settings
        panel.
      </CardFooter>
    </Card>
  );
};
