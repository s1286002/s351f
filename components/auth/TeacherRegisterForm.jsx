import RegisterBaseForm from "./RegisterBaseForm";
import { teacherRegisterSchema } from "./schemas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Teacher registration form component
 * @returns {JSX.Element} Teacher registration form
 */
export default function TeacherRegisterForm() {
  /**
   * Handle form submission
   * @param {Object} data - Form data
   */
  const onSubmit = async (data) => {
    // Add status as active by default
    const submitData = {
      ...data,
      profileData: {
        contactPhone: data.contactPhone,
        bio: data.bio || "",
        status: "active",
      },
    };

    // Simulate a registration delay
    console.log("Teacher registration form submitted:", submitData);

    // In a real application, we would call an API here
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  /**
   * Generate a teacher ID based on a formatted pattern
   * @returns {string} Generated teacher ID in the format T + 8 digits
   */
  const generateTeacherId = () => {
    return `T${Math.floor(10000000 + Math.random() * 90000000)}`;
  };

  return (
    <RegisterBaseForm
      title="Create teacher account"
      description="Enter your information to create a teacher account"
      schema={teacherRegisterSchema()}
      onSubmit={onSubmit}
      defaultValues={{
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "teacher",
        UserId: generateTeacherId(),
        contactPhone: "",
        bio: "",
        termsAccepted: false,
      }}
    >
      {({ register, errors, isLoading }) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value="Teacher" disabled={true} />
            <input type="hidden" {...register("role")} value="teacher" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="UserId">Teacher ID</Label>
            <Input id="UserId" {...register("UserId")} disabled={isLoading} />
            {errors.UserId && (
              <p className="text-sm text-red-500">{errors.UserId.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Must be in the format T + 8 digits (e.g., T12345678)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              {...register("contactPhone")}
              disabled={isLoading}
            />
            {errors.contactPhone && (
              <p className="text-sm text-red-500">
                {errors.contactPhone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself"
              className="resize-none"
              {...register("bio")}
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>
        </>
      )}
    </RegisterBaseForm>
  );
}
