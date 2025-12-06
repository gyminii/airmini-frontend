"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const FREE_MESSAGE_LIMIT = 10;

export function useCredits() {
	const { isSignedIn, user } = useUser();
	const [guestMessageCount, setGuestMessageCount] = useState(0);

	useEffect(() => {
		// Load guest message count from localStorage
		if (!isSignedIn) {
			const stored = localStorage.getItem("guest_message_count");
			setGuestMessageCount(stored ? parseInt(stored) : 0);
		}
	}, [isSignedIn]);

	const incrementMessageCount = () => {
		if (!isSignedIn) {
			const newCount = guestMessageCount + 1;
			setGuestMessageCount(newCount);
			localStorage.setItem("guest_message_count", newCount.toString());
		}
	};

	const hasCredits = isSignedIn || guestMessageCount < FREE_MESSAGE_LIMIT;
	const remainingCredits = isSignedIn
		? Infinity
		: FREE_MESSAGE_LIMIT - guestMessageCount;

	return {
		hasCredits,
		remainingCredits,
		isSignedIn,
		incrementMessageCount,
		isGuest: !isSignedIn,
	};
}
