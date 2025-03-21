"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAttendance from "@/hooks/api/useAttendance";
import DataTable from "@/components/dashboard/admin/DataTable";
import FilterBar from "@/components/dashboard/admin/FilterBar";
import FormModal from "@/components/dashboard/admin/FormModal";
import { Button } from "@/components/ui/button";
import { CalendarCheckIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

/**
 * Available page size options
 */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Admin attendance management page
 * @returns {JSX.Element} Attendance management page
 */
export default function AttendancePage() {
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
  const sortParam = searchParams.get("sort") || "date";
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
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewAttendanceData, setViewAttendanceData] = useState(null);

  // Get attendance data and operations from hook
  const {
    data: attendanceRecords,
    isLoading,
    error,
    totalCount,
    totalPages,
    fetchData: fetchAttendance,
    createItem: createAttendance,
    updateItem: updateAttendance,
    deleteItem: deleteAttendance,
    bulkDelete: bulkDeleteAttendance,
    getAttendanceColumns,
    getAttendanceFormFields,
    getAttendanceFilterOptions,
    getItem: getAttendanceById,
  } = useAttendance();

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
    router.push(`/dashboard/data/attendance${url}`, { scroll: false });
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

  // Fetch attendance records when page parameters change
  useEffect(() => {
    // Prepare sort parameter as expected by backend API
    let sortParam;
    if (sortField) {
      sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
    }

    fetchAttendance({
      page: currentPage,
      limit: pageSize,
      sort: sortParam,
      search: searchTerm,
      // Convert filters to direct query params as expected by APIFeatures
      ...selectedFilters,
    }).then((result) => {
      console.log("Attendance records fetched:", result);
    });
  }, [
    fetchAttendance,
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
   * Apply filters to the attendance list
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
   * Open modal to add a new attendance record
   */
  const handleAddAttendance = useCallback(() => {
    setCurrentAttendance(null);
    setModalOpen(true);
  }, []);

  /**
   * Open modal to edit an existing attendance record
   * @param {Object} attendance - Attendance data to edit
   */
  const handleEditAttendance = useCallback((attendance) => {
    setCurrentAttendance(attendance);
    setModalOpen(true);
  }, []);

  /**
   * Handle viewing attendance details
   * @param {Object} attendance - Attendance record to view
   */
  const handleViewAttendance = async (attendance) => {
    try {
      // This will trigger the getItem function in the useAttendance hook
      const result = await getAttendanceById(attendance._id);
      if (result.success) {
        setViewAttendanceData(result.data);
        setViewModalOpen(true);
      } else {
        toast.error("Failed to load attendance details");
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
      // Format the data - ensure IDs are extracted from objects if needed
      const formattedData = { ...data };

      // Handle studentId - ensure it's just the ID
      if (
        formattedData.studentId &&
        typeof formattedData.studentId === "object"
      ) {
        formattedData.studentId =
          formattedData.studentId._id ||
          formattedData.studentId.id ||
          formattedData.studentId.value ||
          formattedData.studentId;
      }

      // Handle courseId - ensure it's just the ID
      if (
        formattedData.courseId &&
        typeof formattedData.courseId === "object"
      ) {
        formattedData.courseId =
          formattedData.courseId._id ||
          formattedData.courseId.id ||
          formattedData.courseId.value ||
          formattedData.courseId;
      }

      // Format date if needed
      if (formattedData.date && typeof formattedData.date === "object") {
        // Handle Date object or other non-string date format
        formattedData.date = formattedData.date.toISOString
          ? formattedData.date.toISOString().split("T")[0]
          : formattedData.date;
      }

      if (currentAttendance) {
        // Update existing attendance record
        await updateAttendance(currentAttendance._id, formattedData);
        toast.success("Attendance record updated successfully");
      } else {
        // Create new attendance record
        await createAttendance(formattedData);
        toast.success("Attendance record created successfully");
      }

      setModalOpen(false);

      // Refetch attendance records with current parameters
      const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
      fetchAttendance({
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
   * Handle attendance record deletion
   * @param {string} attendanceId - ID of attendance record to delete
   */
  const handleDeleteAttendance = async (attendanceId) => {
    if (
      window.confirm("Are you sure you want to delete this attendance record?")
    ) {
      try {
        await deleteAttendance(attendanceId);
        toast.success("Attendance record deleted successfully");

        // Refetch attendance records with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchAttendance({
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
   * Handle bulk deletion of attendance records
   * @param {Array<string>} attendanceIds - IDs of attendance records to delete
   */
  const handleBulkDelete = async (attendanceIds) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${attendanceIds.length} attendance records?`
      )
    ) {
      try {
        await bulkDeleteAttendance(attendanceIds);
        toast.success(
          `${attendanceIds.length} attendance records deleted successfully`
        );

        // Refetch attendance records with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchAttendance({
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
  const filterOptions = getAttendanceFilterOptions();

  // Get table columns with action handlers
  const columns = getAttendanceColumns({
    onView: handleViewAttendance,
    onEdit: handleEditAttendance,
    onDelete: handleDeleteAttendance,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CalendarCheckIcon className="w-8 h-8" />
          Attendance Management
        </h1>
        <Button
          onClick={handleAddAttendance}
          className="flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          Add Attendance Record
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
        data={attendanceRecords || []}
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
        onView={handleViewAttendance}
      />

      {/* Add/Edit Attendance Modal */}
      <FormModal
        title={
          currentAttendance ? "Edit Attendance Record" : "Add Attendance Record"
        }
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={currentAttendance}
        fields={getAttendanceFormFields()}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* View Attendance Modal */}
      {viewModalOpen && viewAttendanceData && (
        <FormModal
          title="Attendance Details"
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          initialData={viewAttendanceData}
          fields={getAttendanceFormFields()}
          onSubmit={(data) => {
            // Format the data - ensure IDs are extracted from objects if needed
            const formattedData = { ...data };

            // Handle studentId - ensure it's just the ID
            if (
              formattedData.studentId &&
              typeof formattedData.studentId === "object"
            ) {
              formattedData.studentId =
                formattedData.studentId._id ||
                formattedData.studentId.id ||
                formattedData.studentId.value ||
                formattedData.studentId;
            }

            // Handle courseId - ensure it's just the ID
            if (
              formattedData.courseId &&
              typeof formattedData.courseId === "object"
            ) {
              formattedData.courseId =
                formattedData.courseId._id ||
                formattedData.courseId.id ||
                formattedData.courseId.value ||
                formattedData.courseId;
            }

            // Format date if needed
            if (formattedData.date && typeof formattedData.date === "object") {
              // Handle Date object or other non-string date format
              formattedData.date = formattedData.date.toISOString
                ? formattedData.date.toISOString().split("T")[0]
                : formattedData.date;
            }

            // Use the same function as the edit modal but with viewAttendanceData
            setIsSubmitting(true);
            updateAttendance(viewAttendanceData._id, formattedData)
              .then(() => {
                toast.success("Attendance record updated successfully");
                setViewModalOpen(false);

                // Refetch attendance records with current parameters
                const sortParam =
                  sortOrder === "desc" ? `-${sortField}` : sortField;
                return fetchAttendance({
                  page: currentPage,
                  limit: pageSize,
                  sort: sortParam,
                  search: searchTerm,
                  ...selectedFilters,
                });
              })
              .catch((error) => {
                toast.error(error.message || "An error occurred");
              })
              .finally(() => {
                setIsSubmitting(false);
              });
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
