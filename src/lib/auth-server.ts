import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

type GuardReason = "NO_SESSION" | "PENDING_APPROVAL";

type GuardResult =
	| {
			session: Session;
			reason: null;
	  }
	| {
			session: null;
			reason: GuardReason;
	  };

export async function getServerSession(): Promise<Session | null> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || typeof session !== "object" || !("user" in session)) {
		return null;
	}

	return session as Session;
}

export async function requireApprovedSession(): Promise<GuardResult> {
	const session = await getServerSession();

	if (!session) {
		return {
			session: null,
			reason: "NO_SESSION",
		};
	}

	const status = session.user?.status;

	if (status && status !== "approved") {
		return {
			session: null,
			reason: "PENDING_APPROVAL",
		};
	}

	return {
		session,
		reason: null,
	};
}
