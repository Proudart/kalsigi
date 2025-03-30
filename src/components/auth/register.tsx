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
import { SignUpSchema } from "@/types";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignUpSchema>) {
    if (values.password !== values.confirmPassword) {
      toast({
        variant: "destructive",
        description: "Passwords do not match",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await authClient.signUp.email({ 
        email: values.email,
        password: values.password,
        name: values.username // Map username to name for better-auth
      }, { 
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: async (ctx) => {
          toast({
            variant: "default",
            description: "Account created successfully",
          });

          // Initialize user data
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

          router.back();
          window.location.reload();
        },
        onError: (ctx) => {
          toast({
            variant: "destructive",
            description: ctx.error.message || "Failed to create account",
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
        description: error.message || "Failed to create account",
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
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="user@manhwacall.com" 
                  {...field} 
                  disabled={isLoading}
                  type="email"
                />
              </FormControl>
              {error && <FormMessage>{error.message}</FormMessage>}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder={'username'} 
                  {...field}
                  disabled={isLoading}
                /> 
              </FormControl>
              {error && <FormMessage>{error.message}</FormMessage>}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState: { error } }) => (
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
              {error && <FormMessage>{error.message}</FormMessage>}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input 
                  placeholder="********" 
                  type="password" 
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              {error && <FormMessage>{error.message}</FormMessage>}
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
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </Form>
  );
}