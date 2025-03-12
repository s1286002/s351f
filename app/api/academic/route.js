/**
 * @swagger
 * /academic:
 *   get:
 *     summary: Get all academic records
 *     description: Retrieve a list of all academic records with optional filtering, sorting, pagination, and search capabilities
 *     tags: [Academic Records]
 *     parameters:
 *       - $ref: '#/components/parameters/sortParam'
 *       - $ref: '#/components/parameters/fieldsParam'
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
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
 *         name: grade[gte]
 *         schema:
 *           type: number
 *         description: Filter by grade greater than or equal to value
 *       - in: query
 *         name: grade[lte]
 *         schema:
 *           type: number
 *         description: Filter by grade less than or equal to value
 *     responses:
 *       200:
 *         description: Successful response with list of academic records
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
 *                     $ref: '#/components/schemas/AcademicRecord'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new academic record
 *     description: Create a new academic record with the provided data
 *     tags: [Academic Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicRecordInput'
 *     responses:
 *       201:
 *         description: Academic record created successfully
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
 *                   example: Academic record created successfully
 *                 data:
 *                   $ref: '#/components/schemas/AcademicRecord'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import AcademicRecord from "@/models/academicRecord";
import APIFeatures from "@/utils/apiFeatures";
import factory from "@/utils/handlerFactory";

/**
 * Custom GET handler for academic records with multiple populate fields
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
    const query = AcademicRecord.find()
      .populate("studentId", "username firstName lastName UserId")
      .populate("courseId", "courseCode title credits");

    // Apply all query features
    const features = new APIFeatures(query, queryParams)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query
    const academicRecords = await features.query;

    // Get total count for pagination metadata
    const totalCount = await features.countDocuments();

    // Calculate pagination metadata
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 25;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        count: academicRecords.length,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        data: academicRecords,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching academic records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch academic records" },
      { status: 500 }
    );
  }
}

// Create a new academic record
export const POST = factory.createOne(AcademicRecord);
