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

/**
 * Calculate a checksum digit using a modified Luhn algorithm
 * This version properly handles the alphabetic prefix
 *
 * @param {string} idWithoutChecksum - ID string without checksum (e.g., "A000001")
 * @returns {string} Single checksum digit
 */
function calculateChecksum(idWithoutChecksum) {
  // Extract the prefix and numeric part
  const prefix = idWithoutChecksum.charAt(0);
  const numericPart = idWithoutChecksum.substring(1);

  // Convert prefix to a number value (A=1, T=20, S=19)
  let prefixValue = 0;
  if (prefix === "A") prefixValue = 1;
  else if (prefix === "T") prefixValue = 20;
  else if (prefix === "S") prefixValue = 19;

  // Start sum with the prefix value
  let sum = prefixValue;

  // Process the numeric part using Luhn algorithm
  const digits = numericPart.split("").map(Number);

  for (let i = 0; i < digits.length; i++) {
    let digit = digits[i];
    // Double every second digit (from right to left)
    if ((digits.length - i) % 2 === 1) {
      digit *= 2;
      // If doubling results in a two-digit number, add those digits together
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  // Calculate the check digit that would make the sum divisible by 10
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

/**
 * Validate a user ID by checking its checksum
 *
 * @param {string} userId - Complete user ID with checksum
 * @returns {boolean} True if the ID is valid, false otherwise
 */
export function validateUserId(userId) {
  if (!userId || userId.length < 2) {
    return false;
  }

  // Extract parts
  const prefix = userId.charAt(0);
  const idWithoutChecksum = userId.substring(0, userId.length - 1);
  const providedChecksum = userId.charAt(userId.length - 1);

  // Verify prefix is valid
  if (!["A", "T", "S"].includes(prefix)) {
    return false;
  }

  // Calculate expected checksum
  const expectedChecksum = calculateChecksum(idWithoutChecksum);

  // Compare checksums
  return providedChecksum === expectedChecksum;
}

/**
 * Generate a sequential user ID based on role with checksum
 *
 * @param {string} role - User role (admin, teacher, student)
 * @returns {string} Generated userId in the format (A/T/S) + 6-digit sequential number + checksum
 */
async function generateUserId(role) {
  // Role prefix
  const prefix = role === "admin" ? "A" : role === "teacher" ? "T" : "S";

  // Find the highest existing ID for this role to determine the next sequential number
  const highestUser = await User.findOne({
    UserId: new RegExp(`^${prefix}\\d{7}$`),
  }).sort({ UserId: -1 });

  let nextSequentialNumber;

  if (highestUser) {
    // Extract the 6-digit number from the existing highest ID
    const currentNumber = parseInt(highestUser.UserId.substring(1, 7));
    nextSequentialNumber = (currentNumber + 1).toString().padStart(6, "0");
  } else {
    // If no existing users with this role, start from 000001
    nextSequentialNumber = "000001";
  }

  // Create ID without checksum
  const idWithoutChecksum = `${prefix}${nextSequentialNumber}`;

  // Calculate checksum
  const checksum = calculateChecksum(idWithoutChecksum);

  // Final ID with checksum
  const userId = `${idWithoutChecksum}${checksum}`;

  return userId;
}

/**
 * Validate role-specific data
 *
 * @param {string} role - User role
 * @param {Object} profileData - Role-specific profile data
 * @returns {Object} Validation result with isValid and errors
 */
function validateRoleData(role, profileData) {
  if (!profileData) {
    return { isValid: false, errors: ["Profile data is required"] };
  }

  const errors = [];

  if (role === "student") {
    if (!profileData.dateOfBirth) errors.push("Date of birth is required");
    if (!profileData.gender) errors.push("Gender is required");
    if (!profileData.enrollmentStatus)
      errors.push("Enrollment status is required");
    if (!profileData.departmentId) errors.push("Department is required");
    if (!profileData.programId) errors.push("Program is required");
    if (!profileData.year) errors.push("Year is required");
  } else if (role === "teacher") {
    if (!profileData.contactPhone) errors.push("Contact phone is required");
    if (!profileData.status) errors.push("Teacher status is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * POST handler for user registration
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    console.log("Registration request body:", JSON.stringify(body, null, 2));

    // Check if the request body is empty or missing required fields
    if (!body || Object.keys(body).length === 0) {
      console.error("Empty request body received");
      return NextResponse.json(
        { success: false, message: "Empty request body" },
        { status: 400 }
      );
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      profileData,
    } = body;

    const missingFields = [];
    if (!username) missingFields.push("username");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!role) missingFields.push("role");
    if (!profileData) missingFields.push("profileData");

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          missingFields,
        },
        { status: 400 }
      );
    }

    // Check if user with this username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Validate role-specific data
    const { isValid, errors } = validateRoleData(role, profileData);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid profile data", errors },
        { status: 400 }
      );
    }

    // Generate a userId based on role
    const UserId = await generateUserId(role);

    // Create the new user
    const newUser = new User({
      username,
      email,
      passwordHash: password, // hash by the pre-save middleware
      firstName,
      lastName,
      role,
      status: body.status || "active",
      UserId,
      profileData,
    });

    await newUser.save();

    // Don't return the password in the response
    const userResponse = { ...newUser.toObject() };
    delete userResponse.passwordHash;

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
