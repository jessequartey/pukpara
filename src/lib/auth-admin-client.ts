import { authClient } from "@/lib/auth-client";

export const {
  admin: {
    listUsers,
    createUser,
    setUserRole,
    banUser,
    unbanUser,
    impersonateUser,
    stopImpersonating,
    removeUser,
    setUserPassword,
    listSessions,
    revokeSession,
    revokeUserSessions,
  },
} = authClient;
