/**
 * @file usePrograms.js
 * @description Custom hook for program management operations
 */

import { useState, useCallback } from "react";
import useDataManagement from "./useDataManagement";

// Mock data for development/fallback
const MOCK_PROGRAMS = [
  {
    _id: "prog1",
    programCode: "P12345678",
    name: "Computer Science",
    description: "Bachelor of Computer Science",
    department: {
      _id: "dept1",
      name: "Computer Science",
      code: "D12345678",
    },
    degreeLevel: "bachelor",
    credits: 120,
    duration: 4,
    status: "active",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-02-20T14:15:00Z",
  },
  {
    _id: "prog2",
    programCode: "P23456789",
    name: "Data Science",
    description: "Master of Data Science",
    department: {
      _id: "dept1",
      name: "Computer Science",
      code: "D12345678",
    },
    degreeLevel: "master",
    credits: 60,
    duration: 2,
    status: "active",
    createdAt: "2023-01-16T11:30:00Z",
    updatedAt: "2023-02-21T15:15:00Z",
  },
  {
    _id: "prog3",
    programCode: "P34567890",
    name: "Applied Mathematics",
    description: "Bachelor of Applied Mathematics",
    department: {
      _id: "dept2",
      name: "Mathematics",
      code: "D23456789",
    },
    degreeLevel: "bachelor",
    credits: 120,
    duration: 4,
    status: "active",
    createdAt: "2023-01-17T12:30:00Z",
    updatedAt: "2023-02-22T16:15:00Z",
  },
  {
    _id: "prog4",
    programCode: "P45678901",
    name: "Business Administration",
    description: "Bachelor of Business Administration",
    department: {
      _id: "dept4",
      name: "Business Administration",
      code: "D45678901",
    },
    degreeLevel: "bachelor",
    credits: 120,
    duration: 4,
    status: "active",
    createdAt: "2023-01-18T13:30:00Z",
    updatedAt: "2023-02-23T17:15:00Z",
  },
  {
    _id: "prog5",
    programCode: "P56789012",
    name: "English Literature",
    description: "Bachelor of Arts in English Literature",
    department: {
      _id: "dept5",
      name: "English",
      code: "D56789012",
    },
    degreeLevel: "bachelor",
    credits: 120,
    duration: 4,
    status: "active",
    createdAt: "2023-01-19T14:30:00Z",
    updatedAt: "2023-02-24T18:15:00Z",
  },
];

/**
 * Custom hook for program management operations
 * @returns {Object} Program management operations and state
 */
export default function usePrograms() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [degreeLevelFilter, setDegreeLevelFilter] = useState("all");
  const baseHook = useDataManagement("/api/program");

  /**
   * Fetch programs with filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Fetch result
   */
  const fetchPrograms = useCallback(
    async (options = {}) => {
      try {
        console.log("usePrograms");
        console.log("Fetching programs with options:", options);
        // Pass the options directly to the baseHook.fetchData method
        const result = await baseHook.fetchData(options);
        console.log("usePrograms");
        console.log("result after fetchData", result);

        // Fallback to mock data if API fails in development
        if (!result.success && process.env.NODE_ENV === "development") {
          console.warn("Using mock program data");

          // Extract filters
          const { page = 1, limit = 10, sort, search, ...filters } = options;

          // Filter mock data
          let filteredMockPrograms = [...MOCK_PROGRAMS];

          // Apply filters
          Object.entries(filters).forEach(([key, value]) => {
            if (key === "degreeLevel" && value !== "all") {
              filteredMockPrograms = filteredMockPrograms.filter(
                (program) => program.degreeLevel === value
              );
            } else if (key === "status" && value !== "all") {
              filteredMockPrograms = filteredMockPrograms.filter(
                (program) => program.status === value
              );
            } else if (key === "department" && value) {
              filteredMockPrograms = filteredMockPrograms.filter(
                (program) => program.department._id === value
              );
            }
          });

          // Apply search
          if (search) {
            const searchTerm = search.toLowerCase();
            filteredMockPrograms = filteredMockPrograms.filter(
              (program) =>
                program.name.toLowerCase().includes(searchTerm) ||
                program.programCode.toLowerCase().includes(searchTerm) ||
                program.description?.toLowerCase().includes(searchTerm)
            );
          }

          // Apply sorting
          if (sort) {
            const isDesc = sort.startsWith("-");
            const sortField = isDesc ? sort.substring(1) : sort;

            filteredMockPrograms.sort((a, b) => {
              if (sortField === "department") {
                const valueA = a.department?.name || "";
                const valueB = b.department?.name || "";
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

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const paginatedPrograms = filteredMockPrograms.slice(
            startIndex,
            startIndex + limit
          );

          return {
            success: true,
            data: paginatedPrograms,
            count: filteredMockPrograms.length,
            pagination: {
              total: filteredMockPrograms.length,
              page: page,
              limit: limit,
              pages: Math.ceil(filteredMockPrograms.length / limit),
              hasNext: page < Math.ceil(filteredMockPrograms.length / limit),
              hasPrev: page > 1,
            },
          };
        }
        return result;
      } catch (err) {
        console.error("Error in fetchPrograms:", err);
        throw err;
      }
    },
    [baseHook]
  );

  /**
   * Get column definitions for programs table
   * @param {Object} options - Options with callbacks
   * @returns {Array<Object>} Column definitions
   */
  const getProgramColumns = useCallback((options = {}) => {
    return [
      { field: "programCode", header: "Code", sortable: true },
      { field: "name", header: "Program Name", sortable: true },
      {
        field: "department",
        header: "Department",
        sortable: true,
        render: (program) => program.department?.name || "N/A",
      },
      {
        field: "degreeLevel",
        header: "Degree Level",
        sortable: true,
        render: (program) => {
          const degreeLevels = {
            associate: "Associate",
            bachelor: "Bachelor",
            master: "Master",
            doctoral: "Doctoral",
          };
          return degreeLevels[program.degreeLevel] || program.degreeLevel;
        },
      },
      { field: "credits", header: "Credits", sortable: true },
      { field: "duration", header: "Duration (years)", sortable: true },
      {
        field: "status",
        header: "Status",
        sortable: true,
        render: (program) => {
          let variant = "default";
          if (program.status === "active") variant = "outline";
          else if (program.status === "deprecated") variant = "secondary";
          else if (program.status === "upcoming") variant = "default";

          // Return the formatted text directly instead of an object
          // The Badge component will be applied in the DataTable
          return (
            program.status.charAt(0).toUpperCase() + program.status.slice(1)
          );
        },
      },
    ];
  }, []);

  /**
   * Get form fields for the program form
   * @returns {Array<Object>} Form fields
   */
  const getProgramFormFields = useCallback(() => {
    return [
      {
        name: "programCode",
        label: "Program Code",
        type: "text",
        required: true,
        placeholder: "Enter program code (e.g., P12345678)",
        validation: {
          pattern: {
            value: /^P\d{8}$/,
            message: "Code must be in format 'P' followed by 8 digits",
          },
        },
      },
      {
        name: "name",
        label: "Program Name",
        type: "text",
        required: true,
        placeholder: "Enter program name",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
        placeholder: "Enter program description",
      },
      {
        name: "department",
        label: "Department",
        type: "select",
        required: true,
        optionsEndpoint: "/api/department",
        optionLabelKey: "name",
        optionValueKey: "_id",
        placeholder: "Select department",
      },
      {
        name: "degreeLevel",
        label: "Degree Level",
        type: "select",
        required: true,
        options: [
          { label: "Associate", value: "associate" },
          { label: "Bachelor", value: "bachelor" },
          { label: "Master", value: "master" },
          { label: "Doctoral", value: "doctoral" },
        ],
        placeholder: "Select degree level",
      },
      {
        name: "credits",
        label: "Credits",
        type: "number",
        required: true,
        placeholder: "Enter total credits",
        validation: {
          min: {
            value: 1,
            message: "Credits must be at least 1",
          },
        },
      },
      {
        name: "duration",
        label: "Duration (years)",
        type: "number",
        required: true,
        placeholder: "Enter program duration in years",
        validation: {
          min: {
            value: 1,
            message: "Duration must be at least 1 year",
          },
        },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Active", value: "active" },
          { label: "Deprecated", value: "deprecated" },
          { label: "Upcoming", value: "upcoming" },
        ],
        placeholder: "Select status",
      },
    ];
  }, []);

  /**
   * Get filter options for the program data
   * @returns {Array<Object>} Filter options
   */
  const getProgramFilterOptions = useCallback(() => {
    return [
      {
        name: "degreeLevel",
        label: "Degree Level",
        type: "select",
        options: [
          { value: "all", label: "All Levels" },
          { value: "associate", label: "Associate" },
          { value: "bachelor", label: "Bachelor" },
          { value: "master", label: "Master" },
          { value: "doctoral", label: "Doctoral" },
        ],
        value: degreeLevelFilter,
        onChange: setDegreeLevelFilter,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All Statuses" },
          { value: "active", label: "Active" },
          { value: "deprecated", label: "Deprecated" },
          { value: "upcoming", label: "Upcoming" },
        ],
        value: statusFilter,
        onChange: setStatusFilter,
      },
      {
        name: "department",
        label: "Department",
        type: "select",
        optionsEndpoint: "/api/department",
        optionLabelKey: "name",
        optionValueKey: "_id",
        placeholder: "All Departments",
      },
    ];
  }, [degreeLevelFilter, statusFilter]);

  return {
    ...baseHook,
    fetchPrograms,
    statusFilter,
    setStatusFilter,
    degreeLevelFilter,
    setDegreeLevelFilter,
    getProgramColumns,
    getProgramFormFields,
    getProgramFilterOptions,
    getItem: baseHook.getItem,
  };
}
