/**
 * @swagger
 * /course/{id}:
 *   get:
 *     summary: Get a course by ID
 *     description: Retrieve a single course by its ID
 *     tags: [Courses]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response with course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a course
 *     description: Update a course's information by its ID
 *     tags: [Courses]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *     responses:
 *       200:
 *         description: Course updated successfully
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
 *                   example: Course updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a course
 *     description: Delete a course by its ID
 *     tags: [Courses]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Course deleted successfully
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
 *                   example: Course deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import Course from "@/models/course";
import factory from "@/utils/handlerFactory";

const populateOptions = [
  {
    path: "programIds",
    select: "name programCode",
  },
];
// Get a course by ID
export const GET = factory.getOne(Course, {
  populate: populateOptions,
});

// Update a course by ID
export const PUT = factory.updateOne(Course);

// Delete a course by ID
export const DELETE = factory.deleteOne(Course);
