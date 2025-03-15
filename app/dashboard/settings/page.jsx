"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/api/useUser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldAlert, KeyRound } from "lucide-react";

/**
 * Settings page component
 * @returns {JSX.Element} Settings page
 */
export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, changePassword } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change form submission
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        toast.success("Password Updated", {
          description: "Your password has been changed successfully.",
        });

        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error("Error", {
          description:
            result.error || "Failed to change password. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
      console.error("Password change error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Password
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  size="sm"
                  disabled
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Security
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handleChange}
                    className={
                      errors.currentPassword ? "border-destructive" : ""
                    }
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                    className={errors.newPassword ? "border-destructive" : ""}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                    className={
                      errors.confirmPassword ? "border-destructive" : ""
                    }
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
