/**
 * @swagger
 * /user/me/password:
 *   put:
 *     summary: Update user password
 *     description: Update the password of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "CurrentPassword123!"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: Password updated successfully
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: New passwords do not match
 *       401:
 *         description: Not authenticated or current password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Current password is incorrect
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import User from "@/models/user";
import { IsAuthenticated } from "@/utils/authUtils";
import { NextResponse } from "next/server";
import connectDB from "@/config/database";

/**
 * Update user password
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} The response object
 */
export async function PUT(request) {
  try {
    // Authenticate the user
    const user = await IsAuthenticated();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not authenticated",
        },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectDB();

    // Get the request body
    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password and new password are required",
        },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Get the user from the database with the password hash
    const userWithPassword = await User.findById(user._id).select(
      "+passwordHash"
    );

    if (!userWithPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Verify the current password using the model's comparePassword method
    const isPasswordCorrect = await userWithPassword.comparePassword(
      currentPassword
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password is incorrect",
        },
        { status: 400 }
      );
    }

    // Update the password - the pre-save middleware will handle hashing
    userWithPassword.passwordHash = newPassword;
    await userWithPassword.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while updating the password",
      },
      { status: 500 }
    );
  }
}

// Alias POST to PUT for flexibility
export const POST = PUT;
