import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ResetPasswordLandingProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function ResetPasswordLanding({
  searchParams,
}: ResetPasswordLandingProps) {
  const tokenParam = searchParams.token;
  let token = "";
  if (typeof tokenParam === "string") {
    token = tokenParam;
  } else if (Array.isArray(tokenParam) && tokenParam.length > 0) {
    token = tokenParam[0];
  }

  if (token) {
    redirect(`/reset-password/${token}`);
  }

  const errorParam = searchParams.error;
  const hasError = typeof errorParam === "string" && errorParam.length > 0;
  const message = hasError
    ? "This reset link is invalid or has expired. Please request a new one."
    : "We could not find a reset token. Request a new link to continue.";

  return (
    <Card className="border-0 bg-background shadow-none">
      <CardHeader className="text-center lg:text-left">
        <CardTitle className="text-lg">Reset password</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-center lg:text-left">
        <p className="text-muted-foreground text-sm">
          Head back to the forgot password page to request a new link.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center lg:justify-start">
        <Button asChild size="lg" variant="default">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
