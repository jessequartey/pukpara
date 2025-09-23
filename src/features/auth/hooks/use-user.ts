"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { signOut as authSignOut, useSession } from "@/lib/auth-client";

const WHITESPACE_PATTERN = /\s+/u;

export function useUser() {
	const router = useRouter();
	const session = useSession();

	const user = session.data?.user ?? null;

	const getDisplayName = useCallback((currentUser: typeof user) => {
		if (!currentUser) {
			return "Account";
		}

		const name = currentUser.name?.trim();
		if (name && name.length > 0) {
			return name;
		}

		const email = currentUser.email?.trim();
		if (email && email.length > 0) {
			return email;
		}

		return "Account";
	}, []);

	const getUserInitials = useCallback((currentUser: typeof user) => {
		if (!currentUser) {
			return "PP";
		}

		const source = currentUser.name || currentUser.email || "Pukpara";
		const parts = source.split(WHITESPACE_PATTERN).filter(Boolean);

		if (parts.length === 0) {
			return "PP";
		}

		const initials = parts.slice(0, 2).reduce((accumulator, part) => {
			const codePoint = part.codePointAt(0);
			if (!codePoint) {
				return accumulator;
			}

			return `${accumulator}${String.fromCodePoint(codePoint)}`;
		}, "");

		return initials.toUpperCase();
	}, []);

	const handleSignOut = useCallback(async () => {
		try {
			await authSignOut();
			toast.success("Signed out successfully.");
		} catch (_error) {
			toast.error("Unable to sign out. Please try again.");
			return;
		}

		router.replace("/sign-in");
		router.refresh();
	}, [router]);

	return useMemo(
		() => ({
			user,
			isLoading: session.isPending,
			signOut: handleSignOut,
			getDisplayName,
			getUserInitials,
		}),
		[user, session.isPending, handleSignOut, getDisplayName, getUserInitials],
	);
}
