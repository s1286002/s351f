/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d21b4667d0d8992e610c89
 *         studentId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             UserId:
 *               type: string
 *         courseId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             courseCode:
 *               type: string
 *             title:
 *               type: string
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-04-15"
 *         status:
 *           type: string
 *           enum: [present, absent, late, excused]
 *           example: present
 *         notes:
 *           type: string
 *           example: "Student arrived 5 minutes late"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - studentId
 *         - courseId
 *         - date
 *         - status
 *     AttendanceInput:
 *       type: object
 *       properties:
 *         studentId:
 *           type: string
 *           example: 60d21b4667d0d8992e610c90
 *         courseId:
 *           type: string
 *           example: 60d21b4667d0d8992e610c91
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-04-15"
 *         status:
 *           type: string
 *           enum: [present, absent, late, excused]
 *           example: present
 *         notes:
 *           type: string
 *           example: "Student arrived 5 minutes late"
 *       required:
 *         - studentId
 *         - courseId
 *         - date
 *         - status
 */

const mongoose = require("mongoose");

/**
 * Attendance Schema
 * @typedef {Object} Attendance
 * @property {ObjectId} id - Unique identifier
 * @property {ObjectId} studentId - Reference to User (student)
 * @property {ObjectId} courseId - Reference to Course
 * @property {Date} date - Attendance date
 * @property {string} status - Attendance status
 * @property {string} notes - Optional notes
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["present", "absent", "late", "excused"],
        message: "{VALUE} is not a valid attendance status",
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for attendance's URL
attendanceSchema.virtual("url").get(function () {
  return `/attendance/${this._id}`;
});

// Create compound index for unique attendance records
attendanceSchema.index(
  { studentId: 1, courseId: 1, date: 1 },
  { unique: true }
);

// Create indexes for common queries
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ courseId: 1, date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ date: 1 });

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
