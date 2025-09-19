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
import { useUserCreateStore } from "@/features/admin/users/store/user-create-store";
import { api } from "@/trpc/react";

const existingOrganizationSchema = z.object({
  organizationId: z.string().min(1, "Select an organization"),
});

type ExistingOrganizationSchema = z.infer<typeof existingOrganizationSchema>;

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
  organizationType: string;
  memberCount?: number;
};

type ExistingOrganizationStepProps = {
  onNext: () => void;
  onBack: () => void;
};

export const ExistingOrganizationStep = ({
  onBack,
  onNext,
}: ExistingOrganizationStepProps) => {
  const setExistingOrganization = useUserCreateStore(
    (state) => state.setExistingOrganization
  );
  const storedOrganization = useUserCreateStore(
    (state) => state.existingOrganization
  );

  const {
    data: organizationsData,
    isLoading: organizationsLoading,
    isError: organizationsError,
  } = api.organizations.list.useQuery(
    {
      page: 1,
      pageSize: 1000, // Get all organizations for selection
    },
    {
      staleTime: 60000, // Cache for 1 minute
    }
  );

  const organizations = useMemo(
    () => organizationsData?.organizations ?? [],
    [organizationsData]
  );

  const organizationIndex = useMemo(() => {
    const map = new Map<string, OrganizationOption>();

    for (const org of organizations) {
      map.set(org.id, {
        id: org.id,
        name: org.name,
        slug: org.slug,
        organizationType: org.organizationType,
        memberCount: org._count?.members,
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

      const normalized = query.trim().toLowerCase();
      return Promise.resolve(
        organizationOptionsList.filter(
          (option) =>
            option.name.toLowerCase().includes(normalized) ||
            option.slug.toLowerCase().includes(normalized)
        )
      );
    },
    [organizationOptionsList, organizationsLoading]
  );

  const form = useForm<ExistingOrganizationSchema>({
    resolver: zodResolver(existingOrganizationSchema),
    defaultValues: {
      organizationId: storedOrganization?.organizationId ?? "",
    },
    mode: "onBlur",
  });

  const handleSubmit = (data: ExistingOrganizationSchema) => {
    const selectedOrganization = organizationIndex.get(data.organizationId);

    if (!selectedOrganization) {
      toast.error("Select a valid organization before continuing");
      return;
    }

    setExistingOrganization({
      organizationId: selectedOrganization.id,
      name: selectedOrganization.name,
      slug: selectedOrganization.slug,
    });

    onNext();
  };

  const handleBack = () => {
    const values = form.getValues();
    if (values.organizationId) {
      const selectedOrganization = organizationIndex.get(values.organizationId);
      if (selectedOrganization) {
        setExistingOrganization({
          organizationId: selectedOrganization.id,
          name: selectedOrganization.name,
          slug: selectedOrganization.slug,
        });
      }
    }
    onBack();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select organization</CardTitle>
        <CardDescription>
          Choose an existing organization to add the new user to. They will join
          this workspace and can collaborate with existing members.
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
                        `${option.name} (${option.slug})`
                      }
                      getOptionValue={(option) => option.id}
                      label="Organization"
                      onChange={(nextValue) => {
                        field.onChange(nextValue);
                        if (!nextValue) {
                          setExistingOrganization(null);
                          return;
                        }

                        const option = organizationIndex.get(nextValue);
                        if (option) {
                          setExistingOrganization({
                            organizationId: option.id,
                            name: option.name,
                            slug: option.slug,
                          });
                        }
                      }}
                      placeholder={
                        organizationsLoading
                          ? "Loading organizations…"
                          : "Search organizations"
                      }
                      renderOption={(option) => (
                        <div className="flex flex-col">
                          <span className="font-medium">{option.name}</span>
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <span>@{option.slug}</span>
                            <span>•</span>
                            <span className="capitalize">
                              {option.organizationType.replace(/_/g, " ")}
                            </span>
                            {option.memberCount !== undefined && (
                              <>
                                <span>•</span>
                                <span>
                                  {option.memberCount} member
                                  {option.memberCount !== 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </div>
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
            {organizationsError ? (
              <p className="text-destructive text-sm">
                Unable to load organizations right now. Try refreshing the page.
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
        The user will be added as a member to the selected organization and can
        be assigned roles later.
      </CardFooter>
    </Card>
  );
};