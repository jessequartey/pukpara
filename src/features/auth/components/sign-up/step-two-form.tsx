"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { signUpSchema } from "../../schema";
import { useSignUpStore } from "../../store/sign-up-store";

const signUpStepTwoSchema = signUpSchema.pick({
  phoneNumber: true,
  districtId: true,
  address: true,
});

type SignUpStepTwoSchema = z.infer<typeof signUpStepTwoSchema>;

type DistrictOption = {
  id: string;
  name: string;
  code: string | null;
  regionName: string;
  regionCode: string;
};

const DEFAULT_SIGN_UP_ERROR_MESSAGE =
  "Unable to create your account right now." as const;
const UNIQUE_VIOLATION_CODE = "23505" as const;
const PHONE_NUMBER_UNIQUE_CONSTRAINT = "user_phone_number_unique" as const;

type DatabaseConstraintError = {
  code?: string;
  constraint?: string;
  detail?: string;
};

const isDatabaseConstraintError = (
  cause: unknown
): cause is DatabaseConstraintError => {
  if (typeof cause !== "object" || cause === null) {
    return false;
  }

  const possible = cause as Record<string, unknown>;

  return (
    typeof possible.constraint === "string" ||
    typeof possible.code === "string" ||
    typeof possible.detail === "string"
  );
};

const getSignUpErrorMessage = (rawError: unknown): string => {
  if (!rawError || typeof rawError !== "object") {
    return DEFAULT_SIGN_UP_ERROR_MESSAGE;
  }

  const maybeError = rawError as {
    cause?: unknown;
    message?: unknown;
  };

  if (isDatabaseConstraintError(maybeError.cause)) {
    const { code, constraint, detail } = maybeError.cause;
    const detailMentionsPhone =
      typeof detail === "string" && detail.includes("(phone_number)");

    if (
      constraint === PHONE_NUMBER_UNIQUE_CONSTRAINT ||
      (code === UNIQUE_VIOLATION_CODE && detailMentionsPhone)
    ) {
      return "An account with this phone number already exists. Try signing in or use a different number.";
    }
  }

  if (typeof maybeError.message !== "string" || !maybeError.message.trim()) {
    return DEFAULT_SIGN_UP_ERROR_MESSAGE;
  }

  if (maybeError.message === "Failed to create user") {
    return DEFAULT_SIGN_UP_ERROR_MESSAGE;
  }

  return maybeError.message;
};

export default function SignUpStepTwoForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [districtPopoverOpen, setDistrictPopoverOpen] = useState(false);
  const resetStore = useSignUpStore((state) => state.reset);
  const setData = useSignUpStore((state) => state.setData);
  const firstName = useSignUpStore((state) => state.firstName ?? "");
  const lastName = useSignUpStore((state) => state.lastName ?? "");
  const email = useSignUpStore((state) => state.email ?? "");
  const password = useSignUpStore((state) => state.password ?? "");
  const confirmPassword = useSignUpStore(
    (state) => state.confirmPassword ?? ""
  );
  const storedPhoneNumber = useSignUpStore((state) => state.phoneNumber ?? "");
  const storedDistrictId = useSignUpStore((state) => state.districtId ?? "");
  const storedAddress = useSignUpStore((state) => state.address ?? "");
  const hasHydrated = useSignUpStore((state) => state.hasHydrated);

  const {
    data: districtData,
    isLoading: districtsLoading,
    isError: districtsError,
    error: districtsErrorResult,
  } = api.districts.list.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const districtOptions = districtData?.regions ?? [];

  const districtIndex = useMemo(() => {
    const map = new Map<string, DistrictOption>();

    for (const regionEntry of districtOptions) {
      for (const districtEntry of regionEntry.districts) {
        map.set(districtEntry.id, {
          id: districtEntry.id,
          name: districtEntry.name,
          code: districtEntry.code,
          regionName: regionEntry.name,
          regionCode: regionEntry.code,
        });
      }
    }

    return map;
  }, [districtOptions]);

  const defaultValues = useMemo(
    () => ({
      phoneNumber: storedPhoneNumber,
      districtId: storedDistrictId,
      address: storedAddress,
    }),
    [storedPhoneNumber, storedDistrictId, storedAddress]
  );

  const form = useForm<SignUpStepTwoSchema>({
    resolver: zodResolver(signUpStepTwoSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    form.reset(defaultValues);
  }, [defaultValues, form, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!(firstName && lastName && email && password && confirmPassword)) {
      router.replace("/sign-up");
    }
  }, [
    confirmPassword,
    email,
    firstName,
    hasHydrated,
    lastName,
    password,
    router,
  ]);

  const onSubmit = async (data: SignUpStepTwoSchema) => {
    setFormError(null);
    setData(data);

    const fullName = `${firstName} ${lastName}`.trim().replace(/\s+/g, " ");

    const { error } = await authClient.signUp.email({
      name: fullName,
      email,
      password,
      phoneNumber: data.phoneNumber,
      districtId: data.districtId,
      address: data.address,
    });

    if (error) {
      setFormError(getSignUpErrorMessage(error));
      return;
    }

    toast.success("Signup received. We'll review your account shortly.");
    resetStore();
    form.reset({ address: "", districtId: "", phoneNumber: "" });
    router.replace("/sign-in?msg=pending");
  };

  const districtErrorMessage = districtsError
    ? (districtsErrorResult?.message ?? "Unable to load districts.")
    : null;

  return (
    <Card className="border-0 bg-background shadow-none">
      <CardHeader className="flex flex-col items-center justify-center lg:items-start">
        <Badge className="bg-primary/5 text-primary">Step 2 of 2</Badge>
        <CardTitle className="text-lg">Complete your profile</CardTitle>
        <CardDescription>
          Help us connect with you and customize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      defaultCountry="GH"
                      placeholder="012 345 6789"
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
              render={({ field }) => {
                const selectedDistrict = field.value
                  ? districtIndex.get(field.value)
                  : undefined;
                const renderDistrictButtonLabel = () => {
                  if (selectedDistrict) {
                    return `${selectedDistrict.name} • ${selectedDistrict.regionName}`;
                  }

                  if (districtsLoading) {
                    return (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Loading districts...
                      </span>
                    );
                  }

                  return "Select district";
                };

                return (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Popover
                        onOpenChange={setDistrictPopoverOpen}
                        open={districtPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            aria-expanded={districtPopoverOpen}
                            className="w-full justify-between"
                            disabled={districtsLoading || !hasHydrated}
                            role="combobox"
                            size="lg"
                            type="button"
                            variant="outline"
                          >
                            {renderDistrictButtonLabel()}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search district..." />
                            <CommandList>
                              <CommandEmpty>No district found.</CommandEmpty>
                              {districtOptions.map((regionOption) => (
                                <CommandGroup
                                  heading={regionOption.name}
                                  key={regionOption.code}
                                >
                                  {regionOption.districts.map(
                                    (districtOption) => (
                                      <CommandItem
                                        key={districtOption.id}
                                        onSelect={() => {
                                          field.onChange(districtOption.id);
                                          setData({
                                            districtId: districtOption.id,
                                          });
                                          setDistrictPopoverOpen(false);
                                        }}
                                        value={`${regionOption.name} ${districtOption.name}`}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            districtOption.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {districtOption.name}
                                      </CommandItem>
                                    )
                                  )}
                                </CommandGroup>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
                      placeholder="123 Main St"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-secondary px-5 py-4 text-center text-muted-foreground text-xs leading-tight">
              <p>
                By continuing, you agree to the{" "}
                <Link className="underline" href="/">
                  Terms of Service
                </Link>{" "}
                and the{" "}
                <Link className="underline" href="/">
                  Privacy Policy
                </Link>{" "}
                of the platform.
              </p>
            </div>

            {formError ? (
              <Alert className="text-sm" variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            {districtErrorMessage ? (
              <Alert className="text-sm" variant="destructive">
                <AlertDescription>{districtErrorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              className="w-full"
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
            >
              {form.formState.isSubmitting
                ? "Creating account..."
                : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="-mt-2 flex justify-center text-center">
        <Link
          className={buttonVariants({
            variant: "ghost",
            className:
              "w-full hover:border-1 hover:bg-background hover:text-foreground",
          })}
          href="/sign-up"
        >
          <ArrowLeft />
          Go back
        </Link>
      </CardFooter>
    </Card>
  );
}
