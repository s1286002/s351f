/**
 * Authentication Utilities
 * Common functions for handling authentication and request modification
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUpdatableFields, hasResourcePermission } from "./rbacUtils";
import User from "@/models/user";
import connectDB from "@/config/database";

/**
 * Filter an object to only include specified fields
 * @param {Object} obj - The object to filter
 * @param {...string} allowedFields - The fields to include in the filtered object
 * @returns {Object} A new object with only the allowed fields
 */
export const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  allowedFields.forEach((field) => {
    // Handle nested fields (e.g., profileData.contactPhone)
    if (field.includes(".")) {
      const [parent, child] = field.split(".");

      // If the parent object exists in the source object
      if (obj[parent] && typeof obj[parent] === "object") {
        // Initialize the parent object in the new object if it doesn't exist
        if (!newObj[parent]) {
          newObj[parent] = {};
        }

        // Copy the child field if it exists
        if (obj[parent][child] !== undefined) {
          newObj[parent][child] = obj[parent][child];
        }
      }
    }
    // Handle top-level fields
    else if (obj[field] !== undefined) {
      newObj[field] = obj[field];
    }
  });

  return newObj;
};

/**
 * Gets the authenticated user ID from the request
 * @returns {Object} Object containing userId if successful, or error response if not
 */
export const IsAuthenticated = async () => {
  // verify the token
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  if (!token) {
    return false;
  }

  const secret = process.env.JWT_SECRET || "your-secret-key";

  try {
    // Verify and decode the token
    const payload = jwt.verify(token.value, secret);

    // Connect to the database before querying
    await connectDB();

    // check if the user is in the database with populated department and program data
    let user;

    // First, get the user without population to check their role
    const baseUser = await User.findById(payload.id).select("-passwordHash");

    if (!baseUser) {
      return false;
    }

    // If the user is a student, populate the department and program data
    if (baseUser.role === "student") {
      user = await User.findById(payload.id)
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

      // Add departmentName and programName to profileData for easier access in frontend
      if (user && user.profileData) {
        if (user.profileData.departmentId) {
          user.profileData.departmentName = user.profileData.departmentId.name;
          user.profileData.departmentCode = user.profileData.departmentId.code;
        }

        if (user.profileData.programId) {
          user.profileData.programName = user.profileData.programId.name;
          user.profileData.programCode = user.profileData.programId.programCode;
        }
      }
    } else {
      // For non-student users, just return the base user
      user = baseUser;
    }

    return user;
  } catch (error) {
    console.error("JWT verification error:", error);
    return false;
  }
};

/**
 * Sign a JWT token for a user
 * @param {Object} userData - User data to include in the token
 * @param {string} userData.id - User ObjectId
 * @param {string} userData.role - User role
 * @param {string} userData.UserId - User's unique identifier
 * @returns {Promise<string>} JWT token
 */
export const signToken = async (id) => {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  return jwt.sign({ id }, secret, { expiresIn });
};

/**
 * Create and send a JWT token as a cookie
 * @param {Object} userData - User data to include in the token
 * @param {string} userData.id - User ObjectId
 * @param {string} userData.role - User role
 * @param {string} userData.UserId - User's unique identifier
 * @returns {Promise<string>} JWT token
 */
export const createSendToken = async (user) => {
  const token = await signToken(user._id);

  // Set token as cookie
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400, // 1 day in seconds
    path: "/",
  });

  return user;
};

/**
 * Clear authentication token cookie
 */
export const clearAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
};

/**
 * Filter request data based on user role permissions
 * @param {Object} data - Request data to filter
 * @param {string} role - User role (admin, teacher, student)
 * @param {string} resource - Resource type (user, program, department, etc.)
 * @param {boolean} isOwnResource - Whether the user is updating their own resource
 * @returns {Object} Filtered data containing only allowed fields
 */
export const filterRequestDataByRole = (
  data,
  role,
  resource,
  isOwnResource = false
) => {
  // If not updating own resource and not admin, return empty object
  if (!isOwnResource && role !== "admin" && resource === "user") {
    return {};
  }

  // Get allowed fields for this role and resource
  const allowedFields = getUpdatableFields(role, resource);

  // Filter the data to include only allowed fields
  const filteredData = {};

  for (const field of allowedFields) {
    // Handle nested fields (e.g., profileData.address)
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (data[parent] && data[parent][child] !== undefined) {
        filteredData[parent] = filteredData[parent] || {};
        filteredData[parent][child] = data[parent][child];
      }
    }
    // Handle regular fields
    else if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  }

  return filteredData;
};

/**
 * Check if a user has permission to access a resource and create appropriate error response if not
 * @param {string} role - User role (admin, teacher, student)
 * @param {string} resource - Resource type (user, program, department, etc.)
 * @param {string} action - Action to perform (create, read, update, delete)
 * @param {Object} context - Additional context (e.g., resource owner ID)
 * @returns {Object|null} Error response if permission denied, null if permission granted
 */
export const checkResourcePermission = (
  role,
  resource,
  action,
  context = {}
) => {
  const hasPermission = hasResourcePermission(role, resource, action, context);

  if (!hasPermission) {
    const messages = {
      create: `You don't have permission to create ${resource}s`,
      read: `You don't have permission to view this ${resource}`,
      update: `You don't have permission to update this ${resource}`,
      delete: `You don't have permission to delete this ${resource}`,
    };

    return NextResponse.json(
      {
        success: false,
        message: messages[action] || "Permission denied",
      },
      { status: 403 }
    );
  }

  return null;
};

/**
 * Creates a modified request with context for factory handlers
 * @param {Request} request - The original request
 * @param {string} userId - The user ID to add to params
 * @param {Object} options - Additional options for request modification
 * @param {string} [options.method] - HTTP method (default: same as original request)
 * @param {boolean} [options.includeBody=false] - Whether to include request body
 * @returns {Object} Object containing modified request and context
 */
export const createRequestWithContext = (request, userId, options = {}) => {
  const { method, includeBody = false } = options;

  // Create a new request object
  const modifiedRequest = new Request(request.url, {
    method: method || request.method,
    headers: request.headers,
    ...(includeBody && { body: request.body }),
  });

  // Create context with params
  const context = { params: { id: userId } };

  return { modifiedRequest, context };
};
