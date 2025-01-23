"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { SignInSchema } from "@/types";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    try {
      setIsLoading(true);
      
      const { data, error } = await authClient.signIn.email({ 
        email: values.email, // Map username to email for better-auth
        password: values.password 
      }, { 
        onRequest: (ctx) => { 
          setIsLoading(true);
        }, 
        onSuccess: async (ctx) => {
          toast({
            variant: "default",
            description: "Signed in successfully",
          });

          // Wait for session syncs
          await Promise.all([
            fetch("/api/auth/syncBookmarks", {
              method: "POST",
              credentials: 'include',
            }),
            fetch("/api/auth/syncSeriesHistory", {
              method: "POST",
              credentials: 'include',
            })
          ]);

          router.replace("/");
          window.location.reload();
        }, 
        onError: (ctx) => {
          toast({
            variant: "destructive",
            description: ctx.error.message || "Failed to sign in",
          });
        },
        finally: () => {
          setIsLoading(false);
        }
      }); 

      if (error) {
        throw error;
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Failed to sign in",
      });
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder={'user@skaihua.com'} 
                  {...field} 
                  disabled={isLoading}
                />
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
                <Input 
                  placeholder="********" 
                  type="password" 
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="bg-accent-100 w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  );
}