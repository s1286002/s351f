"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/**
 * Navigation menu component for the dashboard header
 * @param {Object} props - Component props
 * @param {Object} props.user - User data
 * @returns {JSX.Element} Navigation menu component
 */
export default function DashboardNavigationMenu({ user }) {
  const router = useRouter();

  /**
   * Handle user logout
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    try {
      // Show loading toast with a unique ID so we can dismiss it later
      const toastId = toast.loading("Logging out...", {
        className: "bg-white",
      });

      // Call the logout API endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Parse the response
      const data = await response.json();

      // Dismiss the loading toast
      toast.dismiss(toastId);

      // Check if the logout was successful
      if (!response.ok) {
        throw new Error(data.message || "Failed to logout");
      }

      // Clear any user data from localStorage if it exists
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }

      // Show success message
      toast.success(data.message || "Logged out successfully", {
        className: "bg-white",
      });

      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      // Show error message
      toast.error(error.message || "Failed to logout", {
        className: "bg-white",
      });
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* Logo and Title */}
        <div className="flex items-center mr-6">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl mr-3">
            SMS
          </div>
          <span className="text-xl font-bold hidden md:block">
            Student Management System
          </span>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-11 w-11"
            aria-label="Notifications"
          >
            <Bell className="h-7 w-7" />
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-11 w-11 rounded-full"
              >
                <Avatar className="h-11 w-11">
                  <AvatarImage
                    src="/placeholder-avatar.jpg"
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>
                    <User className="h-7 w-7" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
