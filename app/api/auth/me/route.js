import { NextResponse } from "next/server";
import { IsAuthenticated } from "@/utils/authUtils";

/**
 * GET handler for /api/auth/me
 * Returns the current authenticated user's information
 */
export async function GET() {
  try {
    // Check if user is authenticated
    const user = await IsAuthenticated();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
