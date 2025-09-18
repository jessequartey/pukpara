import { z } from "zod";

const PASSWORD_MIN_LENGTH = 4;

export const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(1, {
      message: "Password is required",
    })
    .min(PASSWORD_MIN_LENGTH, {
      message: "Password must be at least 4 characters.",
    }),
  confirmPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
      message: "Confirm password is required",
    })
    .min(PASSWORD_MIN_LENGTH, {
      message: "Confirm password must be at least 4 characters.",
    }),
  phoneNumber: z
    .string()
    .min(1, { message: "Phone number is required." }),
  districtId: z
    .string()
    .min(1, { message: "District ID is required." }),
  address: z.string().min(1, { message: "Address is required." }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
