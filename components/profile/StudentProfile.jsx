import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Building, GraduationCap, BookOpen } from "lucide-react";

/**
 * Student-specific profile information component
 * @param {Object} props - Component props
 * @param {Object} props.user - User data with student profile information
 * @returns {JSX.Element} Student profile component
 */
export default function StudentProfile({ user }) {
  if (!user || user.role !== "student") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Enrollment Status</p>
              <p className="font-medium capitalize">
                {user?.profileData?.enrollmentStatus?.replace("_", " ") ||
                  "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-medium">
                {user?.profileData?.year || "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">
                {user?.profileData?.departmentName ||
                  (user?.profileData?.departmentId &&
                    user.profileData.departmentId.name) ||
                  "Unknown"}
              </p>
              {user?.profileData?.departmentCode ||
              (user?.profileData?.departmentId &&
                user.profileData.departmentId.code) ? (
                <p className="text-xs text-muted-foreground">
                  Code:{" "}
                  {user?.profileData?.departmentCode ||
                    user.profileData.departmentId.code}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Program</p>
              <p className="font-medium">
                {user?.profileData?.programName ||
                  (user?.profileData?.programId &&
                    user.profileData.programId.name) ||
                  "Unknown"}
              </p>
              {user?.profileData?.programCode ||
              (user?.profileData?.programId &&
                user.profileData.programId.programCode) ? (
                <p className="text-xs text-muted-foreground">
                  Code:{" "}
                  {user?.profileData?.programCode ||
                    user.profileData.programId.programCode}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
