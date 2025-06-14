import { createAuthClient } from "better-auth/react";
import { getAuthUrls } from "./utils";

const { baseURL, trustedOrigins } = getAuthUrls();

export const authClient = createAuthClient({
    baseURL,
    trustedOrigins,
    emailAndPassword: { enabled: true },
});
