/**
 * Program API Route Handlers
 * GET: Returns all programs with optional filtering, sorting, pagination, and search
 * POST: Creates a new program
 */

/**
 * @swagger
 * /program:
 *   get:
 *     summary: Get all programs
 *     description: Retrieve a list of all programs with optional filtering, sorting, pagination, and search capabilities
 *     tags: [Programs]
 *     parameters:
 *       - $ref: '#/components/parameters/sortParam'
 *       - $ref: '#/components/parameters/fieldsParam'
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: degreeLevel
 *         schema:
 *           type: string
 *           enum: [associate, bachelor, master, doctoral]
 *         description: Filter by degree level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, deprecated, upcoming]
 *         description: Filter by status
 *       - in: query
 *         name: credits[gte]
 *         schema:
 *           type: number
 *         description: Filter by credits greater than or equal to value
 *       - in: query
 *         name: credits[lte]
 *         schema:
 *           type: number
 *         description: Filter by credits less than or equal to value
 *     responses:
 *       200:
 *         description: Successful response with list of programs
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
 *                     $ref: '#/components/schemas/Program'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new program
 *     description: Create a new program with the provided data
 *     tags: [Programs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgramInput'
 *     responses:
 *       201:
 *         description: Program created successfully
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
 *                   example: Program created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Program'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import Program from "@/models/program";
import factory from "@/utils/handlerFactory";

/**
 * GET handler for retrieving programs with advanced querying
 *
 * @example
 * // Basic filtering
 * GET /api/program?degreeLevel=bachelor&status=active
 *
 * // Advanced filtering
 * GET /api/program?credits[gte]=120&duration[lte]=4
 *
 * // Sorting
 * GET /api/program?sort=name,-credits
 *
 * // Pagination
 * GET /api/program?page=2&limit=10
 *
 * // Field selection
 * GET /api/program?fields=name,programCode,credits
 *
 * // Search
 * GET /api/program?search=computer science
 *
 * // Combining multiple features
 * GET /api/program?degreeLevel=bachelor&sort=-credits&page=1&limit=5&fields=name,credits,duration
 */
export const GET = factory.getAll(Program, {
  populateField: "department",
  populateSelect: "name code",
});

/**
 * POST handler for creating a new program
 */
export const POST = factory.createOne(Program);
