/**
 * @file useUsers.js
 * @description Custom hook for user management operations
 */

import { useState, useCallback } from "react";
import useDataManagement from "./useDataManagement";

// Mock data for development/fallback
const MOCK_USERS = [
  {
    _id: "user1",
    UserId: "A000001",
    username: "admin1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    status: "active",
    lastLogin: "2023-03-15T14:30:00Z",
  },
  {
    _id: "user2",
    UserId: "T000001",
    username: "teacher1",
    email: "teacher@example.com",
    firstName: "Teacher",
    lastName: "Smith",
    role: "teacher",
    status: "active",
    lastLogin: "2023-03-14T09:15:00Z",
    profileData: {
      contactPhone: "+1234567890",
      bio: "Experienced professor with 10 years of teaching",
      status: "active",
    },
  },
  {
    _id: "user3",
    UserId: "S000001",
    username: "student1",
    email: "student@example.com",
    firstName: "Student",
    lastName: "Johnson",
    role: "student",
    status: "active",
    lastLogin: "2023-03-15T10:20:00Z",
    profileData: {
      dateOfBirth: "2000-01-15",
      gender: "male",
      address: "123 Student Ave",
      phone: "+1987654321",
      enrollmentStatus: "enrolled",
      departmentId: "dept1",
      programId: "prog1",
    },
  },
  {
    _id: "user4",
    UserId: "T000002",
    username: "teacher2",
    email: "teacher2@example.com",
    firstName: "Jane",
    lastName: "Doe",
    role: "teacher",
    status: "active",
    lastLogin: "2023-03-13T11:45:00Z",
    profileData: {
      contactPhone: "+1234599999",
      bio: "Mathematics professor specialized in calculus",
      status: "active",
    },
  },
  {
    _id: "user5",
    UserId: "S000002",
    username: "student2",
    email: "student2@example.com",
    firstName: "Bob",
    lastName: "Brown",
    role: "student",
    status: "active",
    lastLogin: "2023-03-14T16:10:00Z",
    profileData: {
      dateOfBirth: "1999-05-20",
      gender: "male",
      address: "456 College St",
      phone: "+1222333444",
      enrollmentStatus: "enrolled",
      departmentId: "dept2",
      programId: "prog2",
    },
  },
];

/**
 * Custom hook for user management operations
 * @returns {Object} User management operations and state
 */
export default function useUsers() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const baseHook = useDataManagement("/api/user");

  /**
   * Get role-specific profile form fields
   * @param {string} role - User role
   * @returns {Array<Object>} Form fields
   */
  const getRoleSpecificFormFields = useCallback((role) => {
    switch (role) {
      case "teacher":
        return [
          {
            name: "profileData.contactPhone",
            label: "Contact Phone",
            type: "tel",
            required: true,
          },
          { name: "profileData.bio", label: "Biography", type: "textarea" },
          {
            name: "profileData.status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "sabbatical", label: "Sabbatical" },
              { value: "retired", label: "Retired" },
              { value: "suspended", label: "Suspended" },
            ],
            required: true,
          },
        ];
      case "student":
        return [
          {
            name: "profileData.dateOfBirth",
            label: "Date of Birth",
            type: "date",
          },
          {
            name: "profileData.gender",
            label: "Gender",
            type: "select",
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ],
          },
          { name: "profileData.address", label: "Address", type: "textarea" },
          { name: "profileData.phone", label: "Phone Number", type: "tel" },
          {
            name: "profileData.enrollmentStatus",
            label: "Enrollment Status",
            type: "select",
            options: [
              { value: "enrolled", label: "Enrolled" },
              { value: "on_leave", label: "On Leave" },
              { value: "graduated", label: "Graduated" },
              { value: "withdrawn", label: "Withdrawn" },
            ],
            required: true,
          },
          {
            name: "profileData.departmentId",
            label: "Department",
            type: "select",
            optionsEndpoint: "/api/department",
            required: true,
          },
          {
            name: "profileData.programId",
            label: "Program",
            type: "select",
            optionsEndpoint: "/api/program",
            required: true,
          },
        ];
      default:
        return [];
    }
  }, []);

  /**
   * Fetch users with filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Fetch result
   */
  const fetchUsers = useCallback(
    async (options = {}) => {
      try {
        console.log("fetchUsers options:", options);

        // Pass the options directly to the baseHook.fetchData method
        // The APIFeatures class will handle the filtering, sorting, etc.
        const result = await baseHook.fetchData(options);

        // Fallback to mock data if API fails in development
        if (!result.success && process.env.NODE_ENV === "development") {
          console.warn("Using mock user data");

          // Extract options
          const {
            page = 1,
            limit = 10,
            sort,
            search,
            ...filterParams
          } = options;

          // Filter mock data according to filters
          let filteredMockUsers = [...MOCK_USERS];

          // Apply filters
          Object.entries(filterParams).forEach(([key, value]) => {
            if (key === "role" && value) {
              filteredMockUsers = filteredMockUsers.filter(
                (user) => user.role === value
              );
            } else if (key === "status" && value) {
              filteredMockUsers = filteredMockUsers.filter(
                (user) => user.status === value
              );
            }
          });

          // Apply search
          if (search) {
            const searchTerm = search.toLowerCase();
            filteredMockUsers = filteredMockUsers.filter(
              (user) =>
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.firstName?.toLowerCase().includes(searchTerm) ||
                user.lastName?.toLowerCase().includes(searchTerm) ||
                user.UserId?.toLowerCase().includes(searchTerm)
            );
          }

          // Apply sorting
          if (sort) {
            const isDesc = sort.startsWith("-");
            const sortField = isDesc ? sort.substring(1) : sort;

            filteredMockUsers.sort((a, b) => {
              const valueA = a[sortField] || "";
              const valueB = b[sortField] || "";

              if (valueA < valueB) return isDesc ? 1 : -1;
              if (valueA > valueB) return isDesc ? -1 : 1;
              return 0;
            });
          }

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const paginatedUsers = filteredMockUsers.slice(
            startIndex,
            startIndex + limit
          );

          return {
            success: true,
            data: paginatedUsers,
            count: filteredMockUsers.length,
            pagination: {
              total: filteredMockUsers.length,
              page: page,
              limit: limit,
              pages: Math.ceil(filteredMockUsers.length / limit),
              hasNext: page < Math.ceil(filteredMockUsers.length / limit),
              hasPrev: page > 1,
            },
          };
        }
        return result;
      } catch (err) {
        console.error("Error in fetchUsers:", err);
        throw err;
      }
    },
    [baseHook]
  );

  /**
   * Get column definitions for users table
   * @returns {Array<Object>} Column definitions
   */
  const getUserColumns = useCallback(() => {
    return [
      { field: "UserId", header: "ID", sortable: true },
      { field: "username", header: "Username", sortable: true },
      { field: "email", header: "Email", sortable: true },
      {
        field: "name",
        header: "Name",
        sortable: true,
        render: (user) =>
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
      },
      { field: "role", header: "Role", sortable: true },
      { field: "status", header: "Status", sortable: true },
      {
        field: "lastLogin",
        header: "Last Login",
        sortable: true,
        render: (user) =>
          user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never",
      },
    ];
  }, []);

  /**
   * Get filter options for the user data
   * @returns {Array<Object>} Filter options
   */
  const getUserFilterOptions = useCallback(() => {
    return [
      {
        name: "role",
        label: "Role",
        type: "select",
        options: [
          { value: "all", label: "All Roles" },
          { value: "admin", label: "Admin" },
          { value: "teacher", label: "Teacher" },
          { value: "student", label: "Student" },
        ],
        value: roleFilter,
        onChange: setRoleFilter,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "disabled", label: "Disabled" },
        ],
        value: statusFilter,
        onChange: setStatusFilter,
      },
    ];
  }, [roleFilter, statusFilter]);

  return {
    ...baseHook,
    fetchUsers,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    getUserColumns,
    getUserFilterOptions,
    getRoleSpecificFormFields,
  };
}
