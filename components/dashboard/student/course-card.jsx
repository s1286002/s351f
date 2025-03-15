import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * CourseCard component to display course information
 * @param {Object} props - Component props
 * @param {Object} props.course - Course data object
 * @returns {JSX.Element} - Rendered component
 */
const CourseCard = ({ course }) => {
  // Determine status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "dropped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold">
                {course.courseCode}
              </CardTitle>
              <Badge variant="outline" className="ml-2">
                {course.credits} Credits
              </Badge>
            </div>
            <h3 className="text-md font-semibold mt-1">{course.title}</h3>
          </div>
          <div className="flex flex-col items-end">
            <Badge className={getStatusColor(course.status)}>
              {course.status}
            </Badge>
            {course.grade && (
              <span className="text-sm font-medium mt-1">
                Grade: {course.grade}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 mb-2">{course.description}</div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>
            {course.semester} {course.year}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
