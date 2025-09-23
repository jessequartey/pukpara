"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpSchema } from "../../schema";
import { useSignUpStore } from "../../store/sign-up-store";

const signUpStepOneSchema = signUpSchema
	.pick({
		firstName: true,
		lastName: true,
		email: true,
		password: true,
		confirmPassword: true,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match.",
		path: ["confirmPassword"],
	});

type SignUpStepOneSchema = z.infer<typeof signUpStepOneSchema>;

export default function SignUpStepOneForm() {
	const router = useRouter();
	const setData = useSignUpStore((state) => state.setData);
	const firstName = useSignUpStore((state) => state.firstName ?? "");
	const lastName = useSignUpStore((state) => state.lastName ?? "");
	const email = useSignUpStore((state) => state.email ?? "");
	const password = useSignUpStore((state) => state.password ?? "");
	const confirmPassword = useSignUpStore(
		(state) => state.confirmPassword ?? "",
	);
	const hasHydrated = useSignUpStore((state) => state.hasHydrated);

	const defaultValues = useMemo(
		() => ({ firstName, lastName, email, password, confirmPassword }),
		[firstName, lastName, email, password, confirmPassword],
	);

	const form = useForm<SignUpStepOneSchema>({
		resolver: zodResolver(signUpStepOneSchema),
		defaultValues,
		mode: "onBlur",
	});

	useEffect(() => {
		if (!hasHydrated) {
			return;
		}
		form.reset(defaultValues);
	}, [defaultValues, form, hasHydrated]);

	const onSubmit = (data: SignUpStepOneSchema) => {
		setData(data);
		router.push("/sign-up/submit");
	};

	return (
		<Card className="border-0 bg-background shadow-none">
			<CardHeader className="flex flex-col items-center justify-center lg:items-start">
				<Badge className="bg-primary/5 text-primary">Step 1 of 2</Badge>
				<CardTitle className="text-lg">Create an account</CardTitle>
				<CardDescription>
					Please fill out the following details to create your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input
												autoComplete="given-name"
												placeholder="John"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input
												autoComplete="family-name"
												placeholder="Doe"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											autoComplete="email"
											inputMode="email"
											placeholder="example@email.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											autoComplete="new-password"
											placeholder="********"
											type="password"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input
											autoComplete="new-password"
											placeholder="********"
											type="password"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							className="w-full"
							disabled={form.formState.isSubmitting}
							size="lg"
							type="submit"
						>
							{form.formState.isSubmitting ? "Please wait..." : "Continue"}
						</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="flex justify-center text-center">
				<p className="text-muted-foreground text-sm">
					Already have an account?{" "}
					<Link className="text-primary hover:underline" href="/sign-in">
						Sign In
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
