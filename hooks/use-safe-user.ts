// hooks/use-safe-user.ts
"use client";

import { useUser } from "@clerk/nextjs";

export function useSafeUser() {
	try {
		return useUser();
	} catch {
		return { user: null, isLoaded: false, isSignedIn: false };
	}
}
