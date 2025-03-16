"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Calendar,
  Users,
  BookOpen,
  FileText,
  ChevronRight,
} from "lucide-react";

/**
 * Mock data for courses
 * @type {Array<Object>}
 */
const MOCK_COURSES = [
  {
    id: "course1",
    code: "CS101",
    title: "Introduction to Computer Science",
    description:
      "An introductory course covering the fundamentals of computer science, programming basics, and computational thinking.",
    students: 28,
    startDate: "2023-03-15",
    endDate: "2023-06-30",
    department: "Computer Science",
    credits: 3,
    schedule: "Mon, Wed 10:00 AM - 11:30 AM",
  },
  {
    id: "course2",
    code: "CS201",
    title: "Data Structures and Algorithms",
    description:
      "A comprehensive course on data structures, algorithm design, and analysis of computational efficiency.",
    students: 22,
    startDate: "2023-03-15",
    endDate: "2023-06-30",
    department: "Computer Science",
    credits: 4,
    schedule: "Tue, Thu 1:00 PM - 2:30 PM",
  },
  {
    id: "course3",
    code: "CS301",
    title: "Database Systems",
    description:
      "Database design principles, SQL, transaction processing, and database management systems.",
    students: 18,
    startDate: "2023-03-15",
    endDate: "2023-06-30",
    department: "Computer Science",
    credits: 3,
    schedule: "Mon, Fri 2:00 PM - 3:30 PM",
  },
  {
    id: "course4",
    code: "CS350",
    title: "Web Development",
    description:
      "Front-end and back-end development technologies, HTML, CSS, JavaScript, and server-side programming.",
    students: 25,
    startDate: "2023-03-15",
    endDate: "2023-06-30",
    department: "Computer Science",
    credits: 3,
    schedule: "Wed, Fri 10:00 AM - 11:30 AM",
  },
  {
    id: "course5",
    code: "CS401",
    title: "Artificial Intelligence",
    description:
      "Foundations of AI, machine learning, neural networks, and applications in various domains.",
    students: 20,
    startDate: "2023-03-15",
    endDate: "2023-06-30",
    department: "Computer Science",
    credits: 4,
    schedule: "Tue, Thu 10:00 AM - 11:30 AM",
  },
];

/**
 * Mock data for students
 * @type {Array<Object>}
 */
const MOCK_STUDENTS = [
  {
    id: "student1",
    name: "Alice Johnson",
    email: "alice@example.com",
    year: "Junior",
    gpa: 3.8,
    major: "Computer Science",
  },
  {
    id: "student2",
    name: "Bob Smith",
    email: "bob@example.com",
    year: "Senior",
    gpa: 3.5,
    major: "Computer Science",
  },
  {
    id: "student3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    year: "Sophomore",
    gpa: 3.2,
    major: "Mathematics",
  },
  {
    id: "student4",
    name: "David Miller",
    email: "david@example.com",
    year: "Junior",
    gpa: 3.9,
    major: "Computer Science",
  },
  {
    id: "student5",
    name: "Eva Garcia",
    email: "eva@example.com",
    year: "Senior",
    gpa: 3.7,
    major: "Information Systems",
  },
  {
    id: "student6",
    name: "Frank Thomas",
    email: "frank@example.com",
    year: "Freshman",
    gpa: 3.4,
    major: "Computer Science",
  },
  {
    id: "student7",
    name: "Grace Lee",
    email: "grace@example.com",
    year: "Junior",
    gpa: 3.6,
    major: "Data Science",
  },
  {
    id: "student8",
    name: "Henry Wilson",
    email: "henry@example.com",
    year: "Senior",
    gpa: 3.3,
    major: "Computer Engineering",
  },
];

/**
 * Mock enrollment data linking students to courses
 * @type {Array<Object>}
 */
const MOCK_ENROLLMENTS = [
  {
    courseId: "course1",
    studentId: "student1",
    enrollmentDate: "2023-02-20",
    status: "Active",
  },
  {
    courseId: "course1",
    studentId: "student2",
    enrollmentDate: "2023-02-21",
    status: "Active",
  },
  {
    courseId: "course1",
    studentId: "student3",
    enrollmentDate: "2023-02-22",
    status: "Active",
  },
  {
    courseId: "course1",
    studentId: "student6",
    enrollmentDate: "2023-02-19",
    status: "Active",
  },
  {
    courseId: "course1",
    studentId: "student7",
    enrollmentDate: "2023-02-20",
    status: "Active",
  },

  {
    courseId: "course2",
    studentId: "student1",
    enrollmentDate: "2023-02-18",
    status: "Active",
  },
  {
    courseId: "course2",
    studentId: "student4",
    enrollmentDate: "2023-02-19",
    status: "Active",
  },
  {
    courseId: "course2",
    studentId: "student5",
    enrollmentDate: "2023-02-20",
    status: "Active",
  },

  {
    courseId: "course3",
    studentId: "student2",
    enrollmentDate: "2023-02-21",
    status: "Active",
  },
  {
    courseId: "course3",
    studentId: "student3",
    enrollmentDate: "2023-02-22",
    status: "Active",
  },
  {
    courseId: "course3",
    studentId: "student8",
    enrollmentDate: "2023-02-20",
    status: "Active",
  },

  {
    courseId: "course4",
    studentId: "student4",
    enrollmentDate: "2023-02-19",
    status: "Active",
  },
  {
    courseId: "course4",
    studentId: "student5",
    enrollmentDate: "2023-02-20",
    status: "Active",
  },
  {
    courseId: "course4",
    studentId: "student6",
    enrollmentDate: "2023-02-21",
    status: "Active",
  },
  {
    courseId: "course4",
    studentId: "student7",
    enrollmentDate: "2023-02-22",
    status: "Active",
  },

  {
    courseId: "course5",
    studentId: "student1",
    enrollmentDate: "2023-02-18",
    status: "Active",
  },
  {
    courseId: "course5",
    studentId: "student5",
    enrollmentDate: "2023-02-19",
    status: "Active",
  },
  {
    courseId: "course5",
    studentId: "student8",
    enrollmentDate: "2023-02-20",
    status: "Active",
  },
];

/**
 * Mock data for assignments
 * @type {Array<Object>}
 */
const MOCK_ASSIGNMENTS = [
  {
    id: "asgn1",
    courseId: "course1",
    title: "Programming Basics",
    dueDate: "2023-04-15",
    totalPoints: 100,
    type: "Assignment",
  },
  {
    id: "asgn2",
    courseId: "course1",
    title: "Logic and Problem Solving",
    dueDate: "2023-04-30",
    totalPoints: 50,
    type: "Quiz",
  },
  {
    id: "asgn3",
    courseId: "course2",
    title: "Array Implementation",
    dueDate: "2023-04-20",
    totalPoints: 100,
    type: "Assignment",
  },
  {
    id: "asgn4",
    courseId: "course2",
    title: "Graph Algorithms",
    dueDate: "2023-05-05",
    totalPoints: 150,
    type: "Project",
  },
  {
    id: "asgn5",
    courseId: "course3",
    title: "ER Diagrams",
    dueDate: "2023-04-18",
    totalPoints: 75,
    type: "Assignment",
  },
  {
    id: "asgn6",
    courseId: "course3",
    title: "SQL Queries",
    dueDate: "2023-05-10",
    totalPoints: 100,
    type: "Quiz",
  },
  {
    id: "asgn7",
    courseId: "course4",
    title: "HTML/CSS Layout",
    dueDate: "2023-04-12",
    totalPoints: 100,
    type: "Assignment",
  },
  {
    id: "asgn8",
    courseId: "course4",
    title: "JavaScript Project",
    dueDate: "2023-05-01",
    totalPoints: 150,
    type: "Project",
  },
  {
    id: "asgn9",
    courseId: "course5",
    title: "Neural Networks Basics",
    dueDate: "2023-04-25",
    totalPoints: 100,
    type: "Assignment",
  },
  {
    id: "asgn10",
    courseId: "course5",
    title: "Machine Learning Model",
    dueDate: "2023-05-15",
    totalPoints: 200,
    type: "Project",
  },
];

/**
 * Format date string to a more readable format
 * @param {string} dateString - Date string in ISO format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Teacher Course Page Component
 * @returns {JSX.Element} The teacher course page
 */
export default function TeacherCoursePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  /**
   * Filters courses based on search term
   * @returns {Array<Object>} Filtered courses
   */
  const filteredCourses = MOCK_COURSES.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Gets students enrolled in a specific course
   * @param {string} courseId - The course ID
   * @returns {Array<Object>} Enrolled students with details
   */
  const getEnrolledStudents = (courseId) => {
    return MOCK_ENROLLMENTS.filter(
      (enrollment) => enrollment.courseId === courseId
    ).map((enrollment) => {
      const student = MOCK_STUDENTS.find((s) => s.id === enrollment.studentId);
      return { ...enrollment, student };
    });
  };

  /**
   * Gets assignments for a specific course
   * @param {string} courseId - The course ID
   * @returns {Array<Object>} Course assignments
   */
  const getCourseAssignments = (courseId) => {
    return MOCK_ASSIGNMENTS.filter(
      (assignment) => assignment.courseId === courseId
    );
  };

  /**
   * Handles viewing course details
   * @param {Object} course - The course to view
   */
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setActiveTab("overview");
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="mb-1">
                  {course.code}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {course.students} Students
                </Badge>
              </div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDate(course.startDate)} - {formatDate(course.endDate)}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <BookOpen className="mr-1 h-4 w-4" />
                  {course.credits} Credits
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-1 h-4 w-4" />
                  {course.department}
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => handleViewCourse(course)}
              >
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {filteredCourses.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No courses found matching your search.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Details Dialog */}
      {selectedCourse && (
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="outline">{selectedCourse.code}</Badge>
                {selectedCourse.title}
              </DialogTitle>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[60vh] mt-2 rounded-md border p-4">
                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Description</h3>
                    <p className="mt-1 text-muted-foreground">
                      {selectedCourse.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">
                          Course Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Department:
                            </span>
                            <span className="font-medium">
                              {selectedCourse.department}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Credits:
                            </span>
                            <span className="font-medium">
                              {selectedCourse.credits}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Schedule:
                            </span>
                            <span className="font-medium">
                              {selectedCourse.schedule}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Enrolled:
                            </span>
                            <span className="font-medium">
                              {selectedCourse.students} students
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">
                          Course Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Start Date:
                            </span>
                            <span className="font-medium">
                              {formatDate(selectedCourse.startDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              End Date:
                            </span>
                            <span className="font-medium">
                              {formatDate(selectedCourse.endDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Duration:
                            </span>
                            <span className="font-medium">15 weeks</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="students" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Enrolled Students</h3>
                    <p className="text-sm text-muted-foreground">
                      Total: {getEnrolledStudents(selectedCourse.id).length}{" "}
                      students
                    </p>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Major</TableHead>
                        <TableHead>GPA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getEnrolledStudents(selectedCourse.id).map(
                        (enrollment) => (
                          <TableRow key={enrollment.studentId}>
                            <TableCell className="font-medium">
                              {enrollment.student?.name || "Unknown Student"}
                            </TableCell>
                            <TableCell>{enrollment.student?.email}</TableCell>
                            <TableCell>{enrollment.student?.year}</TableCell>
                            <TableCell>{enrollment.student?.major}</TableCell>
                            <TableCell>{enrollment.student?.gpa}</TableCell>
                          </TableRow>
                        )
                      )}

                      {getEnrolledStudents(selectedCourse.id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No students enrolled in this course
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Course Assignments</h3>
                    <p className="text-sm text-muted-foreground">
                      Total: {getCourseAssignments(selectedCourse.id).length}{" "}
                      assignments
                    </p>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCourseAssignments(selectedCourse.id).map(
                        (assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">
                              {assignment.title}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  assignment.type === "Assignment"
                                    ? "bg-blue-100 text-blue-800"
                                    : assignment.type === "Quiz"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {assignment.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(assignment.dueDate)}
                            </TableCell>
                            <TableCell>{assignment.totalPoints} pts</TableCell>
                          </TableRow>
                        )
                      )}

                      {getCourseAssignments(selectedCourse.id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No assignments created for this course
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  <div className="flex justify-center">
                    <Button variant="outline" className="w-full md:w-auto">
                      <FileText className="mr-2 h-4 w-4" />
                      Go to Grading Page
                    </Button>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
