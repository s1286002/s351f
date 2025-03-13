"use client";
import SimpleRegisterForm from "@/components/auth/SimpleRegisterForm";

/**
 * Registration page component
 * @returns {JSX.Element} Registration page
 */
export default function RegisterPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 min-h-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <SimpleRegisterForm />
      </div>
    </div>
  );
}
