/**
 * @swagger
 * /program/{id}:
 *   get:
 *     summary: Get a program by ID
 *     description: Retrieve a single program by its ID
 *     tags: [Programs]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response with program details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Program'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a program
 *     description: Update a program's information by its ID
 *     tags: [Programs]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgramInput'
 *     responses:
 *       200:
 *         description: Program updated successfully
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
 *                   example: Program updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Program'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a program
 *     description: Delete a program by its ID
 *     tags: [Programs]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Program deleted successfully
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
 *                   example: Program deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import Program from "@/models/program";
import factory from "@/utils/handlerFactory";

// Get a program by ID
export const GET = factory.getOne(Program, {
  populateField: "department",
  populateSelect: "name code",
});

// Update a program by ID
export const PUT = factory.updateOne(Program, {
  populateField: "department",
  populateSelect: "name code",
});

// Delete a program by ID
export const DELETE = factory.deleteOne(Program);
