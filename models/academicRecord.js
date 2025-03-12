/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       properties:
 *         midterm:
 *           type: number
 *           example: 85
 *           description: Midterm exam grade
 *         final:
 *           type: number
 *           example: 92
 *           description: Final exam grade
 *         assignments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Homework 1"
 *                 description: Name of the assignment
 *               score:
 *                 type: number
 *                 example: 90
 *                 description: Score received for the assignment
 *               weight:
 *                 type: number
 *                 example: 20
 *                 description: Weight of the assignment in percentage
 *         totalScore:
 *           type: number
 *           example: 90
 *           description: Calculated total score
 *         letterGrade:
 *           type: string
 *           enum: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"]
 *           example: "A"
 *           description: Letter grade equivalent
 *
 *     AcademicRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d21b4667d0d8992e610c92
 *         studentId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 60d21b4667d0d8992e610c89
 *             username:
 *               type: string
 *               example: john.doe
 *             firstName:
 *               type: string
 *               example: John
 *             lastName:
 *               type: string
 *               example: Doe
 *             UserId:
 *               type: string
 *               example: JD123
 *           description: Reference to the student
 *         courseId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 60d21b4667d0d8992e610c91
 *             courseCode:
 *               type: string
 *               example: CS101
 *             title:
 *               type: string
 *               example: Introduction to Computer Science
 *           description: Reference to the course
 *         semester:
 *           type: string
 *           example: Fall
 *           description: Academic semester (e.g., Fall, Spring, Summer)
 *         academicYear:
 *           type: string
 *           example: "2024-2025"
 *           description: Academic year (e.g., "2024-2025")
 *         registrationStatus:
 *           type: string
 *           enum: ["registered", "dropped", "completed", "failed", "withdrawn"]
 *           example: registered
 *           description: Current registration status for the course
 *         grade:
 *           type: object
 *           $ref: '#/components/schemas/Grade'
 *           description: Grade information for the course
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - studentId
 *         - courseId
 *         - semester
 *         - academicYear
 *         - registrationStatus
 */

const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    midterm: {
      type: Number,
      min: [0, "Grade cannot be less than 0"],
      max: [100, "Grade cannot exceed 100"],
    },
    final: {
      type: Number,
      min: [0, "Grade cannot be less than 0"],
      max: [100, "Grade cannot exceed 100"],
    },
    assignments: [
      {
        name: {
          type: String,
          required: [true, "Assignment name is required"],
        },
        score: {
          type: Number,
          required: [true, "Assignment score is required"],
          min: [0, "Score cannot be less than 0"],
          max: [100, "Score cannot exceed 100"],
        },
        weight: {
          type: Number,
          required: [true, "Assignment weight is required"],
          min: [0, "Weight cannot be less than 0"],
          max: [100, "Weight cannot exceed 100"],
        },
      },
    ],
    totalScore: {
      type: Number,
      min: [0, "Total score cannot be less than 0"],
      max: [100, "Total score cannot exceed 100"],
    },
    letterGrade: {
      type: String,
      enum: {
        values: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"],
        message: "{VALUE} is not a valid letter grade",
      },
    },
  },
  {
    _id: false, // Prevent Mongoose from creating an _id for this subdocument
  }
);

/**
 * Academic Record Schema
 * @typedef {Object} AcademicRecord
 * @property {ObjectId} id - Unique identifier
 * @property {ObjectId} studentId - Reference to Student
 * @property {ObjectId} courseId - Reference to Course
 * @property {string} semester - Academic semester
 * @property {string} academicYear - Academic year
 * @property {string} registrationStatus - Registration status
 * @property {Object} grade - Grade information
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const academicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
      validate: {
        validator: async function (v) {
          const User = mongoose.model("User");
          const user = await User.findById(v);
          return user && user.role === "student";
        },
        message: "Referenced user must be a student",
      },
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{4}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid academic year format! Use YYYY-YYYY format`,
      },
    },
    registrationStatus: {
      type: String,
      required: [true, "Registration status is required"],
      enum: {
        values: ["registered", "dropped", "completed", "failed", "withdrawn"],
        message: "{VALUE} is not a valid registration status",
      },
      default: "registered",
    },
    grade: {
      type: gradeSchema,
      validate: {
        validator: function (v) {
          if (
            this.registrationStatus === "completed" ||
            this.registrationStatus === "failed"
          ) {
            return v && v.totalScore !== undefined && v.letterGrade;
          }
          return true;
        },
        message:
          "Grade information is required for completed or failed courses",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for academic record's URL
academicRecordSchema.virtual("url").get(function () {
  return `/academic-record/${this._id}`;
});

// Ensure unique student-course-semester-year combination
academicRecordSchema.index(
  { studentId: 1, courseId: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

// Create additional indexes
academicRecordSchema.index({ studentId: 1 });
academicRecordSchema.index({ courseId: 1 });
academicRecordSchema.index({ registrationStatus: 1 });
academicRecordSchema.index({ academicYear: 1 });
academicRecordSchema.index({ semester: 1 });

const AcademicRecord =
  mongoose.models.AcademicRecord ||
  mongoose.model("AcademicRecord", academicRecordSchema);

module.exports = AcademicRecord;
