import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, BookOpen, GraduationCap, Clock } from "lucide-react";

/**
 * Student Dashboard component that displays student-specific information
 * @param {Object} props - Component props
 * @param {Object} props.user - The current user object
 * @returns {JSX.Element} The student dashboard component
 */
export default function StudentDashboard({ user }) {
  // Mock data - would be fetched from API in a real implementation
  const enrolledCourses = [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Computer Science",
      progress: 65,
    },
    { id: 2, code: "MATH201", name: "Calculus II", progress: 78 },
    { id: 3, code: "ENG105", name: "Academic Writing", progress: 42 },
    { id: 4, code: "PHYS101", name: "Physics I", progress: 90 },
  ];

  const upcomingAssignments = [
    {
      id: 1,
      title: "Programming Assignment 3",
      course: "CS101",
      dueDate: "2023-04-15",
    },
    {
      id: 2,
      title: "Essay on Modern Literature",
      course: "ENG105",
      dueDate: "2023-04-18",
    },
    { id: 3, title: "Problem Set 5", course: "MATH201", dueDate: "2023-04-20" },
  ];

  const attendanceStats = {
    present: 85,
    absent: 5,
    late: 10,
  };

  const recentGrades = [
    {
      id: 1,
      assignment: "Programming Assignment 2",
      course: "CS101",
      grade: "A-",
      score: 92,
    },
    { id: 2, title: "Midterm Exam", course: "MATH201", grade: "B+", score: 88 },
    { id: 3, title: "Lab Report 3", course: "PHYS101", grade: "A", score: 95 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {enrolledCourses.length > 0
                ? "Current semester"
                : "No courses enrolled"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Assignments
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingAssignments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Next due:{" "}
              {upcomingAssignments.length > 0
                ? upcomingAssignments[0].dueDate
                : "None"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.present}%</div>
            <Progress value={attendanceStats.present} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.7</div>
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
          <CardDescription>
            Your current semester courses and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="text-sm text-muted-foreground">{course.code}</p>
                </div>
                <div className="flex items-center gap-2 w-1/3">
                  <Progress value={course.progress} className="h-2" />
                  <span className="text-sm w-12">{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
          <CardDescription>
            Assignments due in the next two weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.course}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Due: {assignment.dueDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Grades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
          <CardDescription>Your latest assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGrades.map((grade) => (
              <div key={grade.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{grade.assignment}</p>
                  <p className="text-sm text-muted-foreground">
                    {grade.course}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      grade.score >= 90
                        ? "bg-green-100 text-green-800"
                        : grade.score >= 80
                        ? "bg-blue-100 text-blue-800"
                        : grade.score >= 70
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {grade.grade}
                  </div>
                  <p className="text-sm font-medium">{grade.score}/100</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
