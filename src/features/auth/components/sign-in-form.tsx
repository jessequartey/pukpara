import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const PASSWORD_LENGTH = 4;
const formSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z
    .string()
    .min(PASSWORD_LENGTH, { message: "Please enter your password." }),
  keepSignedIn: z.boolean().optional(),
});
export default function SignInForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // biome-ignore lint/suspicious/noConsole: <for dev purposes>
    console.log(values);
  }
  return (
    <Card className="border-0 bg-background shadow-none">
      <CardHeader className="text-center lg:text-left">
        <CardTitle className="text-lg">Welcome back</CardTitle>
        <CardDescription>
          Kindly enter the following details to login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@email.com" {...field} />
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
                    <Input placeholder="********" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Keep me signed in & Forgot password */}
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="keepSignedIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel className="font-normal text-foreground text-sm">
                        Keep me signed in
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Link
                className="text-primary text-sm hover:underline"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <Button className="w-full" size={"lg"} type="submit">
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-center">
        <p className="text-muted-foreground text-sm">
          New to Pukpara?{" "}
          <Link className="text-primary hover:underline" href="/sign-up">
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
