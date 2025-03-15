/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     summary: Get an attendance record by ID
 *     description: Retrieve a single attendance record by its ID
 *     tags: [Attendance]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response with attendance record details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an attendance record
 *     description: Update an attendance record's information by its ID
 *     tags: [Attendance]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceInput'
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
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
 *                   example: Attendance record updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete an attendance record
 *     description: Delete an attendance record by its ID
 *     tags: [Attendance]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
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
 *                   example: Attendance record deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import Attendance from "@/models/attendance";
import mongoose from "mongoose";
import factory from "@/utils/handlerFactory";

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
/**
 * Custom GET handler for a single attendance record with multiple populate fields
 */
export const GET = factory.getOne(Attendance, {
  populate: populateOptions,
});

/**
 * Custom PUT handler for updating attendance with multiple populate fields
 */
export const PUT = factory.updateOne(Attendance);

// Use factory function for delete operation
export const DELETE = factory.deleteOne(Attendance);
