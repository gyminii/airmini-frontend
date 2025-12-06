export default function SSOLoading() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			<p className="text-muted-foreground text-sm">Signing you in...</p>
		</div>
	);
}
