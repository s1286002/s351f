/**
 * @file useDepartments.js
 * @description Custom hook for department management operations
 */

import { useState, useCallback } from "react";
import useDataManagement from "./useDataManagement";

// Mock data for development/fallback
const MOCK_DEPARTMENTS = [
  {
    _id: "dept1",
    code: "D12345678",
    name: "Computer Science",
    description: "Department of Computer Science and Information Technology",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-02-20T14:15:00Z",
  },
  {
    _id: "dept2",
    code: "D23456789",
    name: "Mathematics",
    description: "Department of Mathematical Sciences",
    createdAt: "2023-01-16T11:30:00Z",
    updatedAt: "2023-02-21T15:15:00Z",
  },
  {
    _id: "dept3",
    code: "D34567890",
    name: "Physics",
    description: "Department of Physics and Astronomy",
    createdAt: "2023-01-17T12:30:00Z",
    updatedAt: "2023-02-22T16:15:00Z",
  },
  {
    _id: "dept4",
    code: "D45678901",
    name: "Business Administration",
    description: "Department of Business Administration and Management",
    createdAt: "2023-01-18T13:30:00Z",
    updatedAt: "2023-02-23T17:15:00Z",
  },
  {
    _id: "dept5",
    code: "D56789012",
    name: "English",
    description: "Department of English Literature and Language",
    createdAt: "2023-01-19T14:30:00Z",
    updatedAt: "2023-02-24T18:15:00Z",
  },
];

/**
 * Custom hook for department management operations
 * @returns {Object} Department management operations and state
 */
export default function useDepartments() {
  const baseHook = useDataManagement("/api/department");

  /**
   * Fetch departments with filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Fetch result
   */
  const fetchDepartments = useCallback(
    async (options = {}) => {
      try {
        // Pass the options directly to the baseHook.fetchData method
        const result = await baseHook.fetchData(options);

        // Fallback to mock data if API fails in development
        if (!result.success && process.env.NODE_ENV === "development") {
          console.warn("Using mock department data");

          // Extract filters
          const { page = 1, limit = 10, sort, search, ...filters } = options;

          // Filter mock data
          let filteredMockDepartments = [...MOCK_DEPARTMENTS];

          // Apply search
          if (search) {
            const searchTerm = search.toLowerCase();
            filteredMockDepartments = filteredMockDepartments.filter(
              (dept) =>
                dept.name.toLowerCase().includes(searchTerm) ||
                dept.code.toLowerCase().includes(searchTerm) ||
                dept.description?.toLowerCase().includes(searchTerm)
            );
          }

          // Apply sorting
          if (sort) {
            const isDesc = sort.startsWith("-");
            const sortField = isDesc ? sort.substring(1) : sort;

            filteredMockDepartments.sort((a, b) => {
              const valueA = a[sortField] || "";
              const valueB = b[sortField] || "";

              if (valueA < valueB) return isDesc ? 1 : -1;
              if (valueA > valueB) return isDesc ? -1 : 1;
              return 0;
            });
          }

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const paginatedDepartments = filteredMockDepartments.slice(
            startIndex,
            startIndex + limit
          );

          return {
            success: true,
            data: paginatedDepartments,
            count: filteredMockDepartments.length,
            pagination: {
              total: filteredMockDepartments.length,
              page: page,
              limit: limit,
              pages: Math.ceil(filteredMockDepartments.length / limit),
              hasNext: page < Math.ceil(filteredMockDepartments.length / limit),
              hasPrev: page > 1,
            },
          };
        }
        return result;
      } catch (err) {
        console.error("Error in fetchDepartments:", err);
        throw err;
      }
    },
    [baseHook]
  );

  /**
   * Get column definitions for departments table
   * @param {Object} options - Options with callbacks
   * @returns {Array<Object>} Column definitions
   */
  const getDepartmentColumns = useCallback((options = {}) => {
    return [
      { field: "code", header: "Code", sortable: true },
      { field: "name", header: "Department Name", sortable: true },
      { field: "description", header: "Description", sortable: false },
      {
        field: "createdAt",
        header: "Created",
        sortable: true,
        render: (department) =>
          department.createdAt
            ? new Date(department.createdAt).toLocaleDateString()
            : "N/A",
      },
      {
        field: "updatedAt",
        header: "Last Updated",
        sortable: true,
        render: (department) =>
          department.updatedAt
            ? new Date(department.updatedAt).toLocaleDateString()
            : "N/A",
      },
    ];
  }, []);

  /**
   * Get form fields for the department form
   * @returns {Array<Object>} Form fields
   */
  const getDepartmentFormFields = useCallback(() => {
    return [
      {
        name: "code",
        label: "Department Code",
        type: "text",
        required: true,
        placeholder: "Enter department code (e.g., D12345678)",
        validation: {
          pattern: {
            value: /^D\d{8}$/,
            message: "Code must be in format 'D' followed by 8 digits",
          },
        },
      },
      {
        name: "name",
        label: "Department Name",
        type: "text",
        required: true,
        placeholder: "Enter department name",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter department description",
      },
    ];
  }, []);

  /**
   * Get filter options for the department data
   * @returns {Array<Object>} Filter options
   */
  const getDepartmentFilterOptions = useCallback(() => {
    return [];
  }, []);

  return {
    ...baseHook,
    fetchDepartments,
    getDepartmentColumns,
    getDepartmentFormFields,
    getDepartmentFilterOptions,
    getItem: baseHook.getItem,
  };
}
