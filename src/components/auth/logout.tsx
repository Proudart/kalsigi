"use client";

import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      // Sync user data before logout
      await Promise.all([
        fetch("/api/auth/syncBookmarks", {
          method: "POST",
          credentials: 'include'
        }),
        fetch("/api/auth/syncSeriesHistory", {
          method: "POST",
          credentials: 'include'
        })
      ]);

      // Use better-auth's signOut
      const { error } = await authClient.signOut({
        fetchOptions: {
        onRequest: () => {
          toast({
            variant: "default",
            description: "Logging out...",
          });
        },
        onSuccess: () => {
          toast({
            variant: "default",
            description: "Logged out successfully",
          });
          
          router.push("/");
          router.refresh(); // Refresh server components
          window.location.reload(); // Force full page reload
        },
        onError: (ctx: { error: { message: string | undefined; }; }) => {
          throw new Error(ctx.error.message);
        }}
      });

      if (error) {
        throw error;
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Failed to log out",
      });
    }
  }

  return (
    <span 
      onClick={handleLogout} 
      className="cursor-pointer hover:text-accent-500 transition-colors"
    >
      Logout
    </span>
  );
}

export default LogoutButton;