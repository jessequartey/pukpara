"use client";

import { Upload, UserPlus } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFarmerCreateStore } from "@/features/admin/farmers/store/farmer-create-store";
import { cn } from "@/lib/utils";

const uploadOptions = [
  {
    value: "single" as const,
    title: "Create single farmer",
    description:
      "Add one farmer at a time with complete profile information. Best for detailed individual registration.",
    icon: UserPlus,
    highlights: [
      "Complete profile creation with all details",
      "Immediate validation and verification",
      "Photo upload and identity verification",
    ],
  },
  {
    value: "bulk-upload" as const,
    title: "Bulk upload farmers",
    description:
      "Upload multiple farmers at once using Excel or CSV files. Ideal for importing existing farmer databases.",
    icon: Upload,
    highlights: [
      "Support for Excel (.xlsx) and CSV files",
      "Batch processing with validation",
      "Error reporting for failed entries",
    ],
  },
];

const optionBorderClass = "border-primary bg-primary/5" as const;

type UploadModeStepProps = {
  onNext: () => void;
};

export const UploadModeStep = ({ onNext }: UploadModeStepProps) => {
  const selectedMode = useFarmerCreateStore((state) => state.mode);
  const setMode = useFarmerCreateStore((state) => state.setMode);

  const currentOption = useMemo(
    () => uploadOptions.find((option) => option.value === selectedMode),
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
        <CardTitle>How would you like to add farmers?</CardTitle>
        <CardDescription>
          Choose whether to add a single farmer with complete details or upload
          multiple farmers in bulk using a spreadsheet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <fieldset className="space-y-4">
            <legend className="text-muted-foreground text-sm">
              Upload method
            </legend>
            <div className="grid gap-4 lg:grid-cols-2">
              {uploadOptions.map((option) => {
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
                      name="upload-mode"
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
