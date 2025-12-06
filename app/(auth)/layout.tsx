import React from "react";

export default async function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="h-screen overflow-hidden">
			{/* <Sidebar /> */}
			<main className="h-full overflow-y-auto">
				<div className="h-full p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
					{children}
				</div>
			</main>
		</div>
	);
}
