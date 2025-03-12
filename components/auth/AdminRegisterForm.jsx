import RegisterBaseForm from "./RegisterBaseForm";
import { adminRegisterSchema } from "./schemas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Admin registration form component
 * @returns {JSX.Element} Admin registration form
 */
export default function AdminRegisterForm() {
  /**
   * Handle form submission
   * @param {Object} data - Form data
   */
  const onSubmit = async (data) => {
    // Admins don't have profile data
    const submitData = {
      ...data,
      profileData: {}, // Empty for admin
    };

    // Simulate a registration delay
    console.log("Admin registration form submitted:", submitData);

    // In a real application, we would call an API here
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  /**
   * Generate an admin ID based on a formatted pattern
   * @returns {string} Generated admin ID in the format A + 8 digits
   */
  const generateAdminId = () => {
    return `A${Math.floor(10000000 + Math.random() * 90000000)}`;
  };

  return (
    <RegisterBaseForm
      title="Create administrator account"
      description="Enter your information to create an administrator account"
      schema={adminRegisterSchema()}
      onSubmit={onSubmit}
      defaultValues={{
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
        UserId: generateAdminId(),
        termsAccepted: false,
      }}
    >
      {({ register, errors, isLoading }) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value="Administrator" disabled={true} />
            <input type="hidden" {...register("role")} value="admin" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="UserId">Admin ID</Label>
            <Input id="UserId" {...register("UserId")} disabled={isLoading} />
            {errors.UserId && (
              <p className="text-sm text-red-500">{errors.UserId.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Must be in the format A + 8 digits (e.g., A12345678)
            </p>
          </div>
        </>
      )}
    </RegisterBaseForm>
  );
}
