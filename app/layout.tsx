// app/layout.tsx
import { ThemeDataProvider } from "@/components/providers/theme-data-provider";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { connection } from "next/server";
import NextTopLoader from "nextjs-toploader";
import { Suspense, type ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
	title: "Airmini — AI Immigration Assistant",
	description:
		"Ask anything about visas, entry requirements, permits, and immigration. Powered by AI.",
};

async function DynamicClerkProvider({ children }: { children: ReactNode }) {
	await connection();
	return <ClerkProvider dynamic>{children}</ClerkProvider>;
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				suppressHydrationWarning
				className={cn("bg-background group/layout font-sans", fontVariables)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<NextTopLoader
						color="var(--primary)"
						showSpinner={false}
						height={2}
					/>
					<Toaster position="top-center" richColors />

					{/* DynamicClerkProvider calls connection() before ClerkProvider to satisfy PPR */}
					<Suspense fallback={<AppSkeleton />}>
						<DynamicClerkProvider>
							<Suspense fallback={children}>
								<ThemeDataProvider>{children}</ThemeDataProvider>
							</Suspense>
						</DynamicClerkProvider>
					</Suspense>
				</ThemeProvider>
			</body>
		</html>
	);
}

function AppSkeleton() {
	return <div className="min-h-screen" />;
}
