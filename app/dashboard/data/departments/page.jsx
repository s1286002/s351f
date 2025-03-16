"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useDepartments from "@/hooks/api/useDepartments";
import DataTable from "@/components/dashboard/admin/DataTable";
import FilterBar from "@/components/dashboard/admin/FilterBar";
import FormModal from "@/components/dashboard/admin/FormModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FolderIcon, PlusIcon } from "lucide-react";

/**
 * Available page size options
 */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Admin department management page
 * @returns {JSX.Element} Department management page
 */
export default function DepartmentsPage() {
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
  const sortParam = searchParams.get("sort") || "name";
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

      // Handle operator-based filters like date[gte]=2023-01-01
      if (key.includes("[") && key.includes("]")) {
        const fieldName = key.substring(0, key.indexOf("["));
        const operator = key.substring(key.indexOf("[") + 1, key.indexOf("]"));

        // Initialize nested object if needed
        if (!filters[fieldName]) filters[fieldName] = {};

        // Add operator-based filter
        filters[fieldName][operator] = value;
      } else {
        // Simple filters
        filters[key] = value;
      }
    }

    return filters;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDepartmentData, setViewDepartmentData] = useState(null);

  // Get department data and operations from hook
  const {
    data: departments,
    isLoading,
    error,
    totalCount,
    totalPages,
    fetchData: fetchDepartments,
    createItem: createDepartment,
    updateItem: updateDepartment,
    deleteItem: deleteDepartment,
    bulkDelete: bulkDeleteDepartments,
    getDepartmentColumns,
    getDepartmentFormFields,
    getDepartmentFilterOptions,
    getItem: getDepartmentById,
  } = useDepartments();

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
    router.push(`/dashboard/data/departments${url}`, { scroll: false });
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

  // Fetch departments when page parameters change
  useEffect(() => {
    // Prepare sort parameter as expected by backend API
    let sortParam;
    if (sortField) {
      sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
    }

    fetchDepartments({
      page: currentPage,
      limit: pageSize,
      sort: sortParam,
      search: searchTerm,
      // Convert filters to direct query params as expected by APIFeatures
      ...selectedFilters,
    }).then((result) => {
      console.log("Departments fetched:", result);
    });
  }, [
    fetchDepartments,
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
   * Apply filters to the department list
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
   * Open modal to add a new department
   */
  const handleAddDepartment = useCallback(() => {
    setCurrentDepartment(null);
    setModalOpen(true);
  }, []);

  /**
   * Open modal to edit an existing department
   * @param {Object} department - Department data to edit
   */
  const handleEditDepartment = useCallback((department) => {
    setCurrentDepartment(department);
    setModalOpen(true);
  }, []);

  /**
   * Handle viewing department details
   * @param {Object} department - Department to view
   */
  const handleViewDepartment = async (department) => {
    try {
      // This will trigger the getItem function in the useDepartments hook
      const result = await getDepartmentById(department._id);
      if (result.success) {
        setViewDepartmentData(result.data);
        setViewModalOpen(true);
      } else {
        toast.error("Failed to load department details");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  /**
   * Handle form submission for create/update
   * @param {Object} data - Form data
   */
  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      if (currentDepartment) {
        // Update existing department
        await updateDepartment(currentDepartment._id, data);
        toast.success("Department updated successfully");
      } else {
        // Create new department
        await createDepartment(data);
        toast.success("Department created successfully");
      }

      setModalOpen(false);

      // Refetch departments with current parameters
      const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
      fetchDepartments({
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
   * Handle department deletion
   * @param {string} departmentId - ID of department to delete
   */
  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(departmentId);
        toast.success("Department deleted successfully");

        // Refetch departments with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchDepartments({
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
   * Handle bulk deletion of departments
   * @param {Array<string>} departmentIds - IDs of departments to delete
   */
  const handleBulkDelete = async (departmentIds) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${departmentIds.length} departments?`
      )
    ) {
      try {
        await bulkDeleteDepartments(departmentIds);
        toast.success(
          `${departmentIds.length} departments deleted successfully`
        );

        // Refetch departments with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchDepartments({
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

  // Get filter options
  const filterOptions = getDepartmentFilterOptions();

  // Get table columns with action handlers
  const columns = getDepartmentColumns({
    onView: handleViewDepartment,
    onEdit: handleEditDepartment,
    onDelete: handleDeleteDepartment,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FolderIcon className="w-8 h-8" />
          Department Management
        </h1>
        <Button
          onClick={handleAddDepartment}
          className="flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          Add Department
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
        data={departments || []}
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
        onView={handleViewDepartment}
      />

      {/* Add/Edit Department Modal */}
      <FormModal
        title={currentDepartment ? "Edit Department" : "Add Department"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={currentDepartment}
        fields={getDepartmentFormFields()}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* View Department Modal */}
      {viewModalOpen && viewDepartmentData && (
        <FormModal
          title="Department Details"
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          initialData={viewDepartmentData}
          fields={getDepartmentFormFields()}
          onSubmit={() => setViewModalOpen(false)}
          isSubmitting={false}
          readOnly={true}
        />
      )}
    </div>
  );
}
