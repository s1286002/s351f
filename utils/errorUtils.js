/**
 * @file errorUtils.js
 * @description Utility functions for handling errors in the application
 */

/**
 * Handles MongoDB errors and returns user-friendly error messages
 *
 * @param {Error} error - The error object from MongoDB
 * @returns {Object} Object containing error code, message, and field information
 */
export function handleMongoError(error) {
  // Default error response
  const errorResponse = {
    code: 500,
    message: "An unexpected error occurred. Please try again.",
    field: null,
  };

  // Check if it's a MongoDB duplicate key error
  if (
    error.code === 11000 ||
    (error.name === "MongoServerError" && error.code === 11000)
  ) {
    errorResponse.code = 409;

    // Get the duplicate key field name
    const keyPattern = error.keyPattern || {};
    const field = Object.keys(keyPattern)[0];

    errorResponse.field = field;

    // Customize message based on the duplicate field
    if (field === "username") {
      errorResponse.message =
        "This username is already taken. Please choose another one.";
    } else if (field === "email") {
      errorResponse.message =
        "This email is already registered. Please use another email or try logging in.";
    } else {
      errorResponse.message = `Duplicate value for ${field}. Please use a different value.`;
    }
  }
  // Validation errors
  else if (error.name === "ValidationError") {
    errorResponse.code = 400;

    // Get the first validation error
    const fields = Object.keys(error.errors || {});
    if (fields.length > 0) {
      const firstField = fields[0];
      errorResponse.field = firstField;
      errorResponse.message = error.errors[firstField].message;
    } else {
      errorResponse.message = "Validation failed. Please check your input.";
    }
  }
  // Connection errors
  else if (error.name === "MongoNetworkError") {
    errorResponse.code = 503;
    errorResponse.message =
      "Database connection error. Please try again later.";
  }

  return errorResponse;
}

/**
 * Formats error response for API endpoints
 *
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response for API
 */
export function formatApiError(error) {
  const errorDetails = handleMongoError(error);

  return {
    success: false,
    message: errorDetails.message,
    field: errorDetails.field,
    code: errorDetails.code,
  };
}
