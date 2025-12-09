import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
	return (
		<div className="hidden md:flex">
			<div className="flex h-full w-72 flex-col border-e">
				<div className="flex-1 space-y-4 overflow-y-auto p-4">
					{/* Today group skeleton */}
					<div>
						<Skeleton className="mb-4 h-3 w-12" />
						<div className="space-y-0.5">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-9 w-full rounded-lg" />
							))}
						</div>
					</div>

					{/* Yesterday group skeleton */}
					<div>
						<Skeleton className="mb-4 h-3 w-16" />
						<div className="space-y-0.5">
							{[1, 2].map((i) => (
								<Skeleton key={i} className="h-9 w-full rounded-lg" />
							))}
						</div>
					</div>
				</div>

				<div className="shrink-0">
					<div className="p-4">
						<Skeleton className="h-9 w-full" />
					</div>
					<div className="border-t p-4">
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</div>
		</div>
	);
}
