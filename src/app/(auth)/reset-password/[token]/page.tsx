import { redirect } from "next/navigation";
import ResetPasswordForm from "@/features/auth/components/reset-password-form";

type ResetPasswordTokenPageProps = {
  params: Promise<{
    token?: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordTokenPage({
  params,
  searchParams,
}: ResetPasswordTokenPageProps) {
  const resolvedParams = (await params) ?? {};
  const tokenFromParams = resolvedParams.token
    ? decodeURIComponent(resolvedParams.token)
    : "";
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorParam = resolvedSearchParams?.error;
  const firstErrorValue = Array.isArray(errorParam)
    ? errorParam.at(0)
    : errorParam;

  if (typeof firstErrorValue === "string" && firstErrorValue.length > 0) {
    redirect(`/reset-password?error=${encodeURIComponent(firstErrorValue)}`);
  }

  const token = tokenFromParams.trim();

  if (!token) {
    redirect("/reset-password?error=missing_token");
  }

  return <ResetPasswordForm token={token} />;
}
