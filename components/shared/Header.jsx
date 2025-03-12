import Link from "next/link";

/**
 * Header component with logo and title
 * @returns {JSX.Element} Header component
 */
export default function Header() {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
          SMS
        </div>
        <span className="text-xl font-bold text-gray-900">
          Student Management System
        </span>
      </Link>
    </header>
  );
}
