"use client";

import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Users,
  Settings,
  Database,
  Building,
  GraduationCap,
  ClipboardList,
  UserCheck,
  User,
} from "lucide-react";
import DashboardNavigationMenu from "@/components/dashboard/NavigationMenu";
import Sidebar from "@/components/dashboard/Sidebar";
import { UserProvider, useUser } from "@/hooks/api/useUser";

/**
 * Dashboard content component that uses the user context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Dashboard content
 */
function DashboardContent({ children }) {
  const { user, loading } = useUser();

  // Navigation items based on user role
  const getNavigationItems = (role) => {
    // Common items for student and teacher roles
    const commonItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Profile", href: "/dashboard/profile", icon: User },
      { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    // Admin has a different set of common items to avoid duplication
    const adminCommonItems = [
      { name: "Profile", href: "/dashboard/profile", icon: User },
      { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    const roleSpecificItems = {
      student: [
        {
          name: "Courses",
          href: "/dashboard/student/course",
          icon: BookOpen,
        },
      ],
      teacher: [
        { name: "Courses", href: "/dashboard/teacher/course", icon: BookOpen },
        { name: "Grading", href: "/dashboard/teacher/grading", icon: FileText },
        {
          name: "Attendance",
          href: "/dashboard/teacher/attendance",
          icon: Users,
        },
      ],
      admin: [
        {
          name: "Dashboard Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        { name: "Reports", href: "/dashboard/reports", icon: FileText },
        {
          name: "Data Management",
          href: "/dashboard/data",
          icon: Database,
          submenu: [
            { name: "Users", href: "/dashboard/data/users", icon: Users },
            {
              name: "Departments",
              href: "/dashboard/data/departments",
              icon: Building,
            },
            {
              name: "Programs",
              href: "/dashboard/data/programs",
              icon: GraduationCap,
            },
            {
              name: "Courses",
              href: "/dashboard/data/courses",
              icon: BookOpen,
            },
            {
              name: "Academic Records",
              href: "/dashboard/data/academic",
              icon: ClipboardList,
            },
            {
              name: "Attendance",
              href: "/dashboard/data/attendance",
              icon: UserCheck,
            },
          ],
        },
      ],
    };

    // Use different common items for admin role
    return role === "admin"
      ? [...adminCommonItems, ...roleSpecificItems[role]]
      : [...commonItems, ...(roleSpecificItems[role] || [])];
  };

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

  const navigationItems = getNavigationItems(user?.role);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navigation */}
      <DashboardNavigationMenu user={user} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <Sidebar user={user} navigationItems={navigationItems} />

        {/* Main Content */}
        <main className="relative flex-1 overflow-y-auto p-4">
          {/* Sidebar - Mobile (positioned absolutely) */}
          <div className="absolute top-0 left-4 z-10 md:hidden">
            <Sidebar
              user={user}
              navigationItems={navigationItems}
              isMobile={true}
            />
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Shared layout component for all dashboard pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Dashboard layout
 */
export default function DashboardLayout({ children }) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}
