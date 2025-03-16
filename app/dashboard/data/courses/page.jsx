"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useCourses from "@/hooks/api/useCourses";
import DataTable from "@/components/dashboard/admin/DataTable";
import FilterBar from "@/components/dashboard/admin/FilterBar";
import FormModal from "@/components/dashboard/admin/FormModal";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

/**
 * Available page size options
 */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Admin course management page
 * @returns {JSX.Element} Course management page
 */
export default function CoursesPage() {
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
  const sortParam = searchParams.get("sort") || "title";
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
  const [currentCourse, setCurrentCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewCourseData, setViewCourseData] = useState(null);

  // Get course data and operations from hook
  const {
    data: courses,
    isLoading,
    error,
    totalCount,
    totalPages,
    fetchData: fetchCourses,
    createItem: createCourse,
    updateItem: updateCourse,
    deleteItem: deleteCourse,
    bulkDelete: bulkDeleteCourses,
    getCourseColumns,
    getCourseFormFields,
    getCourseFilterOptions,
    getItem: getCourseById,
  } = useCourses();

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
    router.push(`/dashboard/data/courses${url}`, { scroll: false });
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

  // Fetch courses when page parameters change
  useEffect(() => {
    // Prepare sort parameter as expected by backend API
    let sortParam;
    if (sortField) {
      sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
    }

    fetchCourses({
      page: currentPage,
      limit: pageSize,
      sort: sortParam,
      search: searchTerm,
      // Convert filters to direct query params as expected by APIFeatures
      ...selectedFilters,
    }).then((result) => {
      console.log("Courses fetched:", result);
    });
  }, [
    fetchCourses,
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
   * Apply filters to the course list
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
   * Open modal to add a new course
   */
  const handleAddCourse = useCallback(() => {
    setCurrentCourse(null);
    setModalOpen(true);
  }, []);

  /**
   * Open modal to edit an existing course
   * @param {Object} course - Course data to edit
   */
  const handleEditCourse = useCallback((course) => {
    setCurrentCourse(course);
    setModalOpen(true);
  }, []);

  /**
   * Handle viewing course details
   * @param {Object} course - Course to view
   */
  const handleViewCourse = async (course) => {
    try {
      // This will trigger the getItem function in the useCourses hook
      const result = await getCourseById(course._id);
      if (result.success) {
        setViewCourseData(result.data);
        setViewModalOpen(true);
      } else {
        toast.error("Failed to load course details");
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
      // Format the data - transform arrays to correct format if needed
      const formattedData = { ...data };

      // Handle programs selection - ensure it's an array of IDs
      if (
        Array.isArray(formattedData.programIds) &&
        formattedData.programIds.length > 0
      ) {
        // If programIds contains objects, extract just the IDs
        if (typeof formattedData.programIds[0] === "object") {
          formattedData.programIds = formattedData.programIds.map(
            (program) => program._id || program.id || program.value || program
          );
        }
      }

      // Handle prerequisites - ensure it's an array of IDs
      if (
        Array.isArray(formattedData.prerequisites) &&
        formattedData.prerequisites.length > 0
      ) {
        // If prerequisites contains objects, extract just the IDs
        if (typeof formattedData.prerequisites[0] === "object") {
          formattedData.prerequisites = formattedData.prerequisites.map(
            (prereq) => prereq._id || prereq.id || prereq.value || prereq
          );
        }
      }

      if (currentCourse) {
        // Update existing course
        await updateCourse(currentCourse._id, formattedData);
        toast.success("Course updated successfully");
      } else {
        // Create new course
        await createCourse(formattedData);
        toast.success("Course created successfully");
      }

      setModalOpen(false);

      // Refetch courses with current parameters
      const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
      fetchCourses({
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
   * Handle course deletion
   * @param {string} courseId - ID of course to delete
   */
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId);
        toast.success("Course deleted successfully");

        // Refetch courses with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchCourses({
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
   * Handle bulk deletion of courses
   * @param {Array<string>} courseIds - IDs of courses to delete
   */
  const handleBulkDelete = async (courseIds) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${courseIds.length} courses?`
      )
    ) {
      try {
        await bulkDeleteCourses(courseIds);
        toast.success(`${courseIds.length} courses deleted successfully`);

        // Refetch courses with current parameters
        const sortParam = sortOrder === "desc" ? `-${sortField}` : sortField;
        fetchCourses({
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
  const filterOptions = getCourseFilterOptions();

  // Get table columns with action handlers
  const columns = getCourseColumns({
    onView: handleViewCourse,
    onEdit: handleEditCourse,
    onDelete: handleDeleteCourse,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpenIcon className="w-8 h-8" />
          Course Management
        </h1>
        <Button onClick={handleAddCourse} className="flex items-center gap-1">
          <PlusIcon className="w-4 h-4" />
          Add Course
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
        data={courses || []}
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
        onView={handleViewCourse}
      />

      {/* Add/Edit Course Modal */}
      <FormModal
        title={currentCourse ? "Edit Course" : "Add Course"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={currentCourse}
        fields={getCourseFormFields()}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* View Course Modal */}
      {viewModalOpen && viewCourseData && (
        <FormModal
          title="Course Details"
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          initialData={viewCourseData}
          fields={getCourseFormFields()}
          onSubmit={() => setViewModalOpen(false)}
          isSubmitting={false}
          readOnly={true}
        />
      )}
    </div>
  );
}
