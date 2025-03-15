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

import AcademicRecord from "@/models/academicRecord";
import factory from "@/utils/handlerFactory";

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

/**
 * Custom GET handler for a single academic record with multiple populate fields
 */
export const GET = factory.getOne(AcademicRecord, {
  populate: populateOptions,
});

/**
 * Custom PUT handler for updating academic record with multiple populate fields
 */
export const PUT = factory.updateOne(AcademicRecord);

// Use factory function for delete operation
export const DELETE = factory.deleteOne(AcademicRecord);
