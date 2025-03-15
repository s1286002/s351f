import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { User, Mail, Phone, Calendar, MapPin } from "lucide-react";

/**
 * Combined personal and account information component
 * @param {Object} props - Component props
 * @param {Object} props.user - User data
 * @returns {JSX.Element} User information card component
 */
export default function UserInfoCard({ user }) {
  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
            <AvatarFallback className="text-4xl">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-bold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>

        <Separator orientation="vertical" className="hidden md:block" />

        <div className="flex-1 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              {(user?.role === "student" || user?.role === "teacher") && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {user?.role === "student"
                        ? user?.profileData?.phone || "Not provided"
                        : user?.profileData?.contactPhone || "Not provided"}
                    </p>
                  </div>
                </div>
              )}

              {user?.role === "student" && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {user?.profileData?.dateOfBirth
                          ? format(
                              new Date(user.profileData.dateOfBirth),
                              "MMMM d, yyyy"
                            )
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {user?.profileData?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{user?.UserId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Account Created
                  </p>
                  <p className="font-medium">
                    {user?.createdAt
                      ? format(new Date(user.createdAt), "MMMM d, yyyy")
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {user?.lastLogin
                      ? format(
                          new Date(user.lastLogin),
                          "MMMM d, yyyy 'at' h:mm a"
                        )
                      : "Never"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        user?.status === "active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    <p className="font-medium capitalize">{user?.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
