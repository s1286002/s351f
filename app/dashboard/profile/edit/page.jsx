"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/api/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Profile edit page component
 * @returns {JSX.Element} Profile edit page
 */
export default function ProfileEditPage() {
  const router = useRouter();
  const { user, loading, updateUserProfile } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(null);

  // Initialize form data when user data is loaded
  if (user && !formData) {
    const initialData = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
      // Role-specific fields
      ...(user.role === "student" && {
        phone: user.profileData?.phone || "",
        address: user.profileData?.address || "",
        dateOfBirth: user.profileData?.dateOfBirth
          ? new Date(user.profileData.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.profileData?.gender || "",
      }),
      ...(user.role === "teacher" && {
        contactPhone: user.profileData?.contactPhone || "",
        bio: user.profileData?.bio || "",
      }),
    };
    setFormData(initialData);
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select input changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare update data based on user role
      let updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
      };

      // Add role-specific profile data
      if (user.role === "student") {
        updateData.profileData = {
          ...user.profileData, // Keep existing data that shouldn't be changed
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          // Preserve fields that shouldn't be editable
          enrollmentStatus: user.profileData.enrollmentStatus,
          departmentId:
            user.profileData.departmentId._id || user.profileData.departmentId,
          programId:
            user.profileData.programId._id || user.profileData.programId,
          year: user.profileData.year,
        };
      } else if (user.role === "teacher") {
        updateData.profileData = {
          ...user.profileData, // Keep existing data that shouldn't be changed
          contactPhone: formData.contactPhone,
          bio: formData.bio,
          // Preserve fields that shouldn't be editable
          status: user.profileData.status,
        };
      }

      const result = await updateUserProfile(updateData);

      if (result.success) {
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
        });
        router.push("/dashboard/profile");
      } else {
        toast.error("Error", {
          description:
            result.error || "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src="/placeholder-avatar.jpg"
                    alt={user?.firstName}
                  />
                  <AvatarFallback className="text-4xl">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" disabled>
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground">
                  (Photo upload not available yet)
                </p>
              </div>

              <Separator orientation="vertical" className="hidden md:block" />

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                {user.role === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          handleSelectChange("gender", value)
                        }
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {user.role === "teacher" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Biography</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={5}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {user.role === "student" && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Information (Read Only)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrollmentStatus">Enrollment Status</Label>
                <Input
                  id="enrollmentStatus"
                  value={user.profileData.enrollmentStatus?.replace("_", " ")}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" value={user.profileData.year} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={user.profileData.departmentId?.name || "Unknown"}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={user.profileData.programId?.name || "Unknown"}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        )}

        {user.role === "teacher" && (
          <Card>
            <CardHeader>
              <CardTitle>Teaching Status (Read Only)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="teachingStatus">Status</Label>
                <Input
                  id="teachingStatus"
                  value={user.profileData.status}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Account Information (Read Only)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" value={user.UserId} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user.role} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Input id="status" value={user.status} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastLogin">Last Login</Label>
              <Input
                id="lastLogin"
                value={
                  user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "Never"
                }
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/profile")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
