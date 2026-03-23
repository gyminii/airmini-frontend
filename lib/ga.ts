"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ReactGA from "react-ga4";

let initialized = false;

export default function GoogleAnalyticsInit() {
	const pathname = usePathname();

	useEffect(() => {
		const key = process.env.NEXT_PUBLIC_GA_KEY;
		if (!key) return;

		if (!initialized) {
			ReactGA.initialize(key);
			initialized = true;
		}

		ReactGA.send({ hitType: "pageview", page: pathname });
	}, [pathname]);

	return null;
}
