import { Suspense } from "react";
import SignInForm from "@/features/auth/components/sign-in-form";

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
