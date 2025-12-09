// components/chat-interface/chat-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
	return (
		<div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center space-y-4 lg:p-4">
			<div className="h-10" />

			{/* Messages area skeleton */}
			<div className="relative w-full flex-1 space-y-4 pe-2 pt-10 md:pt-0">
				{/* User message */}
				<div className="flex justify-end">
					<Skeleton className="h-12 w-[60%] rounded-lg" />
				</div>

				{/* Assistant message */}
				<div className="flex justify-start">
					<div className="max-w-[75%] space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-32 w-full rounded-lg" />
					</div>
				</div>

				{/* User message */}
				<div className="flex justify-end">
					<Skeleton className="h-10 w-[40%] rounded-lg" />
				</div>

				{/* Assistant message */}
				<div className="flex justify-start">
					<div className="max-w-[75%] space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-48 w-full rounded-lg" />
					</div>
				</div>
			</div>

			{/* Input area skeleton */}
			<div className="w-full rounded-2xl bg-primary/10 p-1 pt-0">
				<div className="flex gap-2 px-4 py-2">
					<Skeleton className="h-3 w-48" />
				</div>
				<div className="rounded-xl bg-background p-4">
					<Skeleton className="h-6 w-full" />
					<div className="mt-3 flex justify-end">
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
				</div>
			</div>
		</div>
	);
}
