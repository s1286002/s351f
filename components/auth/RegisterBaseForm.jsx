import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { baseRegisterSchema } from "./schemas";
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
 * Base registration form component with common fields
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components (role-specific fields)
 * @param {string} props.title - Form title
 * @param {string} props.description - Form description
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Object} props.schema - Zod schema for validation
 * @param {Object} props.defaultValues - Default form values
 * @returns {JSX.Element} Registration form with common fields
 */
export default function RegisterBaseForm({
  children,
  title = "Create an account",
  description = "Enter your information to create an account",
  onSubmit,
  schema = baseRegisterSchema(),
  defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  },
}) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const watchTermsAccepted = watch("termsAccepted");

  /**
   * Handle form submission wrapper
   * @param {Object} data - Form data
   */
  const handleFormSubmit = async (data) => {
    setIsLoading(true);

    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

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

          {/* Role-specific fields will be rendered here */}
          {children &&
            children({ register, errors, control, setValue, watch, isLoading })}

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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="termsAccepted"
              checked={watchTermsAccepted}
              onCheckedChange={(checked) => setValue("termsAccepted", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="termsAccepted" className="text-sm">
              I agree to the{" "}
              <Link href="#" className="text-blue-600 hover:text-blue-500">
                terms and conditions
              </Link>
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-red-500">
              {errors.termsAccepted.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
