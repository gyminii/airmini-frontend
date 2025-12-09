import { clsx, type ClassValue } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateMeta({
	title,
	description,
	canonical,
}: {
	title: string;
	description: string;
	canonical: string;
}): Metadata {
	return {
		title: `${title}`,
		description: description,
		metadataBase: new URL(`https://www.minii.dev/`),
		alternates: {
			canonical: `/${canonical}`,
		},
		openGraph: {
			images: [`/images/seo.jpg`],
		},
	};
}
