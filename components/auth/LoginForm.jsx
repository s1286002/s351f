import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Login form component
 * @returns {JSX.Element} Login form with validation
 */
export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema()),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  /**
   * Handle form submission
   * @param {Object} data - Form data containing email and password
   */
  const onSubmit = async (data) => {
    setIsLoading(true);

    // Simulate a login delay
    setTimeout(() => {
      console.log("Login form submitted:", data);
      setIsLoading(false);
    }, 1000);

    // Authentication logic will be implemented later
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="rememberMe" {...register("rememberMe")} />
            <Label htmlFor="rememberMe">Remember me</Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-center">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
