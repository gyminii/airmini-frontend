import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/settings(.*)",
	// "/chat(.*)",
	"/chat/:id",
]);

export default clerkMiddleware(async (auth, req) => {
	if (isProtectedRoute(req)) {
		await auth.protect();
	}

	if (req.nextUrl.pathname === "/") {
		return NextResponse.redirect(new URL("/chat", req.url));
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		"/",
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
