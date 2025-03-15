import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone } from "lucide-react";

/**
 * Teacher-specific profile information component
 * @param {Object} props - Component props
 * @param {Object} props.user - User data with teacher profile information
 * @returns {JSX.Element} Teacher profile component
 */
export default function TeacherProfile({ user }) {
  if (!user || user.role !== "teacher") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teaching Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">
                {user?.profileData?.status || "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Contact Phone</p>
              <p className="font-medium">
                {user?.profileData?.contactPhone || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Biography</p>
          <p className="text-sm">
            {user?.profileData?.bio || "No biography provided."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
