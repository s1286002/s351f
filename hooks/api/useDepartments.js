/**
 * @file useDepartments.js
 * @description Custom hook to fetch departments from the API
 */

import { useState, useEffect } from "react";

// Mock data for departments
const MOCK_DEPARTMENTS = [
  { _id: "dept1", name: "Computer Science" },
  { _id: "dept2", name: "Electrical Engineering" },
  { _id: "dept3", name: "Business Administration" },
  { _id: "dept4", name: "Mathematics" },
  { _id: "dept5", name: "Physics" },
];

/**
 * Custom hook to fetch the list of departments
 *
 * @returns {Object} Object containing departments data, loading state, and error
 */
export default function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches departments data from the API
     */
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/department");

          if (!response.ok) {
            throw new Error(`Failed to fetch departments: ${response.status}`);
          }

          const responseData = await response.json();
          // Extract the departments array from the data property of the response
          setDepartments(responseData.data || []);
        } catch (err) {
          console.warn("Using mock departments data:", err.message);
          // Use mock data if API fails
          setDepartments(MOCK_DEPARTMENTS);
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
        setError(err.message || "Failed to load departments");
        // Set departments to empty array on error
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, isLoading, error };
}
