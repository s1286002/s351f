/**
 * @file useAttendance.js
 * @description Custom hook for attendance management operations
 */

import { useState, useCallback, useEffect } from "react";
import useDataManagement from "./useDataManagement";
import useCourses from "./useCourses";

// Mock data for development/fallback
const MOCK_ATTENDANCE = [
  {
    _id: "att1",
    studentId: {
      _id: "student1",
      username: "jdoe",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      UserId: "S0001234",
    },
    courseId: {
      _id: "course1",
      courseCode: "C12345678",
      title: "Introduction to Programming",
    },
    date: "2024-04-15",
    status: "present",
    notes: "",
    createdAt: "2024-04-15T10:30:00Z",
    updatedAt: "2024-04-15T10:30:00Z",
  },
  {
    _id: "att2",
    studentId: {
      _id: "student2",
      username: "jsmith",
      firstName: "Jane",
      lastName: "Smith",
      fullName: "Jane Smith",
      UserId: "S0002345",
    },
    courseId: {
      _id: "course1",
      courseCode: "C12345678",
      title: "Introduction to Programming",
    },
    date: "2024-04-15",
    status: "absent",
    notes: "Called in sick",
    createdAt: "2024-04-15T10:31:00Z",
    updatedAt: "2024-04-15T10:31:00Z",
  },
  {
    _id: "att3",
    studentId: {
      _id: "student3",
      username: "mjohnson",
      firstName: "Michael",
      lastName: "Johnson",
      fullName: "Michael Johnson",
      UserId: "S0003456",
    },
    courseId: {
      _id: "course1",
      courseCode: "C12345678",
      title: "Introduction to Programming",
    },
    date: "2024-04-15",
    status: "late",
    notes: "Arrived 10 minutes late",
    createdAt: "2024-04-15T10:32:00Z",
    updatedAt: "2024-04-15T10:32:00Z",
  },
  {
    _id: "att4",
    studentId: {
      _id: "student4",
      username: "awilliams",
      firstName: "Ashley",
      lastName: "Williams",
      fullName: "Ashley Williams",
      UserId: "S0004567",
    },
    courseId: {
      _id: "course2",
      courseCode: "C23456789",
      title: "Data Structures and Algorithms",
    },
    date: "2024-04-15",
    status: "excused",
    notes: "Doctor's appointment",
    createdAt: "2024-04-15T10:33:00Z",
    updatedAt: "2024-04-15T10:33:00Z",
  },
  {
    _id: "att5",
    studentId: {
      _id: "student5",
      username: "bbrown",
      firstName: "Brian",
      lastName: "Brown",
      fullName: "Brian Brown",
      UserId: "S0005678",
    },
    courseId: {
      _id: "course2",
      courseCode: "C23456789",
      title: "Data Structures and Algorithms",
    },
    date: "2024-04-15",
    status: "present",
    notes: "",
    createdAt: "2024-04-15T10:34:00Z",
    updatedAt: "2024-04-15T10:34:00Z",
  },
];

/**
 * Custom hook for attendance management operations
 * @returns {Object} Attendance management operations and state
 */
export default function useAttendance() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const baseHook = useDataManagement("/api/attendance");
  const { data: courses, fetchData: fetchCourses } = useCourses();

  // Fetch courses when the hook is initialized
  useEffect(() => {
    fetchCourses({ limit: 100, sort: "courseCode" }); // Fetch courses with a larger limit to ensure all are available
  }, [fetchCourses]);

  /**
   * Fetch attendance records with filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Fetch result
   */
  const fetchAttendance = useCallback(
    async (options = {}) => {
      try {
        console.log("fetchAttendance options:", options);

        // Pass the options directly to the baseHook.fetchData method
        const result = await baseHook.fetchData(options);

        // Fallback to mock data if API fails in development
        if (!result.success && process.env.NODE_ENV === "development") {
          console.warn("Using mock attendance data");

          // Extract options
          const {
            page = 1,
            limit = 10,
            sort,
            search,
            ...filterParams
          } = options;

          // Filter mock data
          let filteredMockAttendance = [...MOCK_ATTENDANCE];

          // Apply filters from filterParams
          Object.entries(filterParams).forEach(([key, value]) => {
            if (key === "status" && value !== "all") {
              filteredMockAttendance = filteredMockAttendance.filter(
                (attendance) => attendance.status === value
              );
            } else if (key === "courseId" && value !== "all") {
              filteredMockAttendance = filteredMockAttendance.filter(
                (attendance) => attendance.courseId._id === value
              );
            } else if (key === "date" && value) {
              // Format the date to YYYY-MM-DD for comparison
              const filterDate = new Date(value).toISOString().split("T")[0];
              filteredMockAttendance = filteredMockAttendance.filter(
                (attendance) => {
                  const attendanceDate = new Date(attendance.date)
                    .toISOString()
                    .split("T")[0];
                  return attendanceDate === filterDate;
                }
              );
            }
          });

          // Apply search
          if (search) {
            const searchTerm = search.toLowerCase();
            filteredMockAttendance = filteredMockAttendance.filter(
              (attendance) =>
                attendance.studentId.firstName
                  .toLowerCase()
                  .includes(searchTerm) ||
                attendance.studentId.lastName
                  .toLowerCase()
                  .includes(searchTerm) ||
                attendance.studentId.username
                  .toLowerCase()
                  .includes(searchTerm) ||
                attendance.courseId.title.toLowerCase().includes(searchTerm) ||
                attendance.courseId.courseCode
                  .toLowerCase()
                  .includes(searchTerm) ||
                attendance.status.toLowerCase().includes(searchTerm) ||
                (attendance.notes &&
                  attendance.notes.toLowerCase().includes(searchTerm))
            );
          }

          // Apply sorting
          if (sort) {
            const isDesc = sort.startsWith("-");
            const sortField = isDesc ? sort.substring(1) : sort;

            filteredMockAttendance.sort((a, b) => {
              let valueA, valueB;

              if (sortField === "studentId") {
                valueA = `${a.studentId.lastName} ${a.studentId.firstName}`;
                valueB = `${b.studentId.lastName} ${b.studentId.firstName}`;
              } else if (sortField === "courseId") {
                valueA = a.courseId.title;
                valueB = b.courseId.title;
              } else if (sortField === "date") {
                valueA = new Date(a.date);
                valueB = new Date(b.date);
              } else {
                valueA = a[sortField] || "";
                valueB = b[sortField] || "";
              }

              if (valueA < valueB) return isDesc ? 1 : -1;
              if (valueA > valueB) return isDesc ? -1 : 1;
              return 0;
            });
          }

          // Transform the data
          const transformedMockAttendance = filteredMockAttendance.map(
            (attendance) => {
              const transformedAttendance = { ...attendance };

              // Add formatted fields for display
              transformedAttendance.studentName =
                attendance.studentId.fullName ||
                `${attendance.studentId.firstName} ${attendance.studentId.lastName}`;

              // Append the UserId
              transformedAttendance.studentName += ` (${
                attendance.studentId.UserId || ""
              })`;

              transformedAttendance.courseName = `${attendance.courseId.title} (${attendance.courseId.courseCode})`;

              transformedAttendance.formattedDate = new Date(
                attendance.date
              ).toLocaleDateString();

              return transformedAttendance;
            }
          );

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const paginatedAttendance = transformedMockAttendance.slice(
            startIndex,
            startIndex + limit
          );

          return {
            success: true,
            data: paginatedAttendance,
            count: filteredMockAttendance.length,
            pagination: {
              total: filteredMockAttendance.length,
              page: page,
              limit: limit,
              pages: Math.ceil(filteredMockAttendance.length / limit),
              hasNext: page < Math.ceil(filteredMockAttendance.length / limit),
              hasPrev: page > 1,
            },
          };
        }

        return result;
      } catch (err) {
        console.error("Error in fetchAttendance:", err);
        throw err;
      }
    },
    [baseHook]
  );

  /**
   * Get column definitions for attendance table
   * @param {Object} options - Options with callbacks
   * @returns {Array<Object>} Column definitions
   */
  const getAttendanceColumns = useCallback((options = {}) => {
    return [
      {
        field: "studentId",
        header: "Student",
        sortable: true,
        render: (attendance) => attendance.studentId.UserId || "N/A",
      },
      {
        field: "courseId",
        header: "Course",
        sortable: true,
        render: (attendance) => attendance.courseId.courseCode || "N/A",
      },
      {
        field: "date",
        header: "Date",
        sortable: true,
        render: (attendance) =>
          attendance.formattedDate ||
          new Date(attendance.date).toLocaleDateString(),
      },
      {
        field: "status",
        header: "Status",
        sortable: true,
        render: (attendance) => {
          const status = attendance.status || "unknown";
          const formattedStatus =
            status.charAt(0).toUpperCase() + status.slice(1);

          // The actual Badge component will be applied in the DataTable
          return formattedStatus;
        },
      },
      {
        field: "notes",
        header: "Notes",
        sortable: false,
        render: (attendance) => attendance.notes || "-",
      },
    ];
  }, []);

  /**
   * Get form fields for the attendance form
   * @returns {Array<Object>} Form fields
   */
  const getAttendanceFormFields = useCallback(() => {
    return [
      {
        name: "studentId",
        label: "Student",
        type: "select",
        required: true,
        optionsEndpoint: "/api/user?role=student",
        optionLabelKey: (user) =>
          `${user.firstName} ${user.lastName} (${user.username})`,
        optionValueKey: "_id",
        placeholder: "Select student",
      },
      {
        name: "courseId",
        label: "Course",
        type: "select",
        required: true,
        optionsEndpoint: "/api/course",
        optionLabelKey: (course) => `${course.title} (${course.courseCode})`,
        optionValueKey: "_id",
        placeholder: "Select course",
      },
      {
        name: "date",
        label: "Date",
        type: "date",
        required: true,
        placeholder: "Select date",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Present", value: "present" },
          { label: "Absent", value: "absent" },
          { label: "Late", value: "late" },
          { label: "Excused", value: "excused" },
        ],
        placeholder: "Select status",
      },
      {
        name: "notes",
        label: "Notes",
        type: "textarea",
        required: false,
        placeholder: "Enter any notes or comments",
      },
    ];
  }, []);

  /**
   * Get filter options for the attendance data
   * @returns {Array<Object>} Filter options
   */
  const getAttendanceFilterOptions = useCallback(() => {
    // Prepare course options from fetched courses
    const courseOptions = [{ value: "all", label: "All Courses" }];

    if (courses && courses.length > 0) {
      courses.forEach((course) => {
        courseOptions.push({
          value: course._id,
          label: `${course.title} (${course.courseCode})`,
        });
      });
    }

    return [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All Statuses" },
          { value: "present", label: "Present" },
          { value: "absent", label: "Absent" },
          { value: "late", label: "Late" },
          { value: "excused", label: "Excused" },
        ],
        value: statusFilter,
        onChange: setStatusFilter,
      },
      {
        name: "courseId",
        label: "Course",
        type: "select",
        options: courseOptions,
        value: courseFilter,
        onChange: setCourseFilter,
      },
      {
        name: "date",
        label: "Date",
        type: "date",
        value: dateFilter,
        onChange: setDateFilter,
      },
    ];
  }, [statusFilter, courseFilter, dateFilter, courses]);

  return {
    ...baseHook,
    fetchAttendance,
    statusFilter,
    setStatusFilter,
    courseFilter,
    setCourseFilter,
    dateFilter,
    setDateFilter,
    getAttendanceColumns,
    getAttendanceFormFields,
    getAttendanceFilterOptions,
    getItem: baseHook.getItem,
  };
}
