import { UserDetailsPage } from "@/features/admin/users/pages/user-details-page";

type UserRouteParams = {
  params: Promise<{ userId: string }>;
};

export default async function AdminUserDetailPage({ params }: UserRouteParams) {
  const { userId } = await params;

  return <UserDetailsPage userId={userId} />;
}
