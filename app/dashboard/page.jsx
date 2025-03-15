"use client";

import StudentDashboard from "@/components/dashboard/StudentDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { useUser, userProvider } from "@/hooks/api/useUser";

/**
 * Dashboard page component that displays role-specific content
 * @returns {JSX.Element} The dashboard page component
 */
export default function DashboardPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name}
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Role-specific Dashboard Content */}
      <div className="space-y-6">
        {user?.role === "student" && <StudentDashboard user={user} />}
        {user?.role === "teacher" && <TeacherDashboard user={user} />}
        {user?.role === "admin" && <AdminDashboard user={user} />}
      </div>
    </div>
  );
}
