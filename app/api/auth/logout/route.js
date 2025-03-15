/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clear authentication token and end user session
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully logged out
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
 *                   example: "Logged out successfully"
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/utils/authUtils";

/**
 * POST handler for user logout
 */
export async function POST() {
  try {
    // Clear the auth token cookie
    clearAuthCookie();

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 }
    );
  }
}
