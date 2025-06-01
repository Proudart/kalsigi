import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../util/db";
import { myPlugin} from "../util/plugins";

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : `https://www.manhwacall.com`;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:3000", 
    "https://www.manhwacall.com", 
    "https://manhwacall.com"
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  baseURL: process.env.NODE_ENV === "production" 
    ? "https://www.manhwacall.com"
    : "http://localhost:3000",

  plugins: [
    myPlugin(),
  ]
});



