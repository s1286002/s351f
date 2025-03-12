/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get all attendance records
 *     description: Retrieve a list of all attendance records with optional filtering, sorting, pagination, and search capabilities
 *     tags: [Attendance]
 *     parameters:
 *       - $ref: '#/components/parameters/sortParam'
 *       - $ref: '#/components/parameters/fieldsParam'
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, late, excused]
 *         description: Filter by attendance status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD)
 *       - in: query
 *         name: date[gte]
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date greater than or equal to (YYYY-MM-DD)
 *       - in: query
 *         name: date[lte]
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date less than or equal to (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful response with list of attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new attendance record
 *     description: Create a new attendance record with the provided data
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceInput'
 *     responses:
 *       201:
 *         description: Attendance record created successfully
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
 *                   example: Attendance record created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import Attendance from "@/models/attendance";
import APIFeatures from "@/utils/apiFeatures";
import factory from "@/utils/handlerFactory";

/**
 * Custom GET handler for attendance records with multiple populate fields
 */
export async function GET(request) {
  try {
    await connectDB();

    // Get URL for parsing query parameters
    const url = new URL(request.url);
    const queryParams = {};

    // Convert URLSearchParams to plain object
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value;
    }

    // Create base query with multiple populate fields
    const query = Attendance.find()
      .populate("studentId", "username firstName lastName UserId")
      .populate("courseId", "courseCode title");

    // Apply all query features
    const features = new APIFeatures(query, queryParams)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query
    const attendances = await features.query;

    // Get total count for pagination metadata
    const totalCount = await features.countDocuments();

    // Calculate pagination metadata
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 25;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        count: attendances.length,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        data: attendances,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

// Create a new attendance record
export const POST = factory.createOne(Attendance);
