"use client";

import { Building2, UsersRound } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useOrganizationCreateStore } from "@/features/admin/organizations/store/organization-create-store";
import { cn } from "@/lib/utils";

const creationOptions = [
	{
		value: "new-user" as const,
		title: "Create new user workspace",
		description:
			"Provision a brand-new user and automatically generate a workspace for them. Ideal for onboarding new partners.",
		icon: UsersRound,
		highlights: [
			"Creates admin owner membership automatically",
			"Lets you set initial credentials and contact details",
		],
	},
	{
		value: "existing-user" as const,
		title: "Attach to existing user",
		description:
			"Spin up an additional organization for someone who already has an account. Perfect for multi-tenant operators.",
		icon: Building2,
		highlights: [
			"Keeps the user’s current login and profile intact",
			"Adds the user as the owner of the new organization",
		],
	},
];

const optionBorderClass = "border-primary bg-primary/5" as const;

type CreationModeStepProps = {
	onNext: () => void;
};

export const CreationModeStep = ({ onNext }: CreationModeStepProps) => {
	const selectedMode = useOrganizationCreateStore((state) => state.mode);
	const setMode = useOrganizationCreateStore((state) => state.setMode);

	const currentOption = useMemo(
		() => creationOptions.find((option) => option.value === selectedMode),
		[selectedMode],
	);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedMode) {
			return;
		}
		onNext();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>How would you like to create this organization?</CardTitle>
				<CardDescription>
					Choose whether you are onboarding someone brand new or assigning a
					workspace to an existing account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-6" onSubmit={handleSubmit}>
					<fieldset className="space-y-4">
						<legend className="text-muted-foreground text-sm">
							Creation mode
						</legend>
						<div className="grid gap-4 lg:grid-cols-2">
							{creationOptions.map((option) => {
								const Icon = option.icon;
								const checked = option.value === currentOption?.value;
								return (
									<label
										className={cn(
											"relative flex h-full cursor-pointer flex-col gap-4 rounded-lg border bg-background p-5 shadow-sm transition hover:border-primary/60 hover:bg-primary/5",
											checked ? optionBorderClass : "border-border",
										)}
										key={option.value}
									>
										<input
											checked={checked}
											className="sr-only"
											name="creation-mode"
											onChange={() => setMode(option.value)}
											type="radio"
											value={option.value}
										/>
										<div className="flex items-center gap-3">
											<span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
												<Icon aria-hidden className="size-5" />
											</span>
											<div>
												<p className="font-medium leading-tight">
													{option.title}
												</p>
												<p className="text-muted-foreground text-sm">
													{option.description}
												</p>
											</div>
										</div>
										<ul className="space-y-2 text-muted-foreground text-sm">
											{option.highlights.map((highlight) => (
												<li className="flex gap-2" key={highlight}>
													<span
														aria-hidden
														className="mt-1 size-1.5 rounded-full bg-primary"
													/>
													<span>{highlight}</span>
												</li>
											))}
										</ul>
									</label>
								);
							})}
						</div>
					</fieldset>
					<div className="flex justify-end">
						<Button disabled={!selectedMode} size="lg" type="submit">
							Continue
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
