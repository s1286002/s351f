import * as z from "zod";

/**
 * Creates base validation fields used in multiple schemas
 * @returns {Object} Object containing common validation fields
 */
const createBaseValidationFields = () => ({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    invalid_type_error: "You must accept the terms and conditions",
  }),
});

/**
 * Creates the password match refinement
 * @param {z.ZodObject} schema - The schema to add refinement to
 * @returns {z.ZodObject} Schema with password match refinement
 */
const addPasswordMatchRefinement = (schema) =>
  schema.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Validates UserId format based on role
 * @param {z.ZodObject} schema - The schema to add refinement to
 * @returns {z.ZodObject} Schema with UserId format validation
 */
const addUserIdValidation = (schema) =>
  schema.refine(
    (data) => {
      const prefixMap = {
        admin: "A",
        teacher: "T",
        student: "S",
      };
      const prefix = prefixMap[data.role];
      return new RegExp(`^${prefix}\\d{8}$`).test(data.UserId);
    },
    {
      message:
        "User ID must be in the format of [A/T/S] + 8 digits based on your role",
      path: ["UserId"],
    }
  );

/**
 * Creates base registration fields with name fields
 * @returns {Object} Object containing base registration fields
 */
const createBaseRegFields = () => ({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  ...createBaseValidationFields(),
});

/**
 * Base registration form schema
 */
export const baseRegisterSchema = () =>
  addPasswordMatchRefinement(z.object(createBaseRegFields()));

/**
 * Student registration form schema
 */
export const studentRegisterSchema = () =>
  addUserIdValidation(
    addPasswordMatchRefinement(
      z.object({
        ...createBaseRegFields(),
        role: z.literal("student"),
        UserId: z.string({
          required_error: "User ID is required",
        }),
        phone: z.string().optional(),
        gender: z.enum(["male", "female", "other"], {
          required_error: "Please select a gender",
        }),
        address: z.string().optional(),
        departmentId: z.string({
          required_error: "Please select a department",
        }),
        programId: z.string({
          required_error: "Please select a program",
        }),
        year: z.coerce.number().int().min(1, {
          message: "Year must be at least 1",
        }),
      })
    )
  );

/**
 * Teacher registration form schema
 */
export const teacherRegisterSchema = () =>
  addUserIdValidation(
    addPasswordMatchRefinement(
      z.object({
        ...createBaseRegFields(),
        role: z.literal("teacher"),
        UserId: z.string({
          required_error: "User ID is required",
        }),
        contactPhone: z.string().min(10, {
          message: "Phone number must be at least 10 characters",
        }),
        bio: z.string().optional(),
      })
    )
  );

/**
 * Admin registration form schema
 */
export const adminRegisterSchema = () =>
  addUserIdValidation(
    addPasswordMatchRefinement(
      z.object({
        ...createBaseValidationFields(),
        role: z.literal("admin"),
        UserId: z.string({
          required_error: "User ID is required",
        }),
      })
    )
  );

/**
 * Login form validation schema
 */
export const loginSchema = () =>
  z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    rememberMe: z.boolean().optional(),
  });
