"use client";

import RegisterForm from "@/components/auth/RegisterForm";

/**
 * Registration page component
 * @returns {JSX.Element} Registration page
 */
export default function RegisterPage() {
  return (
    <div className="w-full flex justify-center">
      <RegisterForm />
    </div>
  );
}
