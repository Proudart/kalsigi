import { BetterAuthPlugin } from "better-auth";
 
const myPlugin = ()=>{
    return {
        id: "my-plugin",
        schema: {
            user: {
                fields: {
                    role: {
                        type: "string",
                    },
                },
            },
        },
    } satisfies BetterAuthPlugin
}

export { myPlugin};