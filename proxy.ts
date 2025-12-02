import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/settings(.*)",
	// Add other protected routes here
]);

export default clerkMiddleware(async (auth, req) => {
	// Protect routes
	if (isProtectedRoute(req)) {
		await auth.protect();
	}

	// Redirect root to /chat
	if (req.nextUrl.pathname === "/") {
		return NextResponse.redirect(new URL("/chat", req.url));
	}
});

export const config = {
	matcher: [
		"/",
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
