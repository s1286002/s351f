"use client";
// basic structure for the course page
// abstract the course card component
// component should be in components/dashboard/student/course-card.jsx

// course card component show the course code, title, description, credits, department, semester, status, and grade(if available)

// no need for pagination

// sort the courses by semester and year

// put the hook in hook/api/useStudentCourses.jsx

// call the api from the hook

// api is /api/academic/?studentId=studentId

// use the api to fetch the courses in the useStudentCourses hook

// pass the courses to the course card component

// use the course card component to display the courses

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CourseCard from "@/components/dashboard/student/course-card";
import useStudentCourses from "@/hooks/api/useStudentCourses";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

/**
 * StudentCoursePage component displays all courses for a student
 * @returns {JSX.Element} - Rendered component
 */
export default function StudentCoursePage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check authentication and get user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current user data
        const response = await axios.get("/api/auth/me");

        if (response.data && response.data.user) {
          // Set student ID from user data
          setStudentId(response.data.user._id);
        } else {
          // Redirect to login if no user data
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthError(error.message || "Authentication failed");
        // Redirect to login on auth error
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch courses using the custom hook
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = useStudentCourses(studentId);

  // Determine overall loading state
  const isLoading = loading || coursesLoading;
  // Determine overall error state
  const error = authError || coursesError;

  // Group courses by semester and year
  const groupedCourses = courses.reduce((acc, course) => {
    const key = `${course.semester} ${course.year}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(course);
    return acc;
  }, {});

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Courses</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="mb-4">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Courses</h1>
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">
              Error loading courses: {error}. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>

      {Object.keys(groupedCourses).length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No courses found.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedCourses).map(([term, termCourses]) => (
          <div key={term} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{term}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {termCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
