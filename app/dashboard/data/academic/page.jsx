"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAcademicRecords from "@/hooks/api/useAcademicRecords";
import DataTable from "@/components/dashboard/admin/DataTable";
import FilterBar from "@/components/dashboard/admin/FilterBar";
import FormModal from "@/components/dashboard/admin/FormModal";
import { Button } from "@/components/ui/button";
import { GraduationCapIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

/**
 * Available page size options
 */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Admin academic records management page
 * @returns {JSX.Element} Academic records management page
 */
export default function AcademicRecordsPage() {
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
  const sortParam = searchParams.get("sort") || "academicYear";
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
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewRecordData, setViewRecordData] = useState(null);

  // Get academic record data and operations from hook
  const {
    data: academicRecords,
    isLoading,
    error,
    totalCount,
    totalPages,
    fetchData: fetchAcademicRecords,
    createItem: createAcademicRecord,
    updateItem: updateAcademicRecord,
    deleteItem: deleteAcademicRecord,
    bulkDelete: bulkDeleteAcademicRecords,
    getAcademicRecordColumns,
    getAcademicRecordFormFields,
    getAcademicRecordFilterOptions,
    getItem: getAcademicRecordById,
  } = useAcademicRecords();

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
    router.push(`/dashboard/data/academic${url}`, { scroll: false });
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

  // Fetch academic records when page parameters change
  useEffect(() => {
    // Prepare sort parameter as expected by backend API
    let sortParam;
    if (sortField) {
      sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
    }

    fetchAcademicRecords({
      page: currentPage,
      limit: pageSize,
      sort: sortParam,
      search: searchTerm,
      // Convert filters to direct query params as expected by APIFeatures
      ...selectedFilters,
    }).then((result) => {
      console.log("Academic records fetched:", result);
    });
  }, [
    fetchAcademicRecords,
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
   * Apply filters to the academic records list
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
   * Open modal to add a new academic record
   */
  const handleAddRecord = useCallback(() => {
    setCurrentRecord(null);
    setModalOpen(true);
  }, []);

  /**
   * Open modal to edit an existing academic record
   * @param {Object} record - Academic record data to edit
   */
  const handleEditRecord = useCallback((record) => {
    setCurrentRecord(record);
    setModalOpen(true);
  }, []);

  /**
   * Handle viewing academic record details
   * @param {Object} record - Academic record to view
   */
  const handleViewRecord = async (record) => {
    try {
      // This will trigger the getItem function in the useAcademicRecords hook
      const result = await getAcademicRecordById(record._id);
      if (result.success) {
        setViewRecordData(result.data);
        setViewModalOpen(true);
      } else {
        toast.error("Failed to load academic record details");
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

      // Format nested grade object if needed
      if (formattedData.grade) {
        // Ensure grade has proper structure
        formattedData.grade = {
          midterm:
            formattedData.grade.midterm !== undefined
              ? Number(formattedData.grade.midterm)
              : undefined,
          final:
            formattedData.grade.final !== undefined
              ? Number(formattedData.grade.final)
              : undefined,
          totalScore:
            formattedData.grade.totalScore !== undefined
              ? Number(formattedData.grade.totalScore)
              : undefined,
          letterGrade: formattedData.grade.letterGrade || undefined,
          assignments: formattedData.grade.assignments || [],
        };
      }

      if (currentRecord) {
        // Update existing academic record
        await updateAcademicRecord(currentRecord._id, formattedData);
        toast.success("Academic record updated successfully");
      } else {
        // Create new academic record
        await createAcademicRecord(formattedData);
        toast.success("Academic record created successfully");
      }

      setModalOpen(false);

      // Refetch academic records with current parameters
      const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
      fetchAcademicRecords({
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
   * Handle academic record deletion
   * @param {string} recordId - ID of academic record to delete
   */
  const handleDeleteRecord = async (recordId) => {
    if (
      window.confirm("Are you sure you want to delete this academic record?")
    ) {
      try {
        await deleteAcademicRecord(recordId);
        toast.success("Academic record deleted successfully");

        // Refetch academic records with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchAcademicRecords({
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
   * Handle bulk deletion of academic records
   * @param {Array<string>} recordIds - IDs of academic records to delete
   */
  const handleBulkDelete = async (recordIds) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${recordIds.length} academic records?`
      )
    ) {
      try {
        await bulkDeleteAcademicRecords(recordIds);
        toast.success(
          `${recordIds.length} academic records deleted successfully`
        );

        // Refetch academic records with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchAcademicRecords({
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
  const filterOptions = getAcademicRecordFilterOptions();

  // Get table columns with action handlers
  const columns = getAcademicRecordColumns({
    onView: handleViewRecord,
    onEdit: handleEditRecord,
    onDelete: handleDeleteRecord,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCapIcon className="w-8 h-8" />
          Academic Records Management
        </h1>
        <Button onClick={handleAddRecord} className="flex items-center gap-1">
          <PlusIcon className="w-4 h-4" />
          Add Academic Record
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
        data={academicRecords || []}
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
        onView={handleViewRecord}
      />

      {/* Add/Edit Academic Record Modal */}
      <FormModal
        title={currentRecord ? "Edit Academic Record" : "Add Academic Record"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={currentRecord}
        fields={getAcademicRecordFormFields()}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* View Academic Record Modal */}
      {viewModalOpen && viewRecordData && (
        <FormModal
          title="Academic Record Details"
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          initialData={viewRecordData}
          fields={getAcademicRecordFormFields()}
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

            // Format nested grade object if needed
            if (formattedData.grade) {
              // Ensure grade has proper structure
              formattedData.grade = {
                midterm:
                  formattedData.grade.midterm !== undefined
                    ? Number(formattedData.grade.midterm)
                    : undefined,
                final:
                  formattedData.grade.final !== undefined
                    ? Number(formattedData.grade.final)
                    : undefined,
                totalScore:
                  formattedData.grade.totalScore !== undefined
                    ? Number(formattedData.grade.totalScore)
                    : undefined,
                letterGrade: formattedData.grade.letterGrade || undefined,
                assignments: formattedData.grade.assignments || [],
              };
            }

            // Use the same function as the edit modal but with viewRecordData
            setIsSubmitting(true);
            updateAcademicRecord(viewRecordData._id, formattedData)
              .then(() => {
                toast.success("Academic record updated successfully");
                setViewModalOpen(false);

                // Refetch academic records with current parameters
                const sortParam =
                  sortOrder === "desc" ? `-${sortField}` : sortField;
                return fetchAcademicRecords({
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
