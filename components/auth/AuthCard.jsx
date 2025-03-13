/**
 * @file AuthCard.jsx
 * @description A card wrapper component for authentication forms
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * AuthCard component that serves as a wrapper for authentication forms
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The title of the card
 * @param {string} props.description - The description or subtitle of the card
 * @param {React.ReactNode} props.children - The form or content to be wrapped
 * @param {React.ReactNode} props.footer - Optional footer content
 * @returns {JSX.Element} The AuthCard component
 */
export default function AuthCard({ title, description, children, footer }) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold text-center">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground text-center mt-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
      {footer && (
        <CardFooter className="flex justify-center">{footer}</CardFooter>
      )}
    </Card>
  );
}
