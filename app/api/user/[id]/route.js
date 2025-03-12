/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a single user by their ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response with user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a user
 *     description: Update a user's information by their ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user by their ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import User from "@/models/user";
import factory from "@/utils/handlerFactory";

// Get a user by ID
export const GET = factory.getOne(User, {
  select: "-passwordHash",
  populateField: ["profileData.departmentId", "profileData.programId"],
  populateSelect: {
    "profileData.departmentId": "name code",
    "profileData.programId": "name programCode",
  },
});

// Update a user by ID
export const PUT = factory.updateOne(User, {
  select: "-passwordHash",
  populateField: ["profileData.departmentId", "profileData.programId"],
  populateSelect: {
    "profileData.departmentId": "name code",
    "profileData.programId": "name programCode",
  },
});

// Delete a user by ID
export const DELETE = factory.deleteOne(User);
