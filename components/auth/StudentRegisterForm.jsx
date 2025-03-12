import { useState } from "react";
import RegisterBaseForm from "./RegisterBaseForm";
import { studentRegisterSchema } from "./schemas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Student registration form component
 * @returns {JSX.Element} Student registration form
 */
export default function StudentRegisterForm() {
  // Temporary mock data - would come from API in production
  const departments = [
    { id: "dep1", name: "Computer Science" },
    { id: "dep2", name: "Mathematics" },
    { id: "dep3", name: "Physics" },
  ];

  const programs = [
    { id: "prg1", name: "Bachelor of Computer Science", departmentId: "dep1" },
    { id: "prg2", name: "Master of Computer Science", departmentId: "dep1" },
    { id: "prg3", name: "Bachelor of Mathematics", departmentId: "dep2" },
    { id: "prg4", name: "Master of Mathematics", departmentId: "dep2" },
    { id: "prg5", name: "Bachelor of Physics", departmentId: "dep3" },
    { id: "prg6", name: "Master of Physics", departmentId: "dep3" },
  ];

  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  /**
   * Handle form submission
   * @param {Object} data - Form data
   */
  const onSubmit = async (data) => {
    // Add enrollmentStatus as enrolled by default
    const submitData = {
      ...data,
      profileData: {
        dateOfBirth: null, // Not collected in this form, could be added later
        gender: data.gender,
        address: data.address || "",
        phone: data.phone || "",
        enrollmentStatus: "enrolled",
        departmentId: data.departmentId,
        programId: data.programId,
        year: data.year,
      },
    };

    // Simulate a registration delay
    console.log("Student registration form submitted:", submitData);

    // In a real application, we would call an API here
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  /**
   * Generate a student ID based on a formatted pattern
   * @returns {string} Generated student ID in the format S + 8 digits
   */
  const generateStudentId = () => {
    return `S${Math.floor(10000000 + Math.random() * 90000000)}`;
  };

  return (
    <RegisterBaseForm
      title="Create student account"
      description="Enter your information to create a student account"
      schema={studentRegisterSchema()}
      onSubmit={onSubmit}
      defaultValues={{
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        UserId: generateStudentId(),
        gender: undefined,
        address: "",
        phone: "",
        departmentId: "",
        programId: "",
        year: 1,
        termsAccepted: false,
      }}
    >
      {({ register, errors, setValue, watch, isLoading }) => {
        // Watch departmentId to filter programs
        const watchDepartmentId = watch("departmentId");

        // Update filtered programs when department changes
        if (watchDepartmentId !== selectedDepartmentId) {
          setSelectedDepartmentId(watchDepartmentId);
          setFilteredPrograms(
            programs.filter((p) => p.departmentId === watchDepartmentId)
          );
          // Reset program selection when department changes
          setValue("programId", "");
        }

        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value="Student" disabled={true} />
              <input type="hidden" {...register("role")} value="student" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="UserId">Student ID</Label>
              <Input id="UserId" {...register("UserId")} disabled={isLoading} />
              {errors.UserId && (
                <p className="text-sm text-red-500">{errors.UserId.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Must be in the format S + 8 digits (e.g., S12345678)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                onValueChange={(value) => setValue("gender", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" {...register("phone")} disabled={isLoading} />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                {...register("address")}
                disabled={isLoading}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                onValueChange={(value) => setValue("departmentId", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-sm text-red-500">
                  {errors.departmentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="programId">Program</Label>
              <Select
                onValueChange={(value) => setValue("programId", value)}
                disabled={isLoading || !watchDepartmentId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      watchDepartmentId
                        ? "Select program"
                        : "Select department first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredPrograms.map((prog) => (
                    <SelectItem key={prog.id} value={prog.id}>
                      {prog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.programId && (
                <p className="text-sm text-red-500">
                  {errors.programId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1"
                {...register("year")}
                disabled={isLoading}
              />
              {errors.year && (
                <p className="text-sm text-red-500">{errors.year.message}</p>
              )}
            </div>
          </>
        );
      }}
    </RegisterBaseForm>
  );
}
