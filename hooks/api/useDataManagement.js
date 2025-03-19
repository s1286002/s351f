/**
 * @file useDataManagement.js
 * @description Generic hook for CRUD operations on data models
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Generic data management hook that provides CRUD operations for a specific endpoint
 * @param {string} endpoint - API endpoint for the data type (e.g., "/api/user")
 * @returns {Object} CRUD operations and state
 */
export default function useDataManagement(endpoint) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Fetch data with filtering, sorting, and pagination
   * @param {Object} options - Query options
   * @param {string} options.sort - Sort criteria
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {Array<string>} options.fields - Fields to include
   * @param {string} options.search - Search term
   * @returns {Promise<Object>} Fetch result
   */
  const fetchData = useCallback(
    async (options = {}) => {
      console.log("From useDataManagement.js");
      console.log("Options:", options);

      const {
        sort,
        page = 1,
        limit = 20,
        fields,
        search,
        ...filterParams
      } = options;

      try {
        setIsLoading(true);
        setError(null);

        // Build query string
        const queryParams = new URLSearchParams();

        // Add filter parameters directly from the options object
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "object" && !Array.isArray(value)) {
              // Handle operator filters like { price: { gte: 100 } }
              Object.entries(value).forEach(([operator, operatorValue]) => {
                queryParams.append(`${key}[${operator}]`, operatorValue);
              });
            } else {
              queryParams.append(key, value);
            }
          }
        });

        // Add search
        if (search) {
          queryParams.append("search", search);
        }

        // Add sorting
        if (sort) {
          queryParams.append("sort", sort);
        }

        // Add pagination
        queryParams.append("page", page);
        queryParams.append("limit", limit);

        // Add field limiting
        if (fields && fields.length > 0) {
          queryParams.append("fields", fields.join(","));
        }

        const url = `${endpoint}?${queryParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data || []);

          // Handle pagination correctly based on the actual API response format
          if (result.pagination) {
            // If pagination is provided in a nested pagination object
            setTotalCount(result.pagination.total || result.count || 0);
            setTotalPages(result.pagination.pages || 1);
            setCurrentPage(result.pagination.page || 1);
          } else {
            // Fallback to the previous implementation
            setTotalCount(result.totalResults || result.count || 0);
            setTotalPages(result.totalPages || 1);
            setCurrentPage(result.page || 1);
          }

          return result;
        } else {
          throw new Error(result.error || "Unknown error occurred");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint]
  );

  /**
   * Get a single item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Fetch result
   */
  const getItem = useCallback(
    async (id) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${endpoint}/${id}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          return { success: true, data: result.data };
        } else {
          throw new Error(result.error || "Unknown error occurred");
        }
      } catch (err) {
        console.error(`Error fetching item with ID ${id}:`, err);
        setError(err.message || "Failed to load item");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint]
  );

  /**
   * Create a new item
   * @param {Object} itemData - Item data
   * @returns {Promise<Object>} Create result
   */
  const createItem = useCallback(
    async (itemData) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Item created successfully");
          // Refresh data
          fetchData();
          return { success: true, data: result.data };
        } else {
          throw new Error(result.error || "Unknown error occurred");
        }
      } catch (err) {
        console.error("Error creating item:", err);
        setError(err.message || "Failed to create item");
        toast.error(`Failed to create item: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, fetchData]
  );

  /**
   * Update an existing item
   * @param {string} id - Item ID
   * @param {Object} itemData - Updated item data
   * @returns {Promise<Object>} Update result
   */
  const updateItem = useCallback(
    async (id, itemData) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${endpoint}/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Item updated successfully");
          // Refresh data
          fetchData();
          return { success: true, data: result.data };
        } else {
          throw new Error(result.error || "Unknown error occurred");
        }
      } catch (err) {
        console.error(`Error updating item with ID ${id}:`, err);
        setError(err.message || "Failed to update item");
        toast.error(`Failed to update item: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, fetchData]
  );

  /**
   * Delete an item
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Delete result
   */
  const deleteItem = useCallback(
    async (id) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${endpoint}/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Item deleted successfully");
          // Refresh data
          fetchData();
          return { success: true };
        } else {
          throw new Error(result.error || "Unknown error occurred");
        }
      } catch (err) {
        console.error(`Error deleting item with ID ${id}:`, err);
        setError(err.message || "Failed to delete item");
        toast.error(`Failed to delete item: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, fetchData]
  );

  /**
   * Bulk delete multiple items
   * @param {Array<string>} ids - Array of item IDs
   * @returns {Promise<Object>} Bulk delete result
   */
  const bulkDelete = useCallback(
    async (ids) => {
      try {
        setIsLoading(true);
        setError(null);

        let successCount = 0;
        let failureCount = 0;

        // Process deletions sequentially
        for (const id of ids) {
          try {
            const result = await deleteItem(id);
            if (result.success) {
              successCount++;
            } else {
              failureCount++;
            }
          } catch (err) {
            console.error(`Error deleting item ${id}:`, err);
            failureCount++;
          }
        }

        // Show summary toast
        if (successCount > 0) {
          toast.success(`Successfully deleted ${successCount} items`);
        }
        if (failureCount > 0) {
          toast.error(`Failed to delete ${failureCount} items`);
        }

        // Refresh data once after all deletions
        await fetchData();

        return {
          success: true,
          summary: { successful: successCount, failed: failureCount },
        };
      } catch (err) {
        console.error("Error in bulk delete operation:", err);
        setError(err.message || "Failed to complete bulk delete operation");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [deleteItem, fetchData]
  );

  return {
    data,
    isLoading,
    error,
    totalCount,
    currentPage,
    totalPages,
    fetchData,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    setCurrentPage,
  };
}
