"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Search, FileEdit, Plus } from "lucide-react";

/**
 * Mock data for courses
 * @type {Array<Object>}
 */
const MOCK_COURSES = [
  {
    id: "course1",
    code: "CS101",
    title: "Introduction to Computer Science",
    students: 28,
  },
  {
    id: "course2",
    code: "CS201",
    title: "Data Structures and Algorithms",
    students: 22,
  },
  { id: "course3", code: "CS301", title: "Database Systems", students: 18 },
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
];

/**
 * Mock data for student grades
 * @type {Array<Object>}
 */
const MOCK_GRADES = [
  {
    id: "grade1",
    assignmentId: "asgn1",
    studentId: "student1",
    studentName: "Alice Johnson",
    score: 85,
    feedback: "Good work!",
  },
  {
    id: "grade2",
    assignmentId: "asgn1",
    studentId: "student2",
    studentName: "Bob Smith",
    score: 92,
    feedback: "Excellent!",
  },
  {
    id: "grade3",
    assignmentId: "asgn1",
    studentId: "student3",
    studentName: "Charlie Brown",
    score: 78,
    feedback: "Needs improvement",
  },
  {
    id: "grade4",
    assignmentId: "asgn2",
    studentId: "student1",
    studentName: "Alice Johnson",
    score: 45,
    feedback: "Review logic concepts",
  },
  {
    id: "grade5",
    assignmentId: "asgn2",
    studentId: "student2",
    studentName: "Bob Smith",
    score: 48,
    feedback: "Good effort",
  },
  {
    id: "grade6",
    assignmentId: "asgn2",
    studentId: "student3",
    studentName: "Charlie Brown",
    score: 42,
    feedback: "Study more",
  },
];

/**
 * Mock data for students
 * @type {Array<Object>}
 */
const MOCK_STUDENTS = [
  { id: "student1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "student2", name: "Bob Smith", email: "bob@example.com" },
  { id: "student3", name: "Charlie Brown", email: "charlie@example.com" },
  { id: "student4", name: "David Miller", email: "david@example.com" },
  { id: "student5", name: "Eva Garcia", email: "eva@example.com" },
];

/**
 * Teacher Grading Page Component
 * @returns {JSX.Element} The teacher grading page
 */
export default function TeacherGradingPage() {
  const [selectedCourse, setSelectedCourse] = useState(
    MOCK_COURSES[0]?.id || ""
  );
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  const form = useForm({
    defaultValues: {
      score: "",
      feedback: "",
    },
  });

  /**
   * Filters assignments based on selected course
   * @returns {Array<Object>} Filtered assignments
   */
  const filteredAssignments = MOCK_ASSIGNMENTS.filter(
    (assignment) => assignment.courseId === selectedCourse
  );

  /**
   * Filters grades based on selected assignment and search term
   * @returns {Array<Object>} Filtered grades
   */
  const filteredGrades = MOCK_GRADES.filter(
    (grade) =>
      grade.assignmentId === selectedAssignment &&
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Handles opening the grade dialog for a student
   * @param {Object} student - The student to grade
   */
  const handleGradeStudent = (student) => {
    setCurrentStudent(student);

    // Find existing grade for this student and assignment
    const existingGrade = MOCK_GRADES.find(
      (g) => g.studentId === student.id && g.assignmentId === selectedAssignment
    );

    if (existingGrade) {
      form.reset({
        score: existingGrade.score.toString(),
        feedback: existingGrade.feedback,
      });
    } else {
      form.reset({
        score: "",
        feedback: "",
      });
    }

    setIsGradeDialogOpen(true);
  };

  /**
   * Handles form submission for grading
   * @param {Object} data - Form data containing score and feedback
   */
  const onSubmit = (data) => {
    // In a real app, this would call an API to update the grade
    toast.success(`Grade saved for ${currentStudent.name}`);
    setIsGradeDialogOpen(false);
    form.reset();
  };

  /**
   * Gets students who haven't been graded for the selected assignment
   * @returns {Array<Object>} Ungraded students
   */
  const ungradedStudents = MOCK_STUDENTS.filter(
    (student) =>
      !MOCK_GRADES.some(
        (grade) =>
          grade.studentId === student.id &&
          grade.assignmentId === selectedAssignment
      )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Grading</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Course and Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Course</label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_COURSES.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Assignment
                </label>
                <Select
                  value={selectedAssignment}
                  onValueChange={setSelectedAssignment}
                  disabled={!selectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAssignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title} ({assignment.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedAssignment && (
          <Tabs defaultValue="graded" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="graded">Graded Students</TabsTrigger>
              <TabsTrigger value="ungraded">Ungraded Students</TabsTrigger>
            </TabsList>

            <TabsContent value="graded" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrades.length > 0 ? (
                        filteredGrades.map((grade) => {
                          const student = MOCK_STUDENTS.find(
                            (s) => s.id === grade.studentId
                          );
                          if (!student) return null;

                          return (
                            <TableRow key={grade.id}>
                              <TableCell className="font-medium">
                                {student.name}
                              </TableCell>
                              <TableCell>{grade.score}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {grade.feedback}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGradeStudent(student)}
                                >
                                  <FileEdit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No graded students found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ungraded" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ungradedStudents.length > 0 ? (
                        ungradedStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleGradeStudent(student)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Grade
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            All students have been graded
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentStudent
                ? `Grade: ${currentStudent.name}`
                : "Grade Student"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter score"
                        {...field}
                        min="0"
                        max={
                          selectedAssignment
                            ? MOCK_ASSIGNMENTS.find(
                                (a) => a.id === selectedAssignment
                              )?.totalPoints
                            : 100
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter feedback" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Save Grade</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
