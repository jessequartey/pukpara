"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrganizationCreateStore } from "@/features/admin/organizations/store/organization-create-store";
import { listUsers } from "@/lib/auth-admin-client";
import { cn } from "@/lib/utils";

const searchSchema = z.string().trim().min(2).or(z.literal(""));
const SEARCH_DEBOUNCE_MS = 350;

type UserWithRole = {
  id: string;
  email: string | null;
  name: string | null;
  role?: string;
};

type ExistingUserStepProps = {
  onBack: () => void;
  onNext: () => void;
};

type OrganizationState = ReturnType<
  typeof useOrganizationCreateStore.getState
>["organization"];

export const ExistingUserStep = ({ onBack, onNext }: ExistingUserStepProps) => {
  const selectedUser = useOrganizationCreateStore(
    (state) => state.existingUser
  );
  const setExistingUser = useOrganizationCreateStore(
    (state) => state.setExistingUser
  );
  const setOrganizationData = useOrganizationCreateStore(
    (state) => state.setOrganizationData
  );
  const organization = useOrganizationCreateStore(
    (state) => state.organization
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const parsed = searchSchema.safeParse(searchTerm);
      if (parsed.success) {
        setDebouncedSearch(parsed.data);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(handle);
    };
  }, [searchTerm]);

  const query = useQuery({
    queryKey: ["admin-users", debouncedSearch],
    queryFn: async () => {
      const result = await listUsers({
        query: {
          limit: 15,
          searchField: "email",
          searchOperator: "contains",
          searchValue: debouncedSearch || undefined,
        },
      });

      return (result as any).users || [];
    },
  });

  const users = useMemo(() => query.data ?? [], [query.data]);

  const handleBack = () => {
    onBack();
  };

  const handleNext = () => {
    if (!selectedUser) {
      return;
    }

    const updates: Partial<OrganizationState> = {};

    if (!organization.contactEmail && selectedUser.email) {
      updates.contactEmail = selectedUser.email;
    }
    if (!organization.billingEmail && selectedUser.email) {
      updates.billingEmail = selectedUser.email;
    }

    if (Object.keys(updates).length > 0) {
      setOrganizationData(updates);
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose the organization owner</CardTitle>
        <CardDescription>
          Select an existing platform user. They will become the owner and
          receive access to the new workspace immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-search">Search by email</Label>
          <div className="relative">
            <Search
              aria-hidden
              className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground"
            />
            <Input
              autoComplete="email"
              id="user-search"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Start typing an email address"
              value={searchTerm}
            />
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-medium">Matching users</h3>
          <div className="rounded-lg border">
            <ScrollArea className="max-h-[320px]">
              {(() => {
                if (query.isLoading) {
                  return (
                    <div className="flex items-center justify-center gap-2 p-6 text-muted-foreground text-sm">
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                      Searching directory...
                    </div>
                  );
                }

                if (users.length === 0) {
                  return (
                    <div className="p-6 text-muted-foreground text-sm">
                      No users found. Try broadening your search.
                    </div>
                  );
                }

                return (
                  <ul className="divide-y">
                    {users.map((user: UserWithRole) => {
                      const isSelected = user.id === selectedUser?.userId;
                      return (
                        <li key={user.id}>
                          <button
                            className={cn(
                              "flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition hover:bg-muted",
                              isSelected ? "bg-primary/5" : "bg-background"
                            )}
                            onClick={() =>
                              setExistingUser({
                                email: user.email ?? "",
                                name: user.name ?? "Unnamed user",
                                userId: user.id,
                              })
                            }
                            type="button"
                          >
                            <span className="font-medium leading-tight">
                              {user.name ?? "Unnamed user"}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {user.email}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 md:flex-row md:justify-between">
        <Button onClick={handleBack} type="button" variant="ghost">
          Back
        </Button>
        <Button
          disabled={!selectedUser || query.isFetching}
          onClick={handleNext}
          size="lg"
          type="button"
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};
