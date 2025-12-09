"use client";

import Lottie from "lottie-react";
import planeAnimation from "../../../data/Loading 40 _ Paperplane.json";

interface WelcomeScreenProps {
	userName?: string | null;
	isAuthenticated: boolean;
}

export function WelcomeScreen({ userName, isAuthenticated }: WelcomeScreenProps) {
	return (
		<div className="mb-10">
			<div className="mx-auto -mt-36 hidden w-72 mask-b-from-100% mask-radial-[50%_50%] mask-radial-from-0% md:block">
				<Lottie
					className="w-full"
					animationData={planeAnimation}
					loop
					autoplay
				/>
			</div>

			<h1 className="text-center text-2xl leading-normal font-medium lg:text-4xl">
				Good Morning
				{isAuthenticated && userName && (
					<span className="text-primary">{` ${userName}`}</span>
				)}
				<br />
				How Can I
				<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
					{" "}
					Assist You Today?
				</span>
			</h1>
		</div>
	);
}
