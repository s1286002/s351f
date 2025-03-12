/**
 * @swagger
 * /course:
 *   get:
 *     summary: Get all courses
 *     description: Retrieve a list of all courses with optional filtering, sorting, pagination, and search capabilities
 *     tags: [Courses]
 *     parameters:
 *       - $ref: '#/components/parameters/sortParam'
 *       - $ref: '#/components/parameters/fieldsParam'
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - in: query
 *         name: credits
 *         schema:
 *           type: number
 *         description: Filter by credits
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *         description: Filter by day of week
 *       - in: query
 *         name: programIds
 *         schema:
 *           type: string
 *         description: Filter by program ID
 *     responses:
 *       200:
 *         description: Successful response with list of courses
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
 *                     $ref: '#/components/schemas/Course'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new course
 *     description: Create a new course with the provided data
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                   example: Course created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import Course from "@/models/course";
import factory from "@/utils/handlerFactory";

// Get all courses
export const GET = factory.getAll(Course, {
  populateField: "programIds",
  populateSelect: "name programCode",
});

// Create a new course
export const POST = factory.createOne(Course);
