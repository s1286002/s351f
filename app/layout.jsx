import "@/asset/styles/globals.css";

/**
 * Root layout component for the entire application
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Root layout with consistent styling
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Student Management System</title>
        <meta
          name="description"
          content="A comprehensive student management system"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
