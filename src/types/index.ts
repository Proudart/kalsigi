import { z } from "zod"
export const SignUpSchema = z
  .object({
    username: z.string().min(2).max(50),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    email: z.string().email(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

  export const SignInSchema = z.object({
    email: z.string().min(2).max(50), // Used as email in better-auth
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  })