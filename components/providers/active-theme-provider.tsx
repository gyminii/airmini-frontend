"use client";

import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { DEFAULT_THEME, ThemeType } from "@/lib/themes";

function setThemeCookie(key: string, value: string | null) {
	if (typeof window === "undefined") return;

	if (!value) {
		document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax; ${
			window.location.protocol === "https:" ? "Secure;" : ""
		}`;
	} else {
		document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax; ${
			window.location.protocol === "https:" ? "Secure;" : ""
		}`;
	}
}

type ThemeContextType = {
	theme: ThemeType;
	setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
	children,
	initialTheme,
}: {
	children: ReactNode;
	initialTheme?: ThemeType;
}) {
	const [theme, setTheme] = useState<ThemeType>(() =>
		initialTheme ? initialTheme : DEFAULT_THEME
	);

	useEffect(() => {
		const body = document.body;
		// The SSR wrapper div retains stale theme attributes after client-side
		// theme switches. Sync it here so its CSS variables don't shadow body's.
		const wrapper = document.querySelector<HTMLElement>("[data-theme-wrapper]");

		function setAttr(el: HTMLElement | null, attr: string, value: string) {
			el?.setAttribute(attr, value);
		}
		function removeAttr(el: HTMLElement | null, attr: string) {
			el?.removeAttribute(attr);
		}

		setThemeCookie("theme_radius", theme.radius);
		body.setAttribute("data-theme-radius", theme.radius);

		if (theme.radius != "default") {
			setThemeCookie("theme_preset", theme.radius);
			body.setAttribute("data-theme-radius", theme.radius);
			setAttr(wrapper, "data-theme-radius", theme.radius);
		} else {
			setThemeCookie("theme_preset", null);
			body.removeAttribute("data-theme-radius");
			removeAttr(wrapper, "data-theme-radius");
		}

		if (theme.preset != "default") {
			setThemeCookie("theme_preset", theme.preset);
			body.setAttribute("data-theme-preset", theme.preset);
			setAttr(wrapper, "data-theme-preset", theme.preset);
		} else {
			setThemeCookie("theme_preset", null);
			body.removeAttribute("data-theme-preset");
			removeAttr(wrapper, "data-theme-preset");
		}

		setThemeCookie("theme_content_layout", theme.contentLayout);
		body.setAttribute("data-theme-content-layout", theme.contentLayout);
		setAttr(wrapper, "data-theme-content-layout", theme.contentLayout);

		if (theme.scale != "none") {
			setThemeCookie("theme_scale", theme.scale);
			body.setAttribute("data-theme-scale", theme.scale);
			setAttr(wrapper, "data-theme-scale", theme.scale);
		} else {
			setThemeCookie("theme_scale", null);
			body.removeAttribute("data-theme-scale");
			removeAttr(wrapper, "data-theme-scale");
		}

		setThemeCookie("theme_issidebar", theme.isSidebar ? "true" : "false");
		body.setAttribute("data-theme-issidebar", String(theme.isSidebar));
		setAttr(wrapper, "data-theme-issidebar", String(theme.isSidebar));
	}, [
		theme.preset,
		theme.radius,
		theme.scale,
		theme.contentLayout,
		theme.isSidebar,
	]);
	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useThemeConfig() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error(
			"useThemeConfig must be used within an ActiveThemeProvider"
		);
	}
	return context;
}
