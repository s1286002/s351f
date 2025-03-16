"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDepartments from "@/hooks/api/useDepartments";
import usePrograms from "@/hooks/api/usePrograms";
import useMongoError from "@/hooks/useMongoError";

/**
 * Base validation schema for all users
 */
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.enum(["admin", "teacher", "student"], {
      required_error: "Please select a role",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    // Profile data validation based on role
    profileData: z
      .object({
        // Teacher profile
        contactPhone: z.string().optional(),
        bio: z.string().optional(),
        status: z
          .enum(["active", "sabbatical", "retired", "suspended"])
          .optional(),
        // Student profile
        dateOfBirth: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        enrollmentStatus: z
          .enum(["enrolled", "on_leave", "graduated", "withdrawn"])
          .optional(),
        departmentId: z.string().optional(),
        programId: z.string().optional(),
        year: z.number().min(1).optional(),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "teacher") {
        return data.profileData?.contactPhone && data.profileData?.status;
      }
      if (data.role === "student") {
        return (
          data.profileData?.enrollmentStatus &&
          data.profileData?.departmentId &&
          data.profileData?.programId &&
          data.profileData?.year
        );
      }
      return true; // For admin role
    },
    {
      message: "Profile data is required for this role",
      path: ["profileData"],
    }
  );

/**
 * Simple Registration Form Component
 * Demonstrates form handling with validation and API submission
 *
 * @returns {JSX.Element} Registration form component
 */
export default function SimpleRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userId, setUserId] = useState("");

  // Get departments data
  const {
    data: departments = [],
    isLoading: isDepartmentsLoading,
    fetchData: fetchDepartments,
  } = useDepartments();

  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  // Get programs data
  const {
    data: programs = [],
    isLoading: isProgramsLoading,
    fetchData: fetchPrograms,
  } = usePrograms();

  // Initialize form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "student", // Default role
      password: "",
      confirmPassword: "",
      profileData: {
        // Student defaults
        enrollmentStatus: "enrolled",
        year: 1,
      },
    },
  });

  // Use our custom hook for MongoDB error handling
  const { apiError, processApiResponse, clearErrors } = useMongoError(form);

  const currentRole = form.watch("role");

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments({
      limit: 100, // Fetch reasonable number of departments for dropdown
      sort: "name", // Sort by name for easier selection
    });
  }, [fetchDepartments]);

  // Fetch programs filtered by department when department changes
  useEffect(() => {
    if (selectedDepartmentId) {
      console.log("Fetching programs for department:", selectedDepartmentId);
      fetchPrograms({
        limit: 100,
        sort: "name",
        department: selectedDepartmentId, // Filter programs by department
      });
    }
  }, [selectedDepartmentId, fetchPrograms]);

  // Handle role change to reset profile data
  useEffect(() => {
    const defaultProfileData = {
      student: {
        enrollmentStatus: "enrolled",
        year: 1,
        departmentId: "",
        programId: "",
      },
      teacher: {
        status: "active",
      },
      admin: {},
    };

    // Reset profile data based on role
    form.setValue("profileData", defaultProfileData[currentRole] || {});
  }, [currentRole, form]);

  // Handle department change
  const handleDepartmentChange = (departmentId) => {
    setSelectedDepartmentId(departmentId);
    form.setValue("profileData.departmentId", departmentId);
    // Reset program when department changes
    form.setValue("profileData.programId", "");
  };

  /**
   * Handle form submission
   * @param {Object} values - Form values
   */
  async function onSubmit(values) {
    setIsLoading(true);
    clearErrors(); // Clear any previous errors

    try {
      // Remove confirm password before sending to API
      const { confirmPassword, ...dataToSubmit } = values;

      // API call to register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      // Process the response and handle errors
      const data = await processApiResponse(response);

      // Show success message and store user ID
      if (data.user && data.user.UserId) {
        setUserId(data.user.UserId);
        setRegistrationSuccess(true);
        toast.success("Registration successful!");
      } else {
        // If no user ID is returned, just show a success message and redirect
        toast.success("Registration successful!");
        router.push("/auth/login?registered=true");
      }
    } catch (error) {
      // Error is already handled by processApiResponse
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // If registration was successful, show success message with User ID
  if (registrationSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Registration Successful!</h2>
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            <p>Your account has been created successfully.</p>
            <p className="font-bold mt-2">Your User ID: {userId}</p>
            <p className="text-sm mt-1">
              Please save this ID as you will need it to log in.
            </p>
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href="/auth/login">Proceed to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">
            Fill in your details to register
          </p>
        </div>

        {/* Display API errors */}
        {apiError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{apiError.message}</AlertDescription>
          </Alert>
        )}

        {/* Role Selection Tabs */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="mb-6">
              <Tabs
                value={field.value}
                onValueChange={field.onChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Common Fields */}
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Role-specific Fields */}
          {currentRole === "teacher" && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="profileData.contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your contact phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profileData.bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your teaching experience and expertise..."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profileData.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sabbatical">Sabbatical</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentRole === "student" && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="profileData.dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileData.gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="profileData.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileData.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="profileData.enrollmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your enrollment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="enrolled">Enrolled</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="graduated">Graduated</SelectItem>
                          <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileData.year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter your year"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="profileData.departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={(value) => handleDepartmentChange(value)}
                        value={field.value}
                        disabled={isDepartmentsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept._id} value={dept._id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileData.programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isProgramsLoading || !selectedDepartmentId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your program" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs.map((prog) => (
                            <SelectItem key={prog._id} value={prog._id}>
                              {prog.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
