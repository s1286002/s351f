"use client";

import LoginForm from "@/components/auth/LoginForm";

/**
 * Login page component
 * @returns {JSX.Element} Login page
 */
export default function LoginPage() {
  return (
    <div className="w-full flex justify-center">
      <LoginForm />
    </div>
  );
}
