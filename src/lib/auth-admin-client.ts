import { authClient } from "@/lib/auth-client";

export const {
  admin: {
    listUsers,
    createUser,
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
