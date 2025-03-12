/**
 * @swagger
 * components:
 *   schemas:
 *     Program:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d21b4667d0d8992e610c86
 *         programCode:
 *           type: string
 *           example: P12345678
 *           description: Program code (format Pxxxxxxxx where x is a digit)
 *         name:
 *           type: string
 *           example: Computer Science
 *         description:
 *           type: string
 *           example: Bachelor of Computer Science
 *         department:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             code:
 *               type: string
 *         degreeLevel:
 *           type: string
 *           enum: [associate, bachelor, master, doctoral]
 *           example: bachelor
 *         credits:
 *           type: number
 *           example: 120
 *         duration:
 *           type: number
 *           example: 4
 *         status:
 *           type: string
 *           enum: [active, deprecated, upcoming]
 *           example: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - programCode
 *         - name
 *         - description
 *         - department
 *         - degreeLevel
 *         - credits
 *         - duration
 *     ProgramInput:
 *       type: object
 *       properties:
 *         programCode:
 *           type: string
 *           example: P12345678
 *           pattern: ^P\d{8}$
 *         name:
 *           type: string
 *           example: Computer Science
 *         description:
 *           type: string
 *           example: Bachelor of Computer Science
 *         department:
 *           type: string
 *           example: 60d21b4667d0d8992e610c85
 *         degreeLevel:
 *           type: string
 *           enum: [associate, bachelor, master, doctoral]
 *           example: bachelor
 *         credits:
 *           type: number
 *           example: 120
 *           minimum: 1
 *         duration:
 *           type: number
 *           example: 4
 *           minimum: 1
 *         status:
 *           type: string
 *           enum: [active, deprecated, upcoming]
 *           example: active
 *       required:
 *         - programCode
 *         - name
 *         - description
 *         - department
 *         - degreeLevel
 *         - credits
 *         - duration
 */
const mongoose = require("mongoose");

/**
 * Program Schema
 * @typedef {Object} Program
 * @property {ObjectId} id - Unique identifier
 * @property {string} programCode - Program code (format: Pxxxxxxxx)
 * @property {string} name - Program name
 * @property {string} description - Program description
 * @property {ObjectId} department - Reference to Department
 * @property {string} degreeLevel - Level of degree
 * @property {number} credits - Required credits
 * @property {number} duration - Program duration in years
 * @property {string} status - Program status
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const programSchema = new mongoose.Schema(
  {
    programCode: {
      type: String,
      required: [true, "Program code is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^P\d{8}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid program code! Format should be Pxxxxxxxx where x is a digit`,
      },
    },
    name: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Program description is required"],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    degreeLevel: {
      type: String,
      required: [true, "Degree level is required"],
      enum: {
        values: ["associate", "bachelor", "master", "doctoral"],
        message: "{VALUE} is not a valid degree level",
      },
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [1, "Credits must be greater than 0"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 year"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["active", "deprecated", "upcoming"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for program's URL
programSchema.virtual("url").get(function () {
  return `/program/${this._id}`;
});

// Create indexes (removed duplicate programCode index)
programSchema.index({ name: 1 });
programSchema.index({ department: 1 });
programSchema.index({ status: 1 });

// Add text index for search functionality
programSchema.index(
  { name: "text", description: "text", programCode: "text" },
  {
    weights: {
      name: 10, // Higher weight - more important in search
      programCode: 5, // Medium weight
      description: 1, // Lower weight
    },
    name: "program_text_index",
  }
);

const Program =
  mongoose.models.Program || mongoose.model("Program", programSchema);

module.exports = Program;
