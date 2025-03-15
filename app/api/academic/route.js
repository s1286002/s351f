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

import factory from "@/utils/handlerFactory";
import AcademicRecord from "@/models/academicRecord";
import User from "@/models/user";
import Course from "@/models/course";

/**
 * Custom GET handler for academic records with multiple populate fields
 */

const populateOptions = [
  {
    path: "studentId",
    select:
      "username UserId profileData.departmentId profileData.programId profileData.year",
  },
  {
    path: "courseId",
    select: "courseCode title credits",
  },
];

export const GET = factory.getAll(AcademicRecord, {
  populate: populateOptions,
});

// Create a new academic record
export const POST = factory.createOne(AcademicRecord);
