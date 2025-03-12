import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

/**
 * Homepage component for the Student Management System
 * @returns {JSX.Element} The homepage component
 */
const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <Card
          className={cn(
            "w-full max-w-md",
            "transition-all duration-200 hover:shadow-lg"
          )}
        >
          <CardHeader className="space-y-1 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome to Student Management System
            </h2>
            <p className="text-sm text-muted-foreground">
              Please login or register to continue
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/auth/register">Register</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
