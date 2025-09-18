import { redirect } from "next/navigation";
import ResetPasswordForm from "@/features/auth/components/reset-password-form";

type ResetPasswordTokenPageProps = {
  params: {
    token?: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ResetPasswordTokenPage({
  params,
  searchParams,
}: ResetPasswordTokenPageProps) {
  const tokenFromParams = params.token ? decodeURIComponent(params.token) : "";
  const errorParam = searchParams?.error;

  if (typeof errorParam === "string" && errorParam.length > 0) {
    redirect(`/reset-password?error=${encodeURIComponent(errorParam)}`);
  }

  const token = tokenFromParams.trim();

  if (!token) {
    redirect("/reset-password?error=missing_token");
  }

  return <ResetPasswordForm token={token} />;
}
