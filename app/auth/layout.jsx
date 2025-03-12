"use client";

import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

/**
 * Authentication layout component that wraps all auth pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * @returns {JSX.Element} Authentication layout with consistent styling
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center">
        {children}
      </main>

      <Footer />
    </div>
  );
}
