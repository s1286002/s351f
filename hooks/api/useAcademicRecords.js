/**
 * @file useAcademicRecords.js
 * @description Custom hook for academic record management operations
 */

import { useState, useCallback } from "react";
import useDataManagement from "./useDataManagement";

// Mock data for development/fallback
const MOCK_ACADEMIC_RECORDS = [
  {
    _id: "acad1",
    studentId: {
      _id: "student1",
      username: "jdoe",
      firstName: "John",
      lastName: "Doe",
      UserId: "S0001234",
    },
    courseId: {
      _id: "course1",
      courseCode: "C12345678",
      title: "Introduction to Programming",
    },
    semester: "Fall",
    academicYear: "2023-2024",
    registrationStatus: "completed",
    grade: {
      midterm: 85,
      final: 90,
      assignments: [
        { name: "Assignment 1", score: 92, weight: 20 },
        { name: "Assignment 2", score: 88, weight: 20 },
      ],
      totalScore: 89,
      letterGrade: "B+",
    },
    createdAt: "2023-09-15T10:30:00Z",
    updatedAt: "2023-12-20T14:15:00Z",
  },
  {
    _id: "acad2",
    studentId: {
      _id: "student2",
      username: "jsmith",
      firstName: "Jane",
      lastName: "Smith",
      UserId: "S0002345",
    },
    courseId: {
      _id: "course1",
      courseCode: "C12345678",
      title: "Introduction to Programming",
    },
    semester: "Fall",
    academicYear: "2023-2024",
    registrationStatus: "completed",
    grade: {
      midterm: 92,
      final: 95,
      assignments: [
        { name: "Assignment 1", score: 95, weight: 20 },
        { name: "Assignment 2", score: 98, weight: 20 },
      ],
      totalScore: 95,
      letterGrade: "A",
    },
    createdAt: "2023-09-15T10:35:00Z",
    updatedAt: "2023-12-20T14:20:00Z",
  },
  {
    _id: "acad3",
    studentId: {
      _id: "student3",
      username: "mjohnson",
      firstName: "Michael",
      lastName: "Johnson",
      UserId: "S0003456",
    },
    courseId: {
      _id: "course2",
      courseCode: "C23456789",
      title: "Data Structures and Algorithms",
    },
    semester: "Spring",
    academicYear: "2023-2024",
    registrationStatus: "registered",
    grade: null,
    createdAt: "2024-01-10T09:30:00Z",
    updatedAt: "2024-01-10T09:30:00Z",
  },
  {
    _id: "acad4",
    studentId: {
      _id: "student1",
      username: "jdoe",
      firstName: "John",
      lastName: "Doe",
      UserId: "S0001234",
    },
    courseId: {
      _id: "course3",
      courseCode: "C34567890",
      title: "Calculus I",
    },
    semester: "Fall",
    academicYear: "2023-2024",
    registrationStatus: "failed",
    grade: {
      midterm: 60,
      final: 55,
      assignments: [
        { name: "Assignment 1", score: 70, weight: 20 },
        { name: "Assignment 2", score: 65, weight: 20 },
      ],
      totalScore: 58,
      letterGrade: "F",
    },
    createdAt: "2023-09-15T10:40:00Z",
    updatedAt: "2023-12-20T14:30:00Z",
  },
  {
    _id: "acad5",
    studentId: {
      _id: "student4",
      username: "awilliams",
      firstName: "Ashley",
      lastName: "Williams",
      UserId: "S0004567",
    },
    courseId: {
      _id: "course2",
      courseCode: "C23456789",
      title: "Data Structures and Algorithms",
    },
    semester: "Fall",
    academicYear: "2023-2024",
    registrationStatus: "withdrawn",
    grade: null,
    createdAt: "2023-09-15T10:45:00Z",
    updatedAt: "2023-10-05T11:30:00Z",
  },
];

/**
 * Custom hook for academic record management operations
 * @returns {Object} Academic record management operations and state
 */
export default function useAcademicRecords() {
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const baseHook = useDataManagement("/api/academic");

  /**
   * Fetch academic records with filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Fetch result
   */
  const fetchAcademicRecords = useCallback(
    async (options = {}) => {
      try {
        console.log("Fetching academic records with options:", options);

        // Pass the options directly to the baseHook.fetchData method
        const result = await baseHook.fetchData(options);

        // Fallback to mock data if API fails in development
        if (!result.success && process.env.NODE_ENV === "development") {
          console.warn("Using mock academic record data");

          // Extract filters
          const { page = 1, limit = 10, sort, search, ...filters } = options;

          // Filter mock data
          let filteredMockRecords = [...MOCK_ACADEMIC_RECORDS];

          // Apply filters
          Object.entries(filters).forEach(([key, value]) => {
            if (key === "semester" && value !== "all") {
              filteredMockRecords = filteredMockRecords.filter(
                (record) => record.semester === value
              );
            } else if (key === "academicYear" && value !== "all") {
              filteredMockRecords = filteredMockRecords.filter(
                (record) => record.academicYear === value
              );
            } else if (key === "registrationStatus" && value !== "all") {
              filteredMockRecords = filteredMockRecords.filter(
                (record) => record.registrationStatus === value
              );
            } else if (key === "courseId" && value !== "all") {
              filteredMockRecords = filteredMockRecords.filter(
                (record) => record.courseId._id === value
              );
            } else if (key === "studentId" && value !== "all") {
              filteredMockRecords = filteredMockRecords.filter(
                (record) => record.studentId._id === value
              );
            }
          });

          // Apply search
          if (search) {
            const searchTerm = search.toLowerCase();
            filteredMockRecords = filteredMockRecords.filter(
              (record) =>
                record.studentId.firstName.toLowerCase().includes(searchTerm) ||
                record.studentId.lastName.toLowerCase().includes(searchTerm) ||
                record.studentId.username.toLowerCase().includes(searchTerm) ||
                record.courseId.title.toLowerCase().includes(searchTerm) ||
                record.courseId.courseCode.toLowerCase().includes(searchTerm) ||
                record.semester.toLowerCase().includes(searchTerm) ||
                record.academicYear.toLowerCase().includes(searchTerm) ||
                record.registrationStatus.toLowerCase().includes(searchTerm)
            );
          }

          // Apply sorting
          if (sort) {
            const isDesc = sort.startsWith("-");
            const sortField = isDesc ? sort.substring(1) : sort;

            filteredMockRecords.sort((a, b) => {
              let valueA, valueB;

              if (sortField === "studentId") {
                valueA = `${a.studentId.lastName} ${a.studentId.firstName}`;
                valueB = `${b.studentId.lastName} ${b.studentId.firstName}`;
              } else if (sortField === "courseId") {
                valueA = a.courseId.title;
                valueB = b.courseId.title;
              } else if (sortField === "grade") {
                valueA = a.grade ? a.grade.totalScore || 0 : 0;
                valueB = b.grade ? b.grade.totalScore || 0 : 0;
              } else {
                valueA = a[sortField] || "";
                valueB = b[sortField] || "";
              }

              if (valueA < valueB) return isDesc ? 1 : -1;
              if (valueA > valueB) return isDesc ? -1 : 1;
              return 0;
            });
          }

          // Transform mock data
          const transformedMockRecords = filteredMockRecords.map((record) => {
            const transformedRecord = { ...record };

            // Format student name for display
            transformedRecord.studentName = `${record.studentId.firstName} ${
              record.studentId.lastName
            } (${record.studentId.UserId || ""})`;

            // Format course name for display
            transformedRecord.courseName = `${record.courseId.title} (${record.courseId.courseCode})`;

            // Format semester and academic year together
            transformedRecord.termDisplay = `${record.semester} ${record.academicYear}`;

            // Format grade display
            if (record.grade && record.grade.letterGrade) {
              transformedRecord.gradeDisplay = `${record.grade.letterGrade} (${
                record.grade.totalScore || "N/A"
              })`;
            } else {
              transformedRecord.gradeDisplay = "N/A";
            }

            return transformedRecord;
          });

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const paginatedRecords = transformedMockRecords.slice(
            startIndex,
            startIndex + limit
          );

          return {
            success: true,
            data: paginatedRecords,
            count: filteredMockRecords.length,
            pagination: {
              total: filteredMockRecords.length,
              page: page,
              limit: limit,
              pages: Math.ceil(filteredMockRecords.length / limit),
              hasNext: page < Math.ceil(filteredMockRecords.length / limit),
              hasPrev: page > 1,
            },
          };
        }

        return result;
      } catch (err) {
        console.error("Error in fetchAcademicRecords:", err);
        throw err;
      }
    },
    [baseHook]
  );

  /**
   * Get column definitions for academic records table
   * @param {Object} options - Options with callbacks
   * @returns {Array<Object>} Column definitions
   */
  const getAcademicRecordColumns = useCallback((options = {}) => {
    return [
      {
        field: "studentId",
        header: "Student",
        sortable: true,
        render: (record) => record.studentId.UserId || "N/A",
      },
      {
        field: "courseId",
        header: "Course",
        sortable: true,
        render: (record) => record.courseId.courseCode || "N/A",
      },
      {
        field: "termDisplay",
        header: "Term",
        sortable: true,
        render: (record) =>
          record.termDisplay || `${record.semester} ${record.academicYear}`,
      },
      {
        field: "registrationStatus",
        header: "Status",
        sortable: true,
        render: (record) => {
          const status = record.registrationStatus || "unknown";
          const formattedStatus =
            status.charAt(0).toUpperCase() + status.slice(1);

          // The actual Badge component will be applied in the DataTable
          return formattedStatus;
        },
      },
      {
        field: "grade",
        header: "Grade",
        sortable: true,
        render: (record) => record?.grade?.totalScore || "N/A",
      },
    ];
  }, []);

  /**
   * Get form fields for the academic record form
   * @returns {Array<Object>} Form fields
   */
  const getAcademicRecordFormFields = useCallback(() => {
    return [
      {
        name: "studentId",
        label: "Student",
        type: "select",
        required: true,
        optionsEndpoint: "/api/user?role=student",
        optionLabelKey: (user) =>
          `${user.firstName} ${user.lastName} (${
            user.UserId || user.username
          })`,
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
        name: "semester",
        label: "Semester",
        type: "select",
        required: true,
        options: [
          { label: "Fall", value: "Fall" },
          { label: "Spring", value: "Spring" },
          { label: "Summer", value: "Summer" },
          { label: "Winter", value: "Winter" },
        ],
        placeholder: "Select semester",
      },
      {
        name: "academicYear",
        label: "Academic Year",
        type: "text",
        required: true,
        placeholder: "YYYY-YYYY",
        validation: {
          pattern: {
            value: /^\d{4}-\d{4}$/,
            message: "Academic year must be in format YYYY-YYYY",
          },
        },
      },
      {
        name: "registrationStatus",
        label: "Registration Status",
        type: "select",
        required: true,
        options: [
          { label: "Registered", value: "registered" },
          { label: "Dropped", value: "dropped" },
          { label: "Completed", value: "completed" },
          { label: "Failed", value: "failed" },
          { label: "Withdrawn", value: "withdrawn" },
        ],
        placeholder: "Select status",
      },
      {
        name: "grade.midterm",
        label: "Midterm Grade",
        type: "number",
        required: false,
        placeholder: "Enter midterm grade (0-100)",
        validation: {
          min: {
            value: 0,
            message: "Grade must be at least 0",
          },
          max: {
            value: 100,
            message: "Grade cannot exceed 100",
          },
        },
      },
      {
        name: "grade.final",
        label: "Final Grade",
        type: "number",
        required: false,
        placeholder: "Enter final grade (0-100)",
        validation: {
          min: {
            value: 0,
            message: "Grade must be at least 0",
          },
          max: {
            value: 100,
            message: "Grade cannot exceed 100",
          },
        },
      },
      {
        name: "grade.totalScore",
        label: "Total Score",
        type: "number",
        required: false,
        placeholder: "Enter total score (0-100)",
        validation: {
          min: {
            value: 0,
            message: "Score must be at least 0",
          },
          max: {
            value: 100,
            message: "Score cannot exceed 100",
          },
        },
      },
      {
        name: "grade.letterGrade",
        label: "Letter Grade",
        type: "select",
        required: false,
        options: [
          { label: "A", value: "A" },
          { label: "A-", value: "A-" },
          { label: "B+", value: "B+" },
          { label: "B", value: "B" },
          { label: "B-", value: "B-" },
          { label: "C+", value: "C+" },
          { label: "C", value: "C" },
          { label: "C-", value: "C-" },
          { label: "D+", value: "D+" },
          { label: "D", value: "D" },
          { label: "F", value: "F" },
        ],
        placeholder: "Select letter grade",
      },
    ];
  }, []);

  /**
   * Get filter options for the academic records data
   * @returns {Array<Object>} Filter options
   */
  const getAcademicRecordFilterOptions = useCallback(() => {
    // Generate academic year options for the past 5 years and next 2 years
    const currentYear = new Date().getFullYear();
    const academicYearOptions = [{ value: "all", label: "All Years" }];

    for (let i = -5; i <= 2; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      const academicYear = `${startYear}-${endYear}`;
      academicYearOptions.push({ value: academicYear, label: academicYear });
    }

    return [
      {
        name: "semester",
        label: "Semester",
        type: "select",
        options: [
          { value: "all", label: "All Semesters" },
          { value: "Fall", label: "Fall" },
          { value: "Spring", label: "Spring" },
          { value: "Summer", label: "Summer" },
          { value: "Winter", label: "Winter" },
        ],
        value: semesterFilter,
        onChange: setSemesterFilter,
      },
      {
        name: "academicYear",
        label: "Academic Year",
        type: "select",
        options: academicYearOptions,
        value: academicYearFilter,
        onChange: setAcademicYearFilter,
      },
      {
        name: "registrationStatus",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All Statuses" },
          { value: "registered", label: "Registered" },
          { value: "dropped", label: "Dropped" },
          { value: "completed", label: "Completed" },
          { value: "failed", label: "Failed" },
          { value: "withdrawn", label: "Withdrawn" },
        ],
        value: statusFilter,
        onChange: setStatusFilter,
      },
      {
        name: "courseId",
        label: "Course",
        type: "select",
        optionsEndpoint: "/api/course",
        optionLabelKey: (course) => `${course.title} (${course.courseCode})`,
        optionValueKey: "_id",
        placeholder: "All Courses",
        value: courseFilter,
        onChange: setCourseFilter,
      },
    ];
  }, [semesterFilter, academicYearFilter, statusFilter, courseFilter]);

  return {
    ...baseHook,
    fetchAcademicRecords,
    semesterFilter,
    setSemesterFilter,
    academicYearFilter,
    setAcademicYearFilter,
    statusFilter,
    setStatusFilter,
    courseFilter,
    setCourseFilter,
    getAcademicRecordColumns,
    getAcademicRecordFormFields,
    getAcademicRecordFilterOptions,
    getItem: baseHook.getItem,
  };
}
