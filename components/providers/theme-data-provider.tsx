import { ActiveThemeProvider } from "@/components/providers/active-theme-provider";
import { FloatNav } from "@/components/layout/header/floating-nav";
import GoogleAnalyticsInit from "@/lib/ga";
import { DEFAULT_THEME, ThemeType } from "@/lib/themes";
import { cookies } from "next/headers";

export async function ThemeDataProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();

	const contentLayoutValue =
		cookieStore.get("theme_content_layout")?.value ??
		DEFAULT_THEME.contentLayout;
	const contentLayout: ThemeType["contentLayout"] =
		contentLayoutValue === "centered" ? "centered" : "full";

	const isSidebarValue = cookieStore.get("theme_issidebar")?.value;
	const isSidebar =
		isSidebarValue === "false" ? false : DEFAULT_THEME.isSidebar;

	const themeSettings: ThemeType = {
		preset: cookieStore.get("theme_preset")?.value ?? DEFAULT_THEME.preset,
		scale: cookieStore.get("theme_scale")?.value ?? DEFAULT_THEME.scale,
		radius: cookieStore.get("theme_radius")?.value ?? DEFAULT_THEME.radius,
		contentLayout,
		isSidebar,
	};

	const bodyAttributes = Object.fromEntries(
		Object.entries(themeSettings)
			.filter(([_, value]) => value)
			.map(([key, value]) => [
				`data-theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
				value,
			])
	);

	return (
		<div {...bodyAttributes} className="contents">
			<ActiveThemeProvider initialTheme={themeSettings}>
				{children}
				{process.env.NODE_ENV === "production" ? <GoogleAnalyticsInit /> : null}
				<FloatNav />
			</ActiveThemeProvider>
		</div>
	);
}
