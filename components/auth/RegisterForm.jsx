import { useState } from "react";
import StudentRegisterForm from "./StudentRegisterForm";
import TeacherRegisterForm from "./TeacherRegisterForm";
import AdminRegisterForm from "./AdminRegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Main registration form component that allows role selection
 * @returns {JSX.Element} Registration form with role selection
 */
export default function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    setConfirmed(false);
  };

  const handleContinue = () => {
    setConfirmed(true);
  };

  const handleBack = () => {
    setConfirmed(false);
  };

  // If role is selected and confirmed, show the appropriate registration form
  if (selectedRole && confirmed) {
    switch (selectedRole) {
      case "student":
        return <StudentRegisterForm onBack={handleBack} />;
      case "teacher":
        return <TeacherRegisterForm onBack={handleBack} />;
      case "admin":
        return <AdminRegisterForm onBack={handleBack} />;
      default:
        return null;
    }
  }

  // Otherwise, show the role selection form
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Select your role to continue registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RadioGroup
            value={selectedRole}
            onValueChange={handleRoleChange}
            className="space-y-3"
          >
            <div
              className={cn(
                "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
                "hover:bg-gray-50",
                selectedRole === "student"
                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-200"
              )}
              onClick={() => handleRoleChange("student")}
            >
              <RadioGroupItem value="student" id="student" />
              <Label
                htmlFor="student"
                className="flex-1 cursor-pointer font-medium"
              >
                Student
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
                "hover:bg-gray-50",
                selectedRole === "teacher"
                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-200"
              )}
              onClick={() => handleRoleChange("teacher")}
            >
              <RadioGroupItem value="teacher" id="teacher" />
              <Label
                htmlFor="teacher"
                className="flex-1 cursor-pointer font-medium"
              >
                Teacher
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
                "hover:bg-gray-50",
                selectedRole === "admin"
                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-200"
              )}
              onClick={() => handleRoleChange("admin")}
            >
              <RadioGroupItem value="admin" id="admin" />
              <Label
                htmlFor="admin"
                className="flex-1 cursor-pointer font-medium"
              >
                Administrator
              </Label>
            </div>
          </RadioGroup>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!selectedRole}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
