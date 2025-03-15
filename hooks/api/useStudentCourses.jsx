import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Custom hook to fetch student courses
 * @param {string} studentId - The ID of the student
 * @returns {Object} - Object containing courses data, loading state, and error state
 */
const useStudentCourses = (studentId) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `/api/academic/?studentId=${studentId}`
        );
        const academicRecords = response.data.data;
        if (academicRecords.length === 0) {
          setLoading(false);
          return;
        }

        // Transform academic records into course objects
        const transformedCourses = academicRecords.map((record) => {
          // Extract course data from the populated courseId
          const courseData = record.courseId || {};

          return {
            _id: record._id,
            courseCode: courseData.courseCode || "N/A",
            title: courseData.title || "Unknown Course",
            credits: courseData.credits || 0,
            description: courseData.description || "",
            department: courseData.department || "Unknown Department",
            semester: record.semester || "",
            year: record.academicYear ? record.academicYear.split("-")[0] : "",
            status: record.registrationStatus || "Unknown",
            grade: record.grade ? record.grade.letterGrade : null,
          };
        });

        // Sort courses by semester and year
        const sortedCourses = transformedCourses.sort((a, b) => {
          // First sort by year
          if (a.year !== b.year) {
            return b.year - a.year; // Descending order by year
          }

          // If same year, sort by semester
          const semesterOrder = { Spring: 1, Summer: 2, Fall: 3, Winter: 4 };
          return semesterOrder[a.semester] - semesterOrder[b.semester];
        });

        setCourses(sortedCourses);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch courses");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [studentId]);

  return { courses, loading, error };
};

export default useStudentCourses;
