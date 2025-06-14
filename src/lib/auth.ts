import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../util/db";
import { myPlugin} from "../util/plugins";
import { getAuthUrls } from "./utils";

const { baseURL, trustedOrigins } = getAuthUrls();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  baseURL,

  plugins: [
    myPlugin(),
  ]
});



