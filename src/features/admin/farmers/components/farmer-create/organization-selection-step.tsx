"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSelect } from "@/components/ui/async-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  type OrganizationOption,
  useFarmerCreateStore,
} from "@/features/admin/farmers/store/farmer-create-store";
import { api } from "@/trpc/react";

const organizationSelectionSchema = z.object({
  organizationId: z.string().min(1, "Please select an organization"),
});

type OrganizationSelectionSchema = z.infer<typeof organizationSelectionSchema>;

type OrganizationSelectionStepProps = {
  onNext: () => void;
  onBack: () => void;
};

export const OrganizationSelectionStep = ({
  onBack,
  onNext,
}: OrganizationSelectionStepProps) => {
  const selectedOrganization = useFarmerCreateStore(
    (state) => state.selectedOrganization
  );
  const setSelectedOrganization = useFarmerCreateStore(
    (state) => state.setSelectedOrganization
  );

  const form = useForm<OrganizationSelectionSchema>({
    resolver: zodResolver(organizationSelectionSchema),
    defaultValues: {
      organizationId: selectedOrganization?.id || "",
    },
  });

  // Get organizations data
  const {
    data: organizationsData,
    isLoading: organizationsLoading,
    isError: organizationsError,
  } = api.admin.farmers.getOrganizations.useQuery(undefined, {
    staleTime: 60_000, // Cache for 1 minute
  });

  const organizations = useMemo(
    () => organizationsData ?? [],
    [organizationsData]
  );

  const organizationIndex = useMemo(() => {
    const map = new Map<string, OrganizationOption>();

    for (const org of organizations) {
      map.set(org.id, {
        id: org.id,
        name: org.name,
        slug: org.slug || "",
        organizationType: org.organizationType,
        memberCount: org.memberCount || 0,
      });
    }

    return map;
  }, [organizations]);

  const organizationOptionsList = useMemo(
    () => Array.from(organizationIndex.values()),
    [organizationIndex]
  );

  const fetchOrganizationOptions = useCallback(
    (query?: string) => {
      if (organizationsLoading) {
        return Promise.resolve([] as OrganizationOption[]);
      }

      if (!query) {
        return Promise.resolve(organizationOptionsList);
      }

      const searchTerm = query.toLowerCase();
      const filtered = organizationOptionsList.filter(
        (org) =>
          org.name.toLowerCase().includes(searchTerm) ||
          org.slug.toLowerCase().includes(searchTerm)
      );

      return Promise.resolve(filtered);
    },
    [organizationOptionsList, organizationsLoading]
  );

  const handleSubmit = (data: OrganizationSelectionSchema) => {
    const organization = organizationIndex.get(data.organizationId);

    if (!organization) {
      toast.error("Selected organization not found");
      return;
    }

    setSelectedOrganization(organization);
    toast.success(`Organization "${organization.name}" selected`);
    onNext();
  };

  if (organizationsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading organizations</CardTitle>
          <CardDescription>
            There was an error loading the organizations. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select organization</CardTitle>
        <CardDescription>
          Choose the organization that all farmers in the bulk upload will be
          added to. This ensures all farmers are properly assigned to the same
          workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <AsyncSelect<OrganizationOption>
                      disabled={
                        organizationsLoading ||
                        organizationOptionsList.length === 0
                      }
                      fetcher={fetchOrganizationOptions}
                      getDisplayValue={(option) =>
                        `${option.name} (${option.memberCount || 0} members)`
                      }
                      getOptionValue={(option) => option.id}
                      label="Organization"
                      onChange={(nextValue) => {
                        field.onChange(nextValue);
                      }}
                      placeholder={
                        organizationsLoading
                          ? "Loading organizations..."
                          : "Select an organization..."
                      }
                      preload={true}
                      renderOption={(option) => (
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{option.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {option.slug} • {option.organizationType} •{" "}
                            {option.memberCount || 0} members
                          </div>
                        </div>
                      )}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedOrganization && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-semibold text-sm">
                  Selected Organization:
                </h4>
                <p className="font-medium">{selectedOrganization.name}</p>
                <p className="text-muted-foreground text-sm">
                  {selectedOrganization.slug} •{" "}
                  {selectedOrganization.organizationType} •{" "}
                  {selectedOrganization.memberCount || 0} members
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
              <Button onClick={onBack} type="button" variant="ghost">
                Back
              </Button>
              <Button
                disabled={
                  organizationsLoading || organizationOptionsList.length === 0
                }
                type="submit"
              >
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
