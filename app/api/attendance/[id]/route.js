/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     summary: Get an attendance record by ID
 *     description: Retrieve a single attendance record by its ID
 *     tags: [Attendance]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response with attendance record details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an attendance record
 *     description: Update an attendance record's information by its ID
 *     tags: [Attendance]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceInput'
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
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
 *                   example: Attendance record updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete an attendance record
 *     description: Delete an attendance record by its ID
 *     tags: [Attendance]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
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
 *                   example: Attendance record deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import Attendance from "@/models/attendance";
import mongoose from "mongoose";
import factory from "@/utils/handlerFactory";

/**
 * Custom GET handler for a single attendance record with multiple populate fields
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid attendance ID format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Query with multiple populate fields
    const attendance = await Attendance.findById(id)
      .populate("studentId", "username firstName lastName UserId")
      .populate("courseId", "courseCode title")
      .select("-__v");

    if (!attendance) {
      return NextResponse.json(
        { success: false, error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: attendance },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error fetching attendance record with ID ${params.id}:`,
      error
    );
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance record" },
      { status: 500 }
    );
  }
}

/**
 * Custom PUT handler for updating attendance with multiple populate fields
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid attendance ID format" },
        { status: 400 }
      );
    }

    // Parse the request body
    const updateData = await request.json();

    await connectDB();

    // Find and update with multiple populate fields
    const attendance = await Attendance.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("studentId", "username firstName lastName UserId")
      .populate("courseId", "courseCode title");

    if (!attendance) {
      return NextResponse.json(
        { success: false, error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Attendance record updated successfully",
        data: attendance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error updating attendance record with ID ${params.id}:`,
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
      { success: false, error: "Failed to update attendance record" },
      { status: 500 }
    );
  }
}

// Use factory function for delete operation
export const DELETE = factory.deleteOne(Attendance);
