import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, BookOpen, Users, ClipboardCheck } from "lucide-react";

/**
 * Teacher Dashboard component that displays teacher-specific information
 * @param {Object} props - Component props
 * @param {Object} props.user - The current user object
 * @returns {JSX.Element} The teacher dashboard component
 */
export default function TeacherDashboard({ user }) {
  // Mock data - would be fetched from API in a real implementation
  const coursesTaught = [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Computer Science",
      students: 35,
      sections: 2,
    },
    {
      id: 2,
      code: "CS301",
      name: "Data Structures and Algorithms",
      students: 28,
      sections: 1,
    },
    {
      id: 3,
      code: "CS401",
      name: "Advanced Programming",
      students: 22,
      sections: 1,
    },
  ];

  const upcomingClasses = [
    {
      id: 1,
      course: "CS101",
      section: "A",
      time: "10:00 AM - 11:30 AM",
      day: "Monday",
      room: "H-301",
    },
    {
      id: 2,
      course: "CS301",
      section: "B",
      time: "1:00 PM - 2:30 PM",
      day: "Tuesday",
      room: "H-405",
    },
    {
      id: 3,
      course: "CS101",
      section: "B",
      time: "3:00 PM - 4:30 PM",
      day: "Wednesday",
      room: "H-301",
    },
  ];

  const pendingGrading = [
    {
      id: 1,
      title: "Programming Assignment 3",
      course: "CS101",
      submissions: 32,
      dueDate: "2023-04-10",
    },
    {
      id: 2,
      title: "Midterm Exam",
      course: "CS301",
      submissions: 28,
      dueDate: "2023-04-05",
    },
    {
      id: 3,
      title: "Project Proposal",
      course: "CS401",
      submissions: 20,
      dueDate: "2023-04-12",
    },
  ];

  const studentPerformance = [
    {
      id: 1,
      course: "CS101",
      averageGrade: 78,
      highestGrade: 98,
      lowestGrade: 45,
    },
    {
      id: 2,
      course: "CS301",
      averageGrade: 82,
      highestGrade: 95,
      lowestGrade: 60,
    },
    {
      id: 3,
      course: "CS401",
      averageGrade: 85,
      highestGrade: 97,
      lowestGrade: 72,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesTaught.length}</div>
            <p className="text-xs text-muted-foreground">
              {coursesTaught.reduce((acc, course) => acc + course.sections, 0)}{" "}
              sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coursesTaught.reduce((acc, course) => acc + course.students, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Classes
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingClasses.length}</div>
            <p className="text-xs text-muted-foreground">
              Next:{" "}
              {upcomingClasses.length > 0
                ? `${upcomingClasses[0].day}, ${upcomingClasses[0].time}`
                : "None"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grading
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingGrading.reduce((acc, item) => acc + item.submissions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Submissions to grade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Taught */}
      <Card>
        <CardHeader>
          <CardTitle>Courses Taught</CardTitle>
          <CardDescription>Your current semester teaching load</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coursesTaught.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="text-sm text-muted-foreground">{course.code}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {course.students} students
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.sections}{" "}
                      {course.sections > 1 ? "sections" : "section"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>Your teaching schedule for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {cls.course} (Section {cls.section})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {cls.day}, {cls.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Room: {cls.room}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Grading */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Grading</CardTitle>
          <CardDescription>
            Assignments and exams that need grading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingGrading.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {item.submissions} submissions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {item.dueDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>Grade statistics by course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {studentPerformance.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{course.course}</p>
                  <p className="text-sm">Avg: {course.averageGrade}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={course.averageGrade} className="h-2" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low: {course.lowestGrade}%</span>
                  <span>High: {course.highestGrade}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
