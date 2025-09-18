import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

type AuthInstance = typeof import("@/lib/auth").auth;

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<AuthInstance>(),
    organizationClient({
      $inferAuth: {} as AuthInstance,
      teams: { enabled: true },
    }),
    adminClient({
      $inferAuth: {} as AuthInstance,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
