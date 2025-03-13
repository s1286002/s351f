/**
 * @file LoginForm.jsx
 * @description Main login form component for user authentication
 */

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import FormError from "./FormError";
import useLoginForm from "@/hooks/form/useLoginForm";

/**
 * LoginForm component for user authentication
 *
 * @returns {JSX.Element} The LoginForm component
 */
export default function LoginForm() {
  const { form, isLoading, error, justRegistered, onSubmit } = useLoginForm();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Success message after registration */}
        {justRegistered && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Registration successful! Please log in with your User ID and
              password.
            </AlertDescription>
          </Alert>
        )}

        {/* Error message */}
        {error && <FormError message={error} />}

        {/* User ID */}
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your User ID (e.g. S0001234)"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Your User ID was provided during registration (format: letter +
                7 digits)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>

        {/* Register Link */}
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-primary font-semibold hover:underline"
          >
            Register
          </Link>
        </div>
      </form>
    </Form>
  );
}
