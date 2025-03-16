/**
 * @file useCourses.js
 * @description Custom hook for course management operations
 */

import { useState, useCallback } from "react";
import useDataManagement from "./useDataManagement";

// Mock data for development/fallback
const MOCK_COURSES = [
  {
    _id: "course1",
    courseCode: "C12345678",
    title: "Introduction to Programming",
    description: "Basic concepts of programming using Python",
    credits: 3,
    dayOfWeek: ["Monday", "Wednesday"],
    startTime: "09:00",
    endTime: "10:30",
    location: "Room 101",
    programIds: [
      {
        _id: "prog1",
        name: "Computer Science",
        programCode: "P12345678",
      },
    ],
    prerequisites: [],
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-02-20T14:15:00Z",
  },
  {
    _id: "course2",
    courseCode: "C23456789",
    title: "Data Structures and Algorithms",
    description: "Advanced data structures and algorithm analysis",
    credits: 4,
    dayOfWeek: ["Tuesday", "Thursday"],
    startTime: "13:00",
    endTime: "14:30",
    location: "Room 205",
    programIds: [
      {
        _id: "prog1",
        name: "Computer Science",
        programCode: "P12345678",
      },
      {
        _id: "prog2",
        name: "Data Science",
        programCode: "P23456789",
      },
    ],
    prerequisites: ["course1"],
    createdAt: "2023-01-16T11:30:00Z",
    updatedAt: "2023-02-21T15:15:00Z",
  },
  {
    _id: "course3",
    courseCode: "C34567890",
    title: "Calculus I",
    description: "Introduction to differential calculus",
    credits: 4,
    dayOfWeek: ["Monday", "Wednesday", "Friday"],
    startTime: "10:00",
    endTime: "11:00",
    location: "Room 300",
    programIds: [
      {
        _id: "prog1",
        name: "Computer Science",
        programCode: "P12345678",
      },
      {
        _id: "prog3",
        name: "Applied Mathematics",
        programCode: "P34567890",
      },
    ],
    prerequisites: [],
    createdAt: "2023-01-17T12:30:00Z",
    updatedAt: "2023-02-22T16:15:00Z",
  },
  {
    _id: "course4",
    courseCode: "C45678901",
    title: "Database Systems",
    description: "Introduction to database design and SQL",
    credits: 3,
    dayOfWeek: ["Tuesday", "Thursday"],
    startTime: "15:00",
    endTime: "16:30",
    location: "Room 105",
    programIds: [
      {
        _id: "prog1",
        name: "Computer Science",
        programCode: "P12345678",
      },
      {
        _id: "prog2",
        name: "Data Science",
        programCode: "P23456789",
      },
    ],
    prerequisites: ["course1"],
    createdAt: "2023-01-18T13:30:00Z",
    updatedAt: "2023-02-23T17:15:00Z",
  },
  {
    _id: "course5",
    courseCode: "C56789012",
    title: "Machine Learning",
    description: "Fundamentals of machine learning algorithms",
    credits: 4,
    dayOfWeek: ["Monday", "Wednesday"],
    startTime: "14:00",
    endTime: "15:30",
    location: "Room 202",
    programIds: [
      {
        _id: "prog2",
        name: "Data Science",
        programCode: "P23456789",
      },
    ],
    prerequisites: ["course2", "course3"],
    createdAt: "2023-01-19T14:30:00Z",
    updatedAt: "2023-02-24T18:15:00Z",
  },
];

/**
 * Custom hook for course management operations
 * @returns {Object} Course management operations and state
 */
export default function useCourses() {
  const [creditsFilter, setCreditsFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const baseHook = useDataManagement("/api/course");

  /**
   * Fetch courses with filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Fetch result
   */
  const fetchCourses = useCallback(
    async (options = {}) => {
      try {
        console.log("Fetching courses with options:", options);

        // Pass the options directly to the baseHook.fetchData method
        const result = await baseHook.fetchData(options);

        // Special handling for course data, specifically for programIds and prerequisites
        if (result.success && result.data) {
          // Transform data if needed
          const transformedData = result.data.map((course) => {
            // Make a shallow copy to avoid mutating the original
            const transformedCourse = { ...course };

            // Format programIds for display if needed
            if (Array.isArray(transformedCourse.programIds)) {
              // Ensure each program has the required properties
              transformedCourse.programsDisplay = transformedCourse.programIds
                .map((prog) => prog.name || `Program ${prog._id}`)
                .join(", ");
            }

            // Format prerequisites for display if needed
            if (
              Array.isArray(transformedCourse.prerequisites) &&
              transformedCourse.prerequisites.length > 0
            ) {
              // For prerequisites, we might need to fetch course names in a real implementation
              transformedCourse.prerequisitesDisplay =
                transformedCourse.prerequisites
                  .map((prereq) => {
                    if (typeof prereq === "string") return prereq;
                    return prereq.title || `Course ${prereq._id}`;
                  })
                  .join(", ");
            } else {
              transformedCourse.prerequisitesDisplay = "None";
            }

            // Format days of week for display
            if (Array.isArray(transformedCourse.dayOfWeek)) {
              transformedCourse.schedule =
                transformedCourse.dayOfWeek.join(", ") +
                ` (${transformedCourse.startTime} - ${transformedCourse.endTime})`;
            }

            return transformedCourse;
          });

          // Replace the original data with the transformed data
          result.data = transformedData;
        }

        // Fallback to mock data if API fails in development
        if (!result.success && process.env.NODE_ENV === "development") {
          console.warn("Using mock course data");

          // Extract filters
          const { page = 1, limit = 10, sort, search, ...filters } = options;

          // Filter mock data
          let filteredMockCourses = [...MOCK_COURSES];

          // Apply filters
          Object.entries(filters).forEach(([key, value]) => {
            if (key === "credits" && value !== "all") {
              filteredMockCourses = filteredMockCourses.filter(
                (course) => course.credits.toString() === value.toString()
              );
            } else if (key === "program" && value !== "all") {
              filteredMockCourses = filteredMockCourses.filter((course) =>
                course.programIds.some((prog) => prog._id === value)
              );
            }
          });

          // Apply search
          if (search) {
            const searchTerm = search.toLowerCase();
            filteredMockCourses = filteredMockCourses.filter(
              (course) =>
                course.title.toLowerCase().includes(searchTerm) ||
                course.courseCode.toLowerCase().includes(searchTerm) ||
                course.description?.toLowerCase().includes(searchTerm) ||
                course.location.toLowerCase().includes(searchTerm)
            );
          }

          // Apply sorting
          if (sort) {
            const isDesc = sort.startsWith("-");
            const sortField = isDesc ? sort.substring(1) : sort;

            filteredMockCourses.sort((a, b) => {
              if (sortField === "programIds") {
                const valueA = a.programIds[0]?.name || "";
                const valueB = b.programIds[0]?.name || "";
                if (valueA < valueB) return isDesc ? 1 : -1;
                if (valueA > valueB) return isDesc ? -1 : 1;
                return 0;
              } else {
                const valueA = a[sortField] || "";
                const valueB = b[sortField] || "";
                if (valueA < valueB) return isDesc ? 1 : -1;
                if (valueA > valueB) return isDesc ? -1 : 1;
                return 0;
              }
            });
          }

          // Transform mock data
          const transformedMockCourses = filteredMockCourses.map((course) => {
            const transformedCourse = { ...course };

            transformedCourse.programsDisplay = course.programIds
              .map((prog) => prog.name)
              .join(", ");

            transformedCourse.prerequisitesDisplay =
              course.prerequisites.length > 0
                ? course.prerequisites.join(", ")
                : "None";

            transformedCourse.schedule =
              course.dayOfWeek.join(", ") +
              ` (${course.startTime} - ${course.endTime})`;

            return transformedCourse;
          });

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const paginatedCourses = transformedMockCourses.slice(
            startIndex,
            startIndex + limit
          );

          return {
            success: true,
            data: paginatedCourses,
            count: filteredMockCourses.length,
            pagination: {
              total: filteredMockCourses.length,
              page: page,
              limit: limit,
              pages: Math.ceil(filteredMockCourses.length / limit),
              hasNext: page < Math.ceil(filteredMockCourses.length / limit),
              hasPrev: page > 1,
            },
          };
        }

        return result;
      } catch (err) {
        console.error("Error in fetchCourses:", err);
        throw err;
      }
    },
    [baseHook]
  );

  /**
   * Get column definitions for courses table
   * @param {Object} options - Options with callbacks
   * @returns {Array<Object>} Column definitions
   */
  const getCourseColumns = useCallback((options = {}) => {
    return [
      { field: "courseCode", header: "Code", sortable: true },
      { field: "title", header: "Course Title", sortable: true },
      { field: "credits", header: "Credits", sortable: true },
      {
        field: "schedule",
        header: "Schedule",
        sortable: false,
        render: (course) =>
          course.schedule ||
          `${course.dayOfWeek?.join(", ")} (${course.startTime} - ${
            course.endTime
          })`,
      },
      { field: "location", header: "Location", sortable: true },
    ];
  }, []);

  /**
   * Get form fields for the course form
   * @returns {Array<Object>} Form fields
   */
  const getCourseFormFields = useCallback(() => {
    return [
      {
        name: "courseCode",
        label: "Course Code",
        type: "text",
        required: true,
        placeholder: "Enter course code (e.g., C12345678)",
        validation: {
          pattern: {
            value: /^C\d{8}$/,
            message: "Code must be in format 'C' followed by 8 digits",
          },
        },
      },
      {
        name: "title",
        label: "Course Title",
        type: "text",
        required: true,
        placeholder: "Enter course title",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Enter course description",
      },
      {
        name: "credits",
        label: "Credits",
        type: "number",
        required: true,
        placeholder: "Enter credits",
        validation: {
          min: {
            value: 0,
            message: "Credits must be at least 0",
          },
          max: {
            value: 12,
            message: "Credits cannot exceed 12",
          },
        },
      },
      {
        name: "dayOfWeek",
        label: "Days of Week",
        type: "multiselect",
        required: true,
        options: [
          { label: "Monday", value: "Monday" },
          { label: "Tuesday", value: "Tuesday" },
          { label: "Wednesday", value: "Wednesday" },
          { label: "Thursday", value: "Thursday" },
          { label: "Friday", value: "Friday" },
          { label: "Saturday", value: "Saturday" },
          { label: "Sunday", value: "Sunday" },
        ],
        placeholder: "Select days",
      },
      {
        name: "startTime",
        label: "Start Time",
        type: "time",
        required: true,
        placeholder: "HH:MM",
        validation: {
          pattern: {
            value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            message: "Time must be in format HH:MM",
          },
        },
      },
      {
        name: "endTime",
        label: "End Time",
        type: "time",
        required: true,
        placeholder: "HH:MM",
        validation: {
          pattern: {
            value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            message: "Time must be in format HH:MM",
          },
        },
      },
      {
        name: "location",
        label: "Location",
        type: "text",
        required: true,
        placeholder: "Enter classroom/location",
      },
      {
        name: "programIds",
        label: "Programs",
        type: "multiselect",
        required: true,
        optionsEndpoint: "/api/program",
        optionLabelKey: "name",
        optionValueKey: "_id",
        placeholder: "Select programs",
      },
      {
        name: "prerequisites",
        label: "Prerequisites",
        type: "multiselect",
        required: false,
        optionsEndpoint: "/api/course",
        optionLabelKey: "title",
        optionValueKey: "_id",
        placeholder: "Select prerequisite courses",
      },
    ];
  }, []);

  /**
   * Get filter options for the course data
   * @returns {Array<Object>} Filter options
   */
  const getCourseFilterOptions = useCallback(() => {
    return [
      {
        name: "credits",
        label: "Credits",
        type: "select",
        options: [
          { value: "all", label: "All Credits" },
          { value: "1", label: "1 Credit" },
          { value: "2", label: "2 Credits" },
          { value: "3", label: "3 Credits" },
          { value: "4", label: "4 Credits" },
          { value: "5", label: "5 Credits" },
        ],
        value: creditsFilter,
        onChange: setCreditsFilter,
      },
      {
        name: "program",
        label: "Program",
        type: "select",
        optionsEndpoint: "/api/program",
        optionLabelKey: "name",
        optionValueKey: "_id",
        placeholder: "All Programs",
        value: programFilter,
        onChange: setProgramFilter,
      },
    ];
  }, [creditsFilter, programFilter]);

  return {
    ...baseHook,
    fetchCourses,
    creditsFilter,
    setCreditsFilter,
    programFilter,
    setProgramFilter,
    getCourseColumns,
    getCourseFormFields,
    getCourseFilterOptions,
    getItem: baseHook.getItem,
  };
}
