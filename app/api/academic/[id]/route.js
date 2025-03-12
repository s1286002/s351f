/**
 * @swagger
 * /academic/{id}:
 *   get:
 *     summary: Get an academic record by ID
 *     description: Retrieve a single academic record by its ID
 *     tags: [Academic Records]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response with academic record details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AcademicRecord'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an academic record
 *     description: Update an academic record's information by its ID
 *     tags: [Academic Records]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicRecordInput'
 *     responses:
 *       200:
 *         description: Academic record updated successfully
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
 *                   example: Academic record updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/AcademicRecord'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete an academic record
 *     description: Delete an academic record by its ID
 *     tags: [Academic Records]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Academic record deleted successfully
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
 *                   example: Academic record deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import AcademicRecord from "@/models/academicRecord";
import mongoose from "mongoose";
import factory from "@/utils/handlerFactory";

/**
 * Custom GET handler for a single academic record with multiple populate fields
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid academic record ID format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Query with multiple populate fields
    const academicRecord = await AcademicRecord.findById(id)
      .populate("studentId", "username firstName lastName UserId")
      .populate("courseId", "courseCode title credits")
      .select("-__v");

    if (!academicRecord) {
      return NextResponse.json(
        { success: false, error: "Academic record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: academicRecord },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error fetching academic record with ID ${params.id}:`,
      error
    );
    return NextResponse.json(
      { success: false, error: "Failed to fetch academic record" },
      { status: 500 }
    );
  }
}

/**
 * Custom PUT handler for updating academic record with multiple populate fields
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid academic record ID format" },
        { status: 400 }
      );
    }

    // Parse the request body
    const updateData = await request.json();

    await connectDB();

    // Find and update with multiple populate fields
    const academicRecord = await AcademicRecord.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run model validators
      }
    )
      .populate("studentId", "username firstName lastName UserId")
      .populate("courseId", "courseCode title credits");

    if (!academicRecord) {
      return NextResponse.json(
        { success: false, error: "Academic record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Academic record updated successfully",
        data: academicRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error updating academic record with ID ${params.id}:`,
      error
    );

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

    return NextResponse.json(
      { success: false, error: "Failed to update academic record" },
      { status: 500 }
    );
  }
}

// Use factory function for delete operation
export const DELETE = factory.deleteOne(AcademicRecord);
