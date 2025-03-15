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

import Attendance from "@/models/attendance";
import factory from "@/utils/handlerFactory";

/**
 * Custom GET handler for attendance records with multiple populate fields
 */

const populateOptions = [
  {
    path: "studentId",
    select: "username firstName lastName UserId",
  },
  {
    path: "courseId",
    select: "courseCode title",
  },
];

// Get all attendance records
export const GET = factory.getAll(Attendance, {
  populate: populateOptions,
});

// Create a new attendance record
export const POST = factory.createOne(Attendance);
