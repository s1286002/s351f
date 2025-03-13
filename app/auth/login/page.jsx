"use client";

import LoginForm from "@/components/auth/LoginForm";
import AuthCard from "@/components/auth/AuthCard";

/**
 * Login page component
 * @returns {JSX.Element} Login page
 */
export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 min-h-full flex items-center justify-center">
      <AuthCard
        title="Welcome Back"
        description="Enter your credentials to access your account"
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
