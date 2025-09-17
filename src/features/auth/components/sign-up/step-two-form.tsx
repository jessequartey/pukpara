import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { signUpSchema } from "../../schema";
import { useSignUpStore } from "../../store/sign-up-store";

const signUpStepTwoSchema = signUpSchema.pick({
  phoneNumber: true,
  district: true,
  address: true,
});

type SignUpStepTwoSchema = z.infer<typeof signUpStepTwoSchema>;

export default function SignUpStepTwoForm() {
  const router = useRouter();
  const firstName = useSignUpStore((state) => state.firstName);
  const lastName = useSignUpStore((state) => state.lastName);
  const email = useSignUpStore((state) => state.email);
  const password = useSignUpStore((state) => state.password);
  const confirmPassword = useSignUpStore((state) => state.confirmPassword);

  const form = useForm<SignUpStepTwoSchema>({
    resolver: zodResolver(signUpStepTwoSchema),
    defaultValues: {
      phoneNumber: "",
      district: "",
      address: "",
    },
  });

  const onSubmit = (data: SignUpStepTwoSchema) => {
    const completeData = {
      ...data,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    };

    // biome-ignore lint/suspicious/noConsole: <develop>
    console.log("Complete sign-up data:", completeData);

    // TODO: Submit to API
    router.push("/sign-in");
  };

  useEffect(() => {
    if (!(firstName && lastName && email && password && confirmPassword)) {
      router.push("/sign-up");
    }
  }, [firstName, lastName, email, password, confirmPassword, router.push]);
  return (
    <Card className="border-0 bg-background shadow-none">
      <CardHeader className="flex flex-col items-center justify-center lg:items-start">
        <Badge className="bg-primary/5 text-primary">Step 2 of 2</Badge>
        <CardTitle className="text-lg">Complete your profile</CardTitle>
        <CardDescription>
          Help us connect with you and customize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      defaultCountry="GH"
                      placeholder="012 345 6789"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-secondary px-5 py-4 text-center text-muted-foreground text-xs leading-tight">
              <p>
                By continuing, you agree to the{" "}
                <Link className="underline" href="/">
                  Terms of Service
                </Link>{" "}
                and the{" "}
                <Link className="underline" href="/">
                  Privacy Policy
                </Link>{" "}
                of the platform.
              </p>
            </div>

            <Button className="w-full" size={"lg"} type="submit">
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="-mt-2 flex justify-center text-center">
        <Link
          className={buttonVariants({
            variant: "ghost",
            className:
              "w-full hover:border-1 hover:bg-background hover:text-foreground",
          })}
          href="/sign-up"
        >
          <ArrowLeft />
          Go back
        </Link>
      </CardFooter>
    </Card>
  );
}
