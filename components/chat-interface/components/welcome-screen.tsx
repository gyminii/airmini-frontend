import { memo } from "react";

interface WelcomeScreenProps {
	userName?: string | null;
	isAuthenticated: boolean;
}

export const WelcomeScreen = memo(function WelcomeScreen({
	userName,
	isAuthenticated,
}: WelcomeScreenProps) {
	return (
		<div className="mb-10 space-y-2 text-center">
			<h1 className="text-2xl font-semibold leading-snug lg:text-4xl">
				{isAuthenticated && userName ? (
					<>
						Hi <span className="text-primary">{userName}</span>
						<br />
					</>
				) : null}
				Ask anything about
				<br />
				visas & immigration.
			</h1>
			<p className="text-muted-foreground text-sm">
				Visa types, permit requirements, status checks, and more.
			</p>
		</div>
	);
});
