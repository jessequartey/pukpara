"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "../../schema";
import { useSignUpStore } from "../../store/sign-up-store";

const signUpStepTwoSchema = signUpSchema.pick({
  phoneNumber: true,
  districtId: true,
  address: true,
});

type SignUpStepTwoSchema = z.infer<typeof signUpStepTwoSchema>;

export default function SignUpStepTwoForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
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
    form.reset(defaultValues);
  }, [defaultValues, form]);

  useEffect(() => {
    if (!(firstName && lastName && email && password && confirmPassword)) {
      router.replace("/sign-up");
    }
  }, [confirmPassword, email, firstName, lastName, password, router]);

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
      setFormError(error.message ?? "Unable to create your account right now.");
      return;
    }

    toast.success("Signup received. We'll review your account shortly.");
    resetStore();
    form.reset({ address: "", districtId: "", phoneNumber: "" });
    router.replace("/sign-in?msg=pending");
  };

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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Input placeholder="District ID" {...field} />
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
