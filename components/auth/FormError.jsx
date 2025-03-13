/**
 * @file FormError.jsx
 * @description Error display component for form validation and API errors
 */

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * FormError component to display validation and API error messages
 *
 * @param {Object} props - Component props
 * @param {string} props.message - The error message to display
 * @returns {JSX.Element|null} The FormError component or null if no message
 */
export default function FormError({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
}
