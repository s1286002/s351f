/**
 * @file useLoginForm.js
 * @description Custom hook for login form state and validation
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Validation schema for the login form
 */
const loginSchema = z.object({
  userId: z
    .string()
    .min(1, "User ID is required")
    .regex(
      /^[ATS]\d{7}$/,
      "Invalid User ID format. Should be a letter (A/T/S) followed by 7 digits"
    ),
  password: z.string().min(1, "Password is required"),
});

/**
 * Custom hook for login form state and validation
 *
 * @returns {Object} Login form state and methods
 */
export default function useLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user just registered
  const justRegistered = searchParams.get("registered") === "true";

  // Initialize form with validation
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  /**
   * Handles form submission
   */
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError("");

      // Send login request
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: data.userId,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Provide more specific error messages based on the response
        if (responseData.message === "Invalid User ID format") {
          throw new Error(
            "The User ID format is invalid. Please check and try again."
          );
        } else if (responseData.message === "Invalid credentials") {
          throw new Error("Invalid User ID or password. Please try again.");
        } else {
          throw new Error(responseData.message || "Login failed");
        }
      }

      // Navigate to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid User ID or password");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    justRegistered,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
