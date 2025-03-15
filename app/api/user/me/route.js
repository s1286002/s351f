import User from "@/models/user";
import factory from "@/utils/handlerFactory";
import {
  IsAuthenticated,
  createRequestWithContext,
  filterObj,
} from "@/utils/authUtils";
import { NextResponse } from "next/server";
import connectDB from "@/config/database";

// Common options for user data retrieval and population
const userOptions = {
  select: "-passwordHash",
  populateField: ["profileData.departmentId", "profileData.programId"],
  populateSelect: {
    "profileData.departmentId": "name code",
    "profileData.programId": "name programCode",
  },
};

/**
 * Get current user profile
 * Uses the user ID from the JWT token to retrieve the user's profile
 */
export async function GET(request) {
  try {
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

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Update current user profile
 * Uses the user ID from the JWT token to update the user's profile
 * Includes role-based validation to prevent unauthorized field updates
 */
export async function PUT(request) {
  try {
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

    await connectDB();
    const req = await request.json();

    // Define allowed fields based on user role
    let allowedFields = ["email", "username", "firstName", "lastName"];

    // Add role-specific allowed fields
    if (user.role === "student") {
      allowedFields = [
        ...allowedFields,
        "profileData.phone",
        "profileData.address",
        "profileData.dateOfBirth",
        "profileData.gender",
      ];
    } else if (user.role === "teacher") {
      allowedFields = [
        ...allowedFields,
        "profileData.contactPhone",
        "profileData.bio",
      ];
    }

    // Filter the request body to only include allowed fields
    const filteredBody = filterObj(req, ...allowedFields);

    // Instead of using findByIdAndUpdate which triggers validation on partial data,
    // we'll first fetch the user, update the fields, and then save
    // This ensures validation runs on the complete document
    const userToUpdate = await User.findById(user._id);

    if (!userToUpdate) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Update top-level fields
    Object.keys(filteredBody).forEach((key) => {
      if (key !== "profileData") {
        userToUpdate[key] = filteredBody[key];
      }
    });

    // Update profileData fields if they exist
    if (filteredBody.profileData) {
      // Ensure profileData exists
      userToUpdate.profileData = userToUpdate.profileData || {};

      // Update each field in profileData
      Object.keys(filteredBody.profileData).forEach((key) => {
        userToUpdate.profileData[key] = filteredBody.profileData[key];
      });

      // Critical fix: Mark the profileData field as modified
      // This tells Mongoose that this mixed type field has been changed
      userToUpdate.markModified("profileData");
    }

    // Save the updated user (this will run validation on the complete document)
    await userToUpdate.save({ validateModifiedOnly: true });

    // Fetch the updated user with populated fields
    const updatedUser = await User.findById(user._id)
      .select("-passwordHash")
      .populate({
        path: "profileData.departmentId",
        select: "name code",
        model: "Department",
      })
      .populate({
        path: "profileData.programId",
        select: "name programCode",
        model: "Program",
      });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Alias POST to PUT for flexibility
export const POST = PUT;
