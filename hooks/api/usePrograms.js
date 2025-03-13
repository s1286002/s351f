/**
 * @file usePrograms.js
 * @description Custom hook to fetch programs from the API, optionally filtered by department
 */

import { useState, useEffect } from "react";

/**
 * Custom hook to fetch programs, optionally filtered by department ID
 *
 * @param {string} departmentId - Optional department ID to filter programs
 * @returns {Object} Object containing programs data, loading state, and error
 */
export default function usePrograms(departmentId = null) {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches programs data from the API
     */
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build the URL with optional department filter
        let url = "/api/program";
        if (departmentId) {
          url += `?department=${departmentId}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch programs: ${response.status}`);
        }

        const responseData = await response.json();
        // Extract the programs array from the data property of the response
        setPrograms(responseData.data || []);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError(err.message || "Failed to load programs");
        // Set programs to empty array on error
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [departmentId]); // Re-fetch when departmentId changes

  return { programs, isLoading, error };
}
