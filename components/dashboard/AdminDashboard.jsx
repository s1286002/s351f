import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  School,
  Activity,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

/**
 * Admin Dashboard component that displays admin-specific information
 * @param {Object} props - Component props
 * @param {Object} props.user - The current user object
 * @returns {JSX.Element} The admin dashboard component
 */
export default function AdminDashboard({ user }) {
  // Mock data - would be fetched from API in a real implementation
  const systemStats = {
    totalUsers: 1250,
    activeUsers: 1180,
    totalCourses: 85,
    activeCourses: 72,
    totalDepartments: 12,
    totalPrograms: 28,
  };

  const userDistribution = {
    students: 1050,
    teachers: 180,
    admins: 20,
  };

  const recentActivity = [
    {
      id: 1,
      action: "User Created",
      details: "New student account for Jane Smith",
      timestamp: "2023-04-12 09:45 AM",
      status: "success",
    },
    {
      id: 2,
      action: "Course Updated",
      details: "CS301 schedule modified",
      timestamp: "2023-04-12 11:30 AM",
      status: "success",
    },
    {
      id: 3,
      action: "Login Failed",
      details: "Multiple failed login attempts for user ID T0001234",
      timestamp: "2023-04-12 02:15 PM",
      status: "warning",
    },
    {
      id: 4,
      action: "System Backup",
      details: "Automated database backup completed",
      timestamp: "2023-04-13 01:00 AM",
      status: "success",
    },
    {
      id: 5,
      action: "User Deactivated",
      details: "Teacher account T0005678 deactivated",
      timestamp: "2023-04-13 10:20 AM",
      status: "info",
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "Course Creation",
      details: "New course: Advanced Machine Learning",
      requestedBy: "Dr. Robert Chen",
      date: "2023-04-10",
    },
    {
      id: 2,
      type: "Program Modification",
      details: "Computer Science curriculum update",
      requestedBy: "Dr. Sarah Johnson",
      date: "2023-04-11",
    },
    {
      id: 3,
      type: "User Role Change",
      details: "Promote user S0007890 to teaching assistant",
      requestedBy: "Dr. Michael Wong",
      date: "2023-04-12",
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: "Storage",
      message: "Database storage at 75% capacity",
      severity: "medium",
    },
    {
      id: 2,
      type: "Performance",
      message: "API response time increased by 15%",
      severity: "low",
    },
    {
      id: 3,
      type: "Security",
      message: "5 failed login attempts from unusual IP",
      severity: "high",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (systemStats.activeUsers / systemStats.totalUsers) * 100
              )}
              % active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userDistribution.students}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (userDistribution.students / systemStats.totalUsers) * 100
              )}
              % of users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userDistribution.teachers}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (userDistribution.teachers / systemStats.totalUsers) * 100
              )}
              % of users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.activeCourses} active courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats.totalDepartments}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStats.totalPrograms} programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {systemAlerts.filter((alert) => alert.severity === "high").length}{" "}
              high priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
          <CardDescription>Breakdown of system users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Students</p>
                <p className="text-sm font-medium">
                  {userDistribution.students}
                </p>
              </div>
              <Progress
                value={
                  (userDistribution.students / systemStats.totalUsers) * 100
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Teachers</p>
                <p className="text-sm font-medium">
                  {userDistribution.teachers}
                </p>
              </div>
              <Progress
                value={
                  (userDistribution.teachers / systemStats.totalUsers) * 100
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Administrators</p>
                <p className="text-sm font-medium">{userDistribution.admins}</p>
              </div>
              <Progress
                value={(userDistribution.admins / systemStats.totalUsers) * 100}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>
            Current system warnings and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4">
                <div
                  className={`h-2 w-2 rounded-full ${
                    alert.severity === "high"
                      ? "bg-red-500"
                      : alert.severity === "medium"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium">{alert.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    alert.severity === "high"
                      ? "bg-red-100 text-red-800"
                      : alert.severity === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {alert.severity}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Items requiring administrator review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.details}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.requestedBy}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested: {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div
                  className={`h-2 w-2 rounded-full ${
                    activity.status === "success"
                      ? "bg-green-500"
                      : activity.status === "warning"
                      ? "bg-yellow-500"
                      : activity.status === "error"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
