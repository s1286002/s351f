/**
 * @file route.js
 * @description API endpoint for user registration
 *
 * User ID Format:
 * - Format: [Role Prefix][6-digit Sequential Number][Checksum Digit]
 * - Role Prefix: 'A' for Admin, 'T' for Teacher, 'S' for Student
 * - Sequential Number: 6-digit number that increments for each new user of the same role
 * - Checksum Digit: Single digit calculated using Luhn algorithm to validate ID integrity
 * - Example: S0001234 (Student #000123 with checksum 4)
 */

import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import User from "@/models/user";
import { generateUserId } from "@/utils/userIdUtils";
import { formatApiError } from "@/utils/errorUtils";
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with role-specific profile data
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - firstName
 *               - lastName
 *               - role
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Unique username
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: "Doe"
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student]
 *                 description: User's role in the system
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Password with at least 8 characters, one letter and one number
 *               profileData:
 *                 type: object
 *                 description: Role-specific profile information
 *                 properties:
 *                   # Teacher profile
 *                   contactPhone:
 *                     type: string
 *                     description: Teacher's contact phone number
 *                   bio:
 *                     type: string
 *                     description: Teacher's biography
 *                   status:
 *                     type: string
 *                     enum: [active, sabbatical, retired, suspended]
 *                     description: Teacher's current status
 *                   # Student profile
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                     description: Student's date of birth
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other]
 *                     description: Student's gender
 *                   address:
 *                     type: string
 *                     description: Student's address
 *                   phone:
 *                     type: string
 *                     description: Student's phone number
 *                   enrollmentStatus:
 *                     type: string
 *                     enum: [enrolled, on_leave, graduated, withdrawn]
 *                     description: Student's enrollment status
 *                   departmentId:
 *                     type: string
 *                     description: ID of student's department
 *                   programId:
 *                     type: string
 *                     description: ID of student's program
 *                   year:
 *                     type: integer
 *                     minimum: 1
 *                     description: Student's current year
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *                     UserId:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Invalid request parameters
 *       409:
 *         description: Username or email already exists
 *       500:
 *         description: Server error
 */

/**
 * POST handler for user registration
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      username,
      email,
      firstName,
      lastName,
      role,
      password,
      profileData,
    } = body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      // Determine which field caused the conflict
      const field = existingUser.username === username ? "username" : "email";
      const message =
        field === "username"
          ? "This username is already taken. Please choose another one."
          : "This email is already registered. Please use another email or try logging in.";

      return NextResponse.json(
        { success: false, message, field },
        { status: 409 }
      );
    }

    // Generate User ID
    const userId = await generateUserId(role, User);

    const NewUser = await User.create({
      UserId: userId,
      username,
      email,
      firstName,
      lastName,
      role,
      passwordHash: password,
      profileData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: NewUser,
      },
      { status: 201 }
    );
  } catch (error) {
    // Format the error response using our utility
    const errorResponse = formatApiError(error);

    return NextResponse.json(errorResponse, { status: errorResponse.code });
  }
}
