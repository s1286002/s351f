"use client";

import { Button } from "@/components/ui/button";
import UserInfoCard from "@/components/profile/UserInfoCard";
import StudentProfile from "@/components/profile/StudentProfile";
import TeacherProfile from "@/components/profile/TeacherProfile";
import { useUser } from "@/hooks/api/useUser";
import Link from "next/link";

/**
 * Profile page component that displays user information based on their role
 * @returns {JSX.Element} The profile page component
 */
export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button asChild>
          <Link href="/dashboard/profile/edit">Edit Profile</Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Combined Personal and Account Information */}
        <UserInfoCard user={user} />

        {/* Role-specific Information */}
        {user?.role === "student" && <StudentProfile user={user} />}
        {user?.role === "teacher" && <TeacherProfile user={user} />}
      </div>
    </div>
  );
}
