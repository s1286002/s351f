"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import usePrograms from "@/hooks/api/usePrograms";
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
 * Admin program management page
 * @returns {JSX.Element} Program management page
 */
export default function ProgramsPage() {
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
  const [currentProgram, setCurrentProgram] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProgramData, setViewProgramData] = useState(null);

  // Get program data and operations from hook
  const {
    data: programs,
    isLoading,
    error,
    totalCount,
    totalPages,
    fetchData: fetchPrograms,
    createItem: createProgram,
    updateItem: updateProgram,
    deleteItem: deleteProgram,
    bulkDelete: bulkDeletePrograms,
    getProgramColumns,
    getProgramFormFields,
    getProgramFilterOptions,
    getItem: getProgramById,
  } = usePrograms();

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
    router.push(`/dashboard/data/programs${url}`, { scroll: false });
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

  // Fetch programs when page parameters change
  useEffect(() => {
    // Prepare sort parameter as expected by backend API
    let sortParam;
    if (sortField) {
      sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
    }

    fetchPrograms({
      page: currentPage,
      limit: pageSize,
      sort: sortParam,
      search: searchTerm,
      // Convert filters to direct query params as expected by APIFeatures
      ...selectedFilters,
    }).then((result) => {
      console.log("Programs fetched:", result);
    });
  }, [
    fetchPrograms,
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
   * Apply filters to the program list
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
   * Open modal to add a new program
   */
  const handleAddProgram = useCallback(() => {
    setCurrentProgram(null);
    setModalOpen(true);
  }, []);

  /**
   * Open modal to edit an existing program
   * @param {Object} program - Program data to edit
   */
  const handleEditProgram = useCallback((program) => {
    setCurrentProgram(program);
    setModalOpen(true);
  }, []);

  /**
   * Handle viewing program details
   * @param {Object} program - Program to view
   */
  const handleViewProgram = async (program) => {
    try {
      // This will trigger the getItem function in the usePrograms hook
      const result = await getProgramById(program._id);
      if (result.success) {
        setViewProgramData(result.data);
        setViewModalOpen(true);
      } else {
        toast.error("Failed to load program details");
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
      if (currentProgram) {
        // Update existing program
        await updateProgram(currentProgram._id, data);
        toast.success("Program updated successfully");
      } else {
        // Create new program
        await createProgram(data);
        toast.success("Program created successfully");
      }

      setModalOpen(false);

      // Refetch programs with current parameters
      const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
      fetchPrograms({
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
   * Handle program deletion
   * @param {string} programId - ID of program to delete
   */
  const handleDeleteProgram = async (programId) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await deleteProgram(programId);
        toast.success("Program deleted successfully");

        // Refetch programs with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchPrograms({
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
   * Handle bulk deletion of programs
   * @param {Array<string>} programIds - IDs of programs to delete
   */
  const handleBulkDelete = async (programIds) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${programIds.length} programs?`
      )
    ) {
      try {
        await bulkDeletePrograms(programIds);
        toast.success(`${programIds.length} programs deleted successfully`);

        // Refetch programs with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchPrograms({
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
  const filterOptions = getProgramFilterOptions();

  // Get table columns with action handlers
  const columns = getProgramColumns({
    onView: handleViewProgram,
    onEdit: handleEditProgram,
    onDelete: handleDeleteProgram,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCapIcon className="w-8 h-8" />
          Program Management
        </h1>
        <Button onClick={handleAddProgram} className="flex items-center gap-1">
          <PlusIcon className="w-4 h-4" />
          Add Program
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
        data={programs || []}
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
        onView={handleViewProgram}
      />

      {/* Add/Edit Program Modal */}
      <FormModal
        title={currentProgram ? "Edit Program" : "Add Program"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={currentProgram}
        fields={getProgramFormFields()}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* View Program Modal */}
      {viewModalOpen && viewProgramData && (
        <FormModal
          title="Program Details"
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          initialData={viewProgramData}
          fields={getProgramFormFields()}
          onSubmit={() => setViewModalOpen(false)}
          isSubmitting={false}
          readOnly={true}
        />
      )}
    </div>
  );
}
