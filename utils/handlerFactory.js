/**
 * Handler Factory - Reusable factory functions for creating standardized API handlers
 * Centralizes common logic for CRUD operations
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/database";
import APIFeatures from "./apiFeatures";

/**
 * Creates a standardized error response
 * @param {Error} error - The error object
 * @param {string} message - Default error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {NextResponse} Formatted error response
 */
const createErrorResponse = (
  error,
  message = "An error occurred",
  statusCode = 500
) => {
  console.error(error);

  // Handle validation errors
  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: validationErrors,
      },
      { status: 400 }
    );
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    return NextResponse.json(
      {
        success: false,
        error: "Duplicate value error",
        details: `${Object.keys(error.keyValue)[0]} already exists`,
      },
      { status: 400 }
    );
  }

  // Handle invalid ID format
  if (error.name === "CastError" && error.path === "_id") {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid ID format",
      },
      { status: 400 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: statusCode }
  );
};

/**
 * Factory for creating a handler to get all documents of a model
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Additional options
 * @param {string|Array|Object} options.populate - Field(s) to populate
 *   Can be a string (simple field name), an array of field names,
 *   an array of populate objects, or a single populate object
 * @returns {Function} Handler for getting all documents
 */
const getAll = (Model, options = {}) => {
  return async (request) => {
    try {
      await connectDB();

      // Get URL for parsing query parameters
      const url = new URL(request.url);
      const queryParams = {};

      // Convert URLSearchParams to plain object
      for (const [key, value] of url.searchParams.entries()) {
        queryParams[key] = value;
      }

      // Create base query
      const query = Model.find();

      // Apply populate if specified
      if (options.populate) {
        // Handle different populate formats
        if (Array.isArray(options.populate)) {
          // Array of fields or populate objects
          options.populate.forEach((popOption) => {
            if (typeof popOption === "string") {
              // Simple field name
              query.populate(popOption);
            } else {
              // Populate object with options
              query.populate(popOption);
            }
          });
        } else if (
          typeof options.populate === "object" &&
          !Array.isArray(options.populate)
        ) {
          // Single populate object with options
          query.populate(options.populate);
        } else {
          // Simple string field name
          query.populate(options.populate);
        }
      }

      // Apply all query features
      const features = new APIFeatures(query, queryParams)
        .filter()
        .search()
        .sort()
        .limitFields()
        .paginate();

      // Execute the query
      const documents = await features.query;

      // Get total count for pagination metadata
      const totalCount = await features.countDocuments();

      // Calculate pagination metadata
      const page = parseInt(queryParams.page, 10) || 1;
      const limit = parseInt(queryParams.limit, 10) || 25;
      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json(
        {
          success: true,
          count: documents.length,
          pagination: {
            total: totalCount,
            page,
            limit,
            pages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          data: documents,
        },
        { status: 200 }
      );
    } catch (error) {
      return createErrorResponse(
        error,
        `Failed to fetch ${Model.modelName.toLowerCase()}s`
      );
    }
  };
};

/**
 * Factory for creating a handler to get a single document by ID
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Additional options
 * @param {string|Array|Object} options.populate - Field(s) to populate
 * @param {string} options.select - Fields to select
 * @returns {Function} Handler for getting a document by ID
 */
const getOne = (Model, options = {}) => {
  return async (request, { params }) => {
    try {
      const { id } = await params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid ${Model.modelName.toLowerCase()} ID format`,
          },
          { status: 400 }
        );
      }

      await connectDB();

      // Create the query
      let query = Model.findById(id);

      // Apply populate if specified
      if (options.populate) {
        // Handle different populate formats
        if (Array.isArray(options.populate)) {
          // Array of fields or populate objects
          options.populate.forEach((popOption) => {
            if (typeof popOption === "string") {
              // Simple field name
              query.populate(popOption);
            } else {
              // Populate object with options
              query.populate(popOption);
            }
          });
        } else if (
          typeof options.populate === "object" &&
          !Array.isArray(options.populate)
        ) {
          // Single populate object with options
          query.populate(options.populate);
        } else {
          // Simple string field name
          query.populate(options.populate);
        }
      }

      // Add field selection if needed
      if (options.select) {
        query = query.select(options.select);
      } else {
        query = query.select("-__v");
      }

      const document = await query;

      if (!document) {
        return NextResponse.json(
          { success: false, error: `${Model.modelName} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: document },
        { status: 200 }
      );
    } catch (error) {
      return createErrorResponse(
        error,
        `Failed to fetch ${Model.modelName.toLowerCase()}`,
        500
      );
    }
  };
};

/**
 * Factory for creating a handler to create a new document
 * @param {Model} Model - Mongoose model
 * @returns {Function} Handler for creating a document
 */
const createOne = (Model) => {
  return async (request) => {
    try {
      await connectDB();

      // Parse the request body
      const body = await request.json();

      // Create the new document
      const document = await Model.create(body);

      return NextResponse.json(
        {
          success: true,
          message: `${Model.modelName} created successfully`,
          data: document,
        },
        { status: 201 }
      );
    } catch (error) {
      return createErrorResponse(
        error,
        `Failed to create ${Model.modelName.toLowerCase()}`,
        400
      );
    }
  };
};

/**
 * Factory for creating a handler to update a document by ID
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Additional options
 * @param {string|Array|Object} options.populate - Field(s) to populate
 * @returns {Function} Handler for updating a document
 */
const updateOne = (Model, options = {}) => {
  return async (request, { params }) => {
    try {
      const { id } = await params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid ${Model.modelName.toLowerCase()} ID format`,
          },
          { status: 400 }
        );
      }

      // Parse the request body
      const updateData = await request.json();

      await connectDB();

      // Find and update the document
      let query = Model.findByIdAndUpdate(id, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Run model validators
      });

      // Apply populate if specified
      if (options.populate) {
        // Handle different populate formats
        if (Array.isArray(options.populate)) {
          // Array of fields or populate objects
          options.populate.forEach((popOption) => {
            if (typeof popOption === "string") {
              // Simple field name
              query.populate(popOption);
            } else {
              // Populate object with options
              query.populate(popOption);
            }
          });
        } else if (
          typeof options.populate === "object" &&
          !Array.isArray(options.populate)
        ) {
          // Single populate object with options
          query.populate(options.populate);
        } else {
          // Simple string field name
          query.populate(options.populate);
        }
      }

      const document = await query;

      if (!document) {
        return NextResponse.json(
          { success: false, error: `${Model.modelName} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `${Model.modelName} updated successfully`,
          data: document,
        },
        { status: 200 }
      );
    } catch (error) {
      return createErrorResponse(
        error,
        `Failed to update ${Model.modelName.toLowerCase()}`,
        400
      );
    }
  };
};

/**
 * Factory for creating a handler to delete a document by ID
 * @param {Model} Model - Mongoose model
 * @returns {Function} Handler for deleting a document
 */
const deleteOne = (Model) => {
  return async (request, { params }) => {
    try {
      const { id } = await params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid ${Model.modelName.toLowerCase()} ID format`,
          },
          { status: 400 }
        );
      }

      await connectDB();

      // Find and delete the document
      const document = await Model.findByIdAndDelete(id);

      if (!document) {
        return NextResponse.json(
          { success: false, error: `${Model.modelName} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `${Model.modelName} deleted successfully`,
        },
        { status: 200 }
      );
    } catch (error) {
      return createErrorResponse(
        error,
        `Failed to delete ${Model.modelName.toLowerCase()}`,
        500
      );
    }
  };
};

// Export all factory functions
const factory = {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
};

export default factory;
