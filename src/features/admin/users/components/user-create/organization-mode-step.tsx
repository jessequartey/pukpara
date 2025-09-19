"use client";

import { Building2, Plus } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserCreateStore } from "@/features/admin/users/store/user-create-store";
import { cn } from "@/lib/utils";

const organizationOptions = [
  {
    value: "existing-organization" as const,
    title: "Add to existing organization",
    description:
      "Add the new user to an existing organization where they can participate in activities and access resources.",
    icon: Building2,
    highlights: [
      "User joins existing workspace and team members",
      "Inherits organization settings and permissions",
    ],
  },
  {
    value: "new-organization" as const,
    title: "Create new organization",
    description:
      "Create a completely new organization for this user. They will become the owner and can invite others later.",
    icon: Plus,
    highlights: [
      "User becomes organization owner with full admin access",
      "New workspace with customizable settings and branding",
    ],
  },
];

const optionBorderClass = "border-primary bg-primary/5" as const;

type OrganizationModeStepProps = {
  onNext: () => void;
};

export const OrganizationModeStep = ({ onNext }: OrganizationModeStepProps) => {
  const selectedMode = useUserCreateStore((state) => state.mode);
  const setMode = useUserCreateStore((state) => state.setMode);

  const currentOption = useMemo(
    () => organizationOptions.find((option) => option.value === selectedMode),
    [selectedMode]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMode) {
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How would you like to set up this user?</CardTitle>
        <CardDescription>
          Choose whether to add the user to an existing organization or create a
          new organization for them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <fieldset className="space-y-4">
            <legend className="text-muted-foreground text-sm">
              Organization setup
            </legend>
            <div className="grid gap-4 lg:grid-cols-2">
              {organizationOptions.map((option) => {
                const Icon = option.icon;
                const checked = option.value === currentOption?.value;
                return (
                  <label
                    className={cn(
                      "relative flex h-full cursor-pointer flex-col gap-4 rounded-lg border bg-background p-5 shadow-sm transition hover:border-primary/60 hover:bg-primary/5",
                      checked ? optionBorderClass : "border-border"
                    )}
                    key={option.value}
                  >
                    <input
                      checked={checked}
                      className="sr-only"
                      name="organization-mode"
                      onChange={() => setMode(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <div>
                        <p className="font-medium leading-tight">
                          {option.title}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      {option.highlights.map((highlight) => (
                        <li className="flex gap-2" key={highlight}>
                          <span
                            aria-hidden
                            className="mt-1 size-1.5 rounded-full bg-primary"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="flex justify-end">
            <Button disabled={!selectedMode} size="lg" type="submit">
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};