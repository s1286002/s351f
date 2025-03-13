/**
 * @file route.js
 * @description API endpoint for user authentication
 */

import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { validateUserId } from "../register/route";

/**
 * POST handler for user login
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, password } = body;

    // Validate input
    if (!userId || !password) {
      return NextResponse.json(
        { success: false, message: "User ID and password are required" },
        { status: 400 }
      );
    }

    // Validate User ID format and checksum
    if (!validateUserId(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid User ID format" },
        { status: 400 }
      );
    }

    // Find user by User ID
    const user = await User.findOne({ UserId: userId });

    // If user doesn't exist
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // If user is disabled
    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Account is disabled" },
        { status: 403 }
      );
    }

    // Verify password using the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        UserId: user.UserId,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    // Set the token as an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day in seconds
      path: "/",
    });

    // Don't include password in response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      UserId: user.UserId,
      lastLogin: user.lastLogin,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: userResponse,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Error during login", error: error.message },
      { status: 500 }
    );
  }
}
