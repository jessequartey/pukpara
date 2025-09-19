"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { isUserAdmin } from "@/lib/auth-utils";

const PASSWORD_LENGTH = 4;

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(PASSWORD_LENGTH, { message: "Please enter your password." }),
  keepSignedIn: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const redirectFallback = "/" as const;

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const nextParam = searchParams.get("next");
  const redirectTo = nextParam?.startsWith("/") ? nextParam : redirectFallback;
  const messageCode = searchParams.get("msg");
  const getInfoMessage = () => {
    if (messageCode === "pending") {
      return "Your account is pending approval. We'll notify you once it's reviewed.";
    }
    if (messageCode === "reset") {
      return "Password updated. You can sign in now.";
    }
    return null;
  };

  const infoMessage = getInfoMessage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: false,
    },
    mode: "onBlur",
  });

  const handleSubmit = async (values: FormValues) => {
    setFormError(null);

    const { error, data } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.keepSignedIn ?? false,
      callbackURL: redirectTo !== redirectFallback ? redirectTo : undefined,
    });

    if (error) {
      setFormError(error.message ?? "Unable to sign in. Please try again.");
      return;
    }

    toast.success("Signed in successfully.");

    if (data?.redirect && data.url) {
      router.replace(data.url);
      return;
    }

    // Check if user is admin and redirect accordingly
    if (data?.user && isUserAdmin(data.user)) {
      router.replace("/admin");
      return;
    }

    router.replace(redirectTo);
  };

  return (
    <Card className="border-0 bg-background shadow-none">
      <CardHeader className="text-center lg:text-left">
        <CardTitle className="text-lg">Welcome back</CardTitle>
        <CardDescription>
          Kindly enter the following details to login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {infoMessage ? (
          <Alert className="mb-4">
            <AlertDescription>{infoMessage}</AlertDescription>
          </Alert>
        ) : null}
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="current-password"
                      placeholder="********"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="keepSignedIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel className="font-normal text-foreground text-sm">
                        Keep me signed in
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Link
                className="text-primary text-sm hover:underline"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
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
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-center">
        <p className="text-muted-foreground text-sm">
          New to Pukpara?{" "}
          <Link className="text-primary hover:underline" href="/sign-up">
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
