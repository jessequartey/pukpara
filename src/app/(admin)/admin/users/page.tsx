"use client";

import { UserDirectoryCard } from "@/features/admin/users/components/user-directory/user-directory-card";
import { UserPageTitle } from "@/features/admin/users/components/user-page-title";
import { useUserListController } from "@/features/admin/users/hooks/use-user-list-controller";

export default function AdminUsersPage() {
  const controller = useUserListController();

  return (
    <UserPageTitle
      action={{ label: "Invite user", href: "/admin/users?invite=new" }}
      description="Observe all platform users, roles, and sessions with comprehensive management tools."
      title="Users"
    >
      <UserDirectoryCard controller={controller} />
    </UserPageTitle>
  );
}
