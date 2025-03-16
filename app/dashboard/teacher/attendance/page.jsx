"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Search,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  File,
  Plus,
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
 * Mock data for class sessions
 * @type {Array<Object>}
 */
const MOCK_SESSIONS = [
  {
    id: "session1",
    courseId: "course1",
    date: "2023-04-10",
    topic: "Introduction to Programming",
  },
  {
    id: "session2",
    courseId: "course1",
    date: "2023-04-12",
    topic: "Variables and Data Types",
  },
  {
    id: "session3",
    courseId: "course1",
    date: "2023-04-14",
    topic: "Control Structures",
  },
  {
    id: "session4",
    courseId: "course2",
    date: "2023-04-11",
    topic: "Arrays and Linked Lists",
  },
  {
    id: "session5",
    courseId: "course2",
    date: "2023-04-13",
    topic: "Stacks and Queues",
  },
  {
    id: "session6",
    courseId: "course3",
    date: "2023-04-10",
    topic: "Database Fundamentals",
  },
  {
    id: "session7",
    courseId: "course3",
    date: "2023-04-12",
    topic: "SQL Basics",
  },
];

/**
 * Mock data for attendance records
 * @type {Array<Object>}
 */
const MOCK_ATTENDANCE = [
  {
    id: "att1",
    sessionId: "session1",
    studentId: "student1",
    status: "present",
    notes: "",
  },
  {
    id: "att2",
    sessionId: "session1",
    studentId: "student2",
    status: "present",
    notes: "",
  },
  {
    id: "att3",
    sessionId: "session1",
    studentId: "student3",
    status: "absent",
    notes: "Sick",
  },
  {
    id: "att4",
    sessionId: "session1",
    studentId: "student4",
    status: "late",
    notes: "15 minutes late",
  },
  {
    id: "att5",
    sessionId: "session1",
    studentId: "student5",
    status: "excused",
    notes: "Doctor appointment",
  },
  {
    id: "att6",
    sessionId: "session2",
    studentId: "student1",
    status: "present",
    notes: "",
  },
  {
    id: "att7",
    sessionId: "session2",
    studentId: "student2",
    status: "present",
    notes: "",
  },
  {
    id: "att8",
    sessionId: "session2",
    studentId: "student3",
    status: "present",
    notes: "",
  },
  {
    id: "att9",
    sessionId: "session2",
    studentId: "student4",
    status: "absent",
    notes: "No notification",
  },
  {
    id: "att10",
    sessionId: "session2",
    studentId: "student5",
    status: "present",
    notes: "",
  },
  {
    id: "att11",
    sessionId: "session4",
    studentId: "student1",
    status: "present",
    notes: "",
  },
  {
    id: "att12",
    sessionId: "session4",
    studentId: "student3",
    status: "present",
    notes: "",
  },
  {
    id: "att13",
    sessionId: "session4",
    studentId: "student5",
    status: "late",
    notes: "5 minutes late",
  },
];

/**
 * Get attendance status color
 * @param {string} status - Attendance status
 * @returns {string} CSS class for the status
 */
const getStatusColor = (status) => {
  switch (status) {
    case "present":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "absent":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "late":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "excused":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

/**
 * Get formatted date
 * @param {string} dateStr - Date string in ISO format
 * @returns {string} Formatted date
 */
const getFormattedDate = (dateStr) => {
  try {
    return format(new Date(dateStr), "MMMM d, yyyy");
  } catch (e) {
    return dateStr;
  }
};

/**
 * Teacher Attendance Page Component
 * @returns {JSX.Element} The teacher attendance page
 */
export default function TeacherAttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState(
    MOCK_COURSES[0]?.id || ""
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState("");
  const [activeTab, setActiveTab] = useState("record");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  const form = useForm({
    defaultValues: {
      status: "present",
      notes: "",
    },
  });

  /**
   * Filters class sessions based on selected course
   * @returns {Array<Object>} Filtered sessions
   */
  const filteredSessions = MOCK_SESSIONS.filter(
    (session) => session.courseId === selectedCourse
  );

  /**
   * Filters sessions by selected date (if in record tab)
   * @returns {Array<Object>} Filtered sessions by date
   */
  const filteredSessionsByDate = filteredSessions.filter((session) => {
    if (!selectedDate) return true;
    return session.date === format(selectedDate, "yyyy-MM-dd");
  });

  /**
   * Gets attendance records for the selected session
   * @returns {Array<Object>} Attendance records with student details
   */
  const sessionAttendance = selectedSession
    ? MOCK_ATTENDANCE.filter(
        (record) => record.sessionId === selectedSession
      ).map((record) => {
        const student = MOCK_STUDENTS.find((s) => s.id === record.studentId);
        return { ...record, student };
      })
    : [];

  /**
   * Gets all students in the selected course who don't have attendance recorded for the session
   * @returns {Array<Object>} Unrecorded students
   */
  const unrecordedStudents = selectedSession
    ? MOCK_STUDENTS.filter(
        (student) =>
          !MOCK_ATTENDANCE.some(
            (record) =>
              record.sessionId === selectedSession &&
              record.studentId === student.id
          )
      )
    : [];

  /**
   * Handles opening the attendance dialog for a student
   * @param {Object} student - The student to record attendance for
   */
  const handleRecordAttendance = (student) => {
    setCurrentStudent(student);

    // Check if there's an existing record
    const existingRecord = MOCK_ATTENDANCE.find(
      (record) =>
        record.sessionId === selectedSession && record.studentId === student.id
    );

    if (existingRecord) {
      form.reset({
        status: existingRecord.status,
        notes: existingRecord.notes,
      });
    } else {
      form.reset({
        status: "present",
        notes: "",
      });
    }

    setShowAttendanceDialog(true);
  };

  /**
   * Handles form submission for attendance
   * @param {Object} data - Form data containing status and notes
   */
  const onSubmit = (data) => {
    // In a real app, this would call an API to update the attendance
    toast.success(`Attendance saved for ${currentStudent.name}`);
    setShowAttendanceDialog(false);
    form.reset();
  };

  /**
   * Gets attendance statistics for a student
   * @param {string} studentId - ID of the student
   * @returns {Object} Statistics object with counts for each status
   */
  const getStudentAttendanceStats = (studentId) => {
    const courseAttendance = MOCK_ATTENDANCE.filter((record) => {
      const session = MOCK_SESSIONS.find((s) => s.id === record.sessionId);
      return (
        session &&
        session.courseId === selectedCourse &&
        record.studentId === studentId
      );
    });

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: courseAttendance.length,
    };

    courseAttendance.forEach((record) => {
      if (stats[record.status] !== undefined) {
        stats[record.status]++;
      }
    });

    return stats;
  };

  /**
   * Filters students based on search term (for student tab)
   * @returns {Array<Object>} Filtered students
   */
  const filteredStudents = MOCK_STUDENTS.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record">Record Attendance</TabsTrigger>
          <TabsTrigger value="student">Student Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Course and Date</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Course
                  </label>
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
                  <label className="text-sm font-medium mb-1 block">Date</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Select a date"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border mx-auto"
                />
              </div>
            </CardContent>
          </Card>

          {filteredSessionsByDate.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Class Sessions on{" "}
                  {selectedDate
                    ? getFormattedDate(selectedDate.toISOString())
                    : "Selected Date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredSessionsByDate.map((session) => (
                    <Card
                      key={session.id}
                      className={`cursor-pointer ${
                        selectedSession === session.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedSession(session.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{session.topic}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getFormattedDate(session.date)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSession(session.id);
                            }}
                          >
                            {selectedSession === session.id
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No class sessions found for the selected course and date.
                </p>
              </CardContent>
            </Card>
          )}

          {selectedSession && (
            <Tabs defaultValue="recorded" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recorded">Recorded</TabsTrigger>
                <TabsTrigger value="unrecorded">Unrecorded</TabsTrigger>
              </TabsList>

              <TabsContent value="recorded" className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessionAttendance.length > 0 ? (
                          sessionAttendance.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {record.student?.name || "Unknown Student"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(record.status)}
                                >
                                  {record.status.charAt(0).toUpperCase() +
                                    record.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.notes || "—"}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRecordAttendance(record.student)
                                  }
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                              No attendance records found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="unrecorded" className="space-y-4">
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
                        {unrecordedStudents.length > 0 ? (
                          unrecordedStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                {student.name}
                              </TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRecordAttendance(student)
                                  }
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Record
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
                              All students have attendance recorded
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
        </TabsContent>

        <TabsContent value="student" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_COURSES.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredStudents.map((student) => {
                  const stats = getStudentAttendanceStats(student.id);
                  const attendanceRate = stats.total
                    ? (
                        ((stats.present + stats.late) / stats.total) *
                        100
                      ).toFixed(0)
                    : 0;

                  return (
                    <Card key={student.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-medium">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge className="bg-green-100 text-green-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Present: {stats.present}
                            </Badge>
                            <Badge className="bg-red-100 text-red-800">
                              <UserX className="h-3 w-3 mr-1" />
                              Absent: {stats.absent}
                            </Badge>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Late: {stats.late}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              Excused: {stats.excused}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-800">
                              Attendance: {attendanceRate}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        No students found matching the search criteria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Dialog */}
      <Dialog
        open={showAttendanceDialog}
        onOpenChange={setShowAttendanceDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentStudent
                ? `Record Attendance: ${currentStudent.name}`
                : "Record Attendance"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select attendance status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="excused">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
