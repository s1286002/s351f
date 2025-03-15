/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users with optional filtering, sorting, pagination, and search capabilities
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/sortParam'
 *       - $ref: '#/components/parameters/fieldsParam'
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, teacher, student]
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, disabled]
 *         description: Filter by account status
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter students by department ID
 *       - in: query
 *         name: programId
 *         schema:
 *           type: string
 *         description: Filter students by program ID
 *     responses:
 *       200:
 *         description: Successful response with list of users
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
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided data
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: User created successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import User from "@/models/user";
import factory from "@/utils/handlerFactory";

// Define populate options for user routes
const populateOptions = [
  {
    path: "profileData.departmentId",
    select: "name code",
    model: "Department",
  },
  {
    path: "profileData.programId",
    select: "name programCode",
    model: "Program",
  },
];

// Get all users using the enhanced factory method
export const GET = factory.getAll(User, {
  populate: populateOptions,
  select: "-passwordHash",
});

// Create a new user
export const POST = factory.createOne(User);
