"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordForm() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (values: FormValues) => {
    setStatusMessage(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    await authClient.requestPasswordReset({
      email: values.email,
      redirectTo,
    });

    setStatusMessage("If an account exists, we’ve sent a reset link.");
    form.reset({ email: values.email });
  };

  return (
    <Card className="border-0 bg-background shadow-none">
      <CardHeader className="text-center lg:text-left">
        <CardTitle className="text-lg">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email to get password resetting instructions
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      inputMode="email"
                      placeholder="example@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {statusMessage ? (
              <Alert className="text-sm">
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            ) : null}
            <Button
              className="w-full"
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
            >
              {form.formState.isSubmitting ? "Sending..." : "Continue"}
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
