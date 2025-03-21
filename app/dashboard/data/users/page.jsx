"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useUsers from "@/hooks/api/useUsers";
import DataTable from "@/components/dashboard/admin/DataTable";
import FilterBar from "@/components/dashboard/admin/FilterBar";
import FormModal from "@/components/dashboard/admin/FormModal";
import { Button } from "@/components/ui/button";
import { UserIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

/**
 * Available page size options
 */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Admin user management page
 * @returns {JSX.Element} User management page
 */
export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params or defaults
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("limit")) || PAGE_SIZE_OPTIONS[0]
  );

  // Extract sort information from URL
  const sortParam = searchParams.get("sort") || "username";
  const [sortField, setSortField] = useState(
    sortParam.startsWith("-") ? sortParam.substring(1) : sortParam
  );
  const [sortOrder, setSortOrder] = useState(
    sortParam.startsWith("-") ? "desc" : "asc"
  );

  const [selectedFilters, setSelectedFilters] = useState(() => {
    // Parse filter params from URL
    const filters = {};

    // Process all query parameters
    for (const [key, value] of searchParams.entries()) {
      // Skip non-filter params
      const excludedParams = ["page", "sort", "limit", "fields", "search"];
      if (excludedParams.includes(key)) continue;

      // Handle operator-based filters like price[gte]=100
      if (key.includes("[") && key.includes("]")) {
        const fieldName = key.substring(0, key.indexOf("["));
        const operator = key.substring(key.indexOf("[") + 1, key.indexOf("]"));

        // Initialize nested object if needed
        if (!filters[fieldName]) filters[fieldName] = {};

        // Add operator-based filter
        filters[fieldName][operator] = value;
      } else {
        // Simple filters like status=active
        filters[key] = value;
      }
    }

    return filters;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRole, setCurrentRole] = useState("");

  // Watch for role changes to update form fields
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role || "");
    } else {
      setCurrentRole("");
    }
  }, [currentUser]);

  // Update form fields when role changes
  useEffect(() => {
    // Only update when modal is open
    if (!modalOpen) return;

    // We don't need to do anything here, the fields will update
    // when getFormFields is called with the new currentRole
    console.log("Role changed to:", currentRole);
  }, [currentRole, modalOpen]);

  // Get user data and operations from hook
  const {
    data: users,
    isLoading,
    error,
    totalCount,
    totalPages,
    fetchData: fetchUsers,
    createItem: createUser,
    updateItem: updateUser,
    deleteItem: deleteUser,
    bulkDelete: bulkDeleteUsers,
    getUserColumns,
    getUserFilterOptions,
    getRoleSpecificFormFields,
  } = useUsers();

  /**
   * Update URL with current state
   */
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    // Add pagination, sorting, and search params
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (pageSize !== PAGE_SIZE_OPTIONS[0])
      params.set("limit", pageSize.toString());

    if (sortField) {
      // Format sort parameter as expected by APIFeatures (prefix with - for desc)
      params.set("sort", sortOrder === "desc" ? `-${sortField}` : sortField);
    }
    if (searchTerm) params.set("search", searchTerm);

    // Add filter params as expected by APIFeatures
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
        // Handle advanced filtering (operators like gt, lt, etc.)
        if (typeof value === "object") {
          Object.entries(value).forEach(([operator, operatorValue]) => {
            params.set(`${key}[${operator}]`, operatorValue);
          });
        } else {
          params.set(key, value);
        }
      }
    });

    // Update URL without reloading the page
    const url = params.toString() ? `?${params.toString()}` : "";
    router.push(`/dashboard/data/users${url}`, { scroll: false });
  }, [
    currentPage,
    pageSize,
    sortField,
    sortOrder,
    searchTerm,
    selectedFilters,
    router,
  ]);

  // Update URL when state changes
  useEffect(() => {
    updateURL();
  }, [
    currentPage,
    pageSize,
    sortField,
    sortOrder,
    searchTerm,
    selectedFilters,
    updateURL,
  ]);

  // Fetch users when page parameters change
  useEffect(() => {
    // Prepare sort parameter as expected by backend API
    let sortParam;
    if (sortField) {
      sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
    }

    fetchUsers({
      page: currentPage,
      limit: pageSize,
      sort: sortParam,
      search: searchTerm,
      // Convert filters to direct query params as expected by APIFeatures
      ...selectedFilters,
    });
  }, [
    fetchUsers,
    currentPage,
    pageSize,
    sortField,
    sortOrder,
    searchTerm,
    selectedFilters,
  ]);

  /**
   * Handle page change
   * @param {number} page - New page number
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  /**
   * Handle page size change
   * @param {number} size - New page size
   */
  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  /**
   * Handle sorting change
   * @param {string} field - Field to sort by
   * @param {string} order - Sort order (asc or desc)
   */
  const handleSortChange = useCallback((field, order) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  /**
   * Handle search input change
   * @param {string} value - Search term
   */
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  /**
   * Apply filters to the user list
   * @param {Object} filters - Filter values
   */
  const handleApplyFilters = useCallback((filters) => {
    // Convert any "all" values to undefined/empty so they don't get added to the URL
    const processedFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (
          value !== "all" &&
          value !== "" &&
          value !== null &&
          value !== undefined
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    setSelectedFilters(processedFilters);
    setCurrentPage(1); // Reset to first page on new filters
  }, []);

  /**
   * Reset all filters
   */
  const handleResetFilters = useCallback(() => {
    setSelectedFilters({});
    setCurrentPage(1);
  }, []);

  /**
   * Open modal to add a new user
   */
  const handleAddUser = useCallback(() => {
    setCurrentUser(null);
    setModalOpen(true);
  }, []);

  /**
   * Open modal to edit an existing user
   * @param {Object} user - User data to edit
   */
  const handleEditUser = useCallback((user) => {
    setCurrentUser(user);
    setModalOpen(true);
  }, []);

  /**
   * Handle form submission for create/update
   * @param {Object} data - Form data
   */
  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Prepare data - ensure profileData is properly structured
      const formattedData = { ...data };

      // Process form data to properly structure the profileData
      const profileFields = {};

      // Extract profile fields from flat form data structure
      Object.keys(data).forEach((key) => {
        if (key.startsWith("profileData.")) {
          const fieldName = key.split("profileData.")[1];
          profileFields[fieldName] = data[key];
          delete formattedData[key]; // Remove the flat key
        }
      });

      // If we have any profile fields, add them as a profileData object
      if (Object.keys(profileFields).length > 0) {
        formattedData.profileData = profileFields;
      }

      if (currentUser) {
        // Update existing user
        await updateUser(currentUser._id, formattedData);
        toast.success("User updated successfully");
      } else {
        // Create new user
        await createUser(formattedData);
        toast.success("User created successfully");
      }

      setModalOpen(false);

      // Refetch users with current parameters
      const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
      fetchUsers({
        page: currentPage,
        limit: pageSize,
        sort: sortParam,
        search: searchTerm,
        ...selectedFilters,
      });
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle user deletion
   * @param {string} userId - ID of user to delete
   */
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        toast.success("User deleted successfully");

        // Refetch users with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchUsers({
          page: currentPage,
          limit: pageSize,
          sort: sortParam,
          search: searchTerm,
          ...selectedFilters,
        });
      } catch (error) {
        toast.error(error.message || "An error occurred");
      }
    }
  };

  /**
   * Handle bulk deletion of users
   * @param {Array<string>} userIds - IDs of users to delete
   */
  const handleBulkDelete = async (userIds) => {
    if (
      window.confirm(`Are you sure you want to delete ${userIds.length} users?`)
    ) {
      try {
        await bulkDeleteUsers(userIds);
        toast.success(`${userIds.length} users deleted successfully`);

        // Refetch users with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchUsers({
          page: currentPage,
          limit: pageSize,
          sort: sortParam,
          search: searchTerm,
          ...selectedFilters,
        });
      } catch (error) {
        toast.error(error.message || "An error occurred");
      }
    }
  };

  /**
   * Get form fields for the user modal
   * @returns {Array<Object>} Form fields
   */
  const getFormFields = () => {
    // Base fields for all users
    const baseFields = [
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        placeholder: "Enter username",
        validation: {
          minLength: {
            value: 3,
            message: "Username must be at least 3 characters",
          },
        },
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "Enter email address",
        validation: {
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        },
      },
      {
        name: "UserId",
        label: "User ID",
        type: "text",
        required: true,
        placeholder: currentRole
          ? `${
              currentRole === "admin"
                ? "A"
                : currentRole === "teacher"
                ? "T"
                : "S"
            }0000000`
          : "Enter User ID",
        validation: {
          pattern: {
            // Should be A/T/S + 7 digits based on role
            value: /^[ATS]\d{7}$/,
            message:
              "Invalid User ID format. Must start with A/T/S followed by 7 digits",
          },
        },
      },
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        required: true,
        placeholder: "Enter first name",
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        required: true,
        placeholder: "Enter last name",
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        options: [
          { label: "Admin", value: "admin" },
          { label: "Teacher", value: "teacher" },
          { label: "Student", value: "student" },
        ],
        onChange: (value) => {
          // Only update if the value actually changed
          if (value !== currentRole) {
            setCurrentRole(value);
          }
        },
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Pending", value: "pending" },
        ],
      },
    ];

    // Add password field for new users
    if (!currentUser) {
      baseFields.push({
        name: "passwordHash",
        label: "Password",
        type: "password",
        required: true,
        placeholder: "Enter password",
        validation: {
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
        },
      });
    }

    // Get role-specific fields based on the selected role
    const roleSpecificFields = getRoleSpecificFormFields(currentRole);

    return [...baseFields, ...roleSpecificFields];
  };

  // Get filter options
  const filterOptions = getUserFilterOptions();

  // Get table columns
  const columns = getUserColumns({
    onEdit: handleEditUser,
    onDelete: handleDeleteUser,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserIcon className="w-8 h-8" />
          User Management
        </h1>
        <Button onClick={handleAddUser} className="flex items-center gap-1">
          <PlusIcon className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Error display */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {/* Data table */}
      <DataTable
        columns={columns}
        data={users || []}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        onSearch={handleSearchChange}
        searchValue={searchTerm}
        onBulkDelete={handleBulkDelete}
        isLoading={isLoading}
      />

      {/* Add/Edit User Modal */}
      <FormModal
        title={currentUser ? "Edit User" : "Add User"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={currentUser}
        fields={getFormFields()}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        key={`user-form-${currentUser ? currentUser._id : "new"}`}
      />
    </div>
  );
}
