"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { authClient } from "@/lib/auth-client";

const PASSWORD_LENGTH = 4;

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, {
        message: "New password is required.",
      })
      .min(PASSWORD_LENGTH, {
        message: "Password must be at least 4 characters.",
      }),
    confirmPassword: z.string().min(1, {
      message: "Please confirm your password.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (values: FormValues) => {
    if (!token) {
      setFormError("Reset link is invalid or expired.");
      return;
    }

    setFormError(null);

    const { error } = await authClient.resetPassword({
      newPassword: values.newPassword,
      token,
    });

    if (error) {
      setFormError(error.message ?? "Unable to reset your password.");
      return;
    }

    toast.success("Password updated. Please sign in with your new password.");
    router.replace("/sign-in?msg=reset");
  };

  return (
    <Card className="border-0 bg-background shadow-none">
      <CardHeader className="text-center lg:text-left">
        <CardTitle className="text-lg">Reset password</CardTitle>
        <CardDescription>
          You're almost done! Choose a strong password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="new-password"
                      placeholder="********"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="new-password"
                      placeholder="********"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError ? (
              <Alert className="text-sm" variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <Button
              className="w-full"
              disabled={form.formState.isSubmitting || !token}
              size="lg"
              type="submit"
            >
              {form.formState.isSubmitting
                ? "Updating password..."
                : "Continue"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link className="text-sm hover:underline" href="/sign-in">
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
