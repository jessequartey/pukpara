import AuthLayoutComponent from "@/features/auth/components/auth-layout";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthLayoutComponent>{children}</AuthLayoutComponent>;
}
