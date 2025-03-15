/**
 * @file useMongoError.js
 * @description Custom hook for handling MongoDB errors in forms
 */

import { useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook for handling MongoDB errors in forms
 *
 * @param {Object} form - React Hook Form instance
 * @returns {Object} Error handling utilities
 */
export default function useMongoError(form) {
  const [apiError, setApiError] = useState(null);

  /**
   * Handle API error response
   *
   * @param {Object} error - Error response from API
   * @param {Object} response - Fetch response object
   */
  const handleApiError = (error, response) => {
    // Clear previous errors
    setApiError(null);

    if (error.field) {
      // Set error on specific field
      form.setError(error.field, {
        type: "server",
        message: error.message,
      });

      // For nested fields (e.g., profileData.field)
      if (error.field.includes(".")) {
        form.setError(error.field, {
          type: "server",
          message: error.message,
        });
      }

      // Show toast for field errors
      toast.error(error.message);
    } else {
      // General API error
      setApiError({
        message: error.message || "Operation failed",
        code: response?.status || 500,
      });

      // Show toast for general errors
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  /**
   * Process API response and handle errors
   *
   * @param {Response} response - Fetch API response
   * @returns {Promise<Object>} Processed response data or throws error
   */
  const processApiResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
      handleApiError(data, response);
      throw new Error(data.message || "Operation failed");
    }

    return data;
  };

  /**
   * Clear all API errors
   */
  const clearErrors = () => {
    setApiError(null);
  };

  return {
    apiError,
    handleApiError,
    processApiResponse,
    clearErrors,
  };
}
