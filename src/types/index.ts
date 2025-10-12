import { z } from "zod"

// Better-auth session types with custom role field
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role?: string; // Custom field added via plugin
};

export type Session = {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
};

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