/**
 * Footer component with copyright information
 * @returns {JSX.Element} Footer component
 */
export default function Footer() {
  return (
    <footer className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} Student Management System. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}
