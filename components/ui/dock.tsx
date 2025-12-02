"use client";

import React, { PropsWithChildren, useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
	motion,
	MotionValue,
	useMotionValue,
	useSpring,
	useTransform,
} from "motion/react";
import type { MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

export interface DockProps extends VariantProps<typeof dockVariants> {
	className?: string;
	iconSize?: number;
	iconMagnification?: number;
	disableMagnification?: boolean;
	iconDistance?: number;
	direction?: "top" | "middle" | "bottom";
	orientation?: "horizontal" | "vertical";
	children: React.ReactNode;
}

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;
const DEFAULT_DISABLEMAGNIFICATION = false;

const dockVariants = cva(
	"supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto mt-8 flex w-max gap-2 rounded-2xl border p-2 backdrop-blur-md"
);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
	(
		{
			className,
			children,
			iconSize = DEFAULT_SIZE,
			iconMagnification = DEFAULT_MAGNIFICATION,
			disableMagnification = DEFAULT_DISABLEMAGNIFICATION,
			iconDistance = DEFAULT_DISTANCE,
			direction = "middle",
			orientation = "horizontal",
			...props
		},
		ref
	) => {
		const mousePosition = useMotionValue(Infinity);

		const renderChildren = () => {
			return React.Children.map(children, (child) => {
				if (
					React.isValidElement<DockIconProps>(child) &&
					child.type === DockIcon
				) {
					return React.cloneElement(child, {
						...child.props,
						mousePosition: mousePosition,
						size: iconSize,
						magnification: iconMagnification,
						disableMagnification: disableMagnification,
						distance: iconDistance,
						orientation: orientation,
					});
				}
				return child;
			});
		};

		return (
			<motion.div
				ref={ref}
				onMouseMove={(e) => {
					mousePosition.set(orientation === "horizontal" ? e.pageX : e.pageY);
				}}
				onMouseLeave={() => mousePosition.set(Infinity)}
				{...props}
				className={cn(dockVariants({ className }), {
					// Horizontal orientation
					"h-[58px] flex-row items-start":
						orientation === "horizontal" && direction === "top",
					"h-[58px] flex-row items-center":
						orientation === "horizontal" && direction === "middle",
					"h-[58px] flex-row items-end":
						orientation === "horizontal" && direction === "bottom",
					// Vertical orientation
					"w-[58px] flex-col justify-start":
						orientation === "vertical" && direction === "top",
					"w-[58px] flex-col justify-center":
						orientation === "vertical" && direction === "middle",
					"w-[58px] flex-col justify-end":
						orientation === "vertical" && direction === "bottom",
				})}
			>
				{renderChildren()}
			</motion.div>
		);
	}
);

Dock.displayName = "Dock";

export interface DockIconProps
	extends Omit<MotionProps & React.HTMLAttributes<HTMLDivElement>, "children"> {
	size?: number;
	magnification?: number;
	disableMagnification?: boolean;
	distance?: number;
	mousePosition?: MotionValue<number>;
	orientation?: "horizontal" | "vertical";
	className?: string;
	children?: React.ReactNode;
	props?: PropsWithChildren;
}

const DockIcon = ({
	size = DEFAULT_SIZE,
	magnification = DEFAULT_MAGNIFICATION,
	disableMagnification,
	distance = DEFAULT_DISTANCE,
	mousePosition,
	orientation = "horizontal",
	className,
	children,
	...props
}: DockIconProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const padding = Math.max(6, size * 0.2);
	const defaultMousePosition = useMotionValue(Infinity);

	const distanceCalc = useTransform(
		mousePosition ?? defaultMousePosition,
		(val: number) => {
			const bounds = ref.current?.getBoundingClientRect() ?? {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
			};
			const center =
				orientation === "horizontal"
					? bounds.x + bounds.width / 2
					: bounds.y + bounds.height / 2;
			return val - center;
		}
	);

	const targetSize = disableMagnification ? size : magnification;

	const sizeTransform = useTransform(
		distanceCalc,
		[-distance, 0, distance],
		[size, targetSize, size]
	);

	const scaleSize = useSpring(sizeTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	return (
		<motion.div
			ref={ref}
			style={{ width: scaleSize, height: scaleSize, padding }}
			className={cn(
				"flex aspect-square cursor-pointer items-center justify-center rounded-full",
				disableMagnification && "hover:bg-muted-foreground transition-colors",
				className
			)}
			{...props}
		>
			<div>{children}</div>
		</motion.div>
	);
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, dockVariants };
