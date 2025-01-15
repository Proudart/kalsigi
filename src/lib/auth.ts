import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../util/db";

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : `https://www.kalsigi.com`;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000", "https://www.kalsigi.com"],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  baseURL: "https://www.kalsigi.com",
});



