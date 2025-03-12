/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d21b4667d0d8992e610c87
 *         courseCode:
 *           type: string
 *           example: C12345678
 *           description: Course code (format Cxxxxxxxx where x is a digit)
 *         title:
 *           type: string
 *           example: Introduction to Programming
 *         description:
 *           type: string
 *           example: Basic concepts of programming using Python
 *         credits:
 *           type: number
 *           example: 3
 *           minimum: 0
 *           maximum: 12
 *         dayOfWeek:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *           example: [Monday, Wednesday]
 *         startTime:
 *           type: string
 *           example: "09:00"
 *           pattern: ^([01]?[0-9]|2[0-3]):[0-5][0-9]$
 *         endTime:
 *           type: string
 *           example: "10:30"
 *           pattern: ^([01]?[0-9]|2[0-3]):[0-5][0-9]$
 *         location:
 *           type: string
 *           example: "Room 101"
 *         programIds:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               programCode:
 *                 type: string
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Course IDs that are prerequisites
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - courseCode
 *         - title
 *         - description
 *         - credits
 *         - dayOfWeek
 *         - startTime
 *         - endTime
 *         - location
 *         - programIds
 *     CourseInput:
 *       type: object
 *       properties:
 *         courseCode:
 *           type: string
 *           example: C12345678
 *           pattern: ^C\d{8}$
 *         title:
 *           type: string
 *           example: Introduction to Programming
 *         description:
 *           type: string
 *           example: Basic concepts of programming using Python
 *         credits:
 *           type: number
 *           example: 3
 *           minimum: 0
 *           maximum: 12
 *         dayOfWeek:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *           example: [Monday, Wednesday]
 *         startTime:
 *           type: string
 *           example: "09:00"
 *           pattern: ^([01]?[0-9]|2[0-3]):[0-5][0-9]$
 *         endTime:
 *           type: string
 *           example: "10:30"
 *           pattern: ^([01]?[0-9]|2[0-3]):[0-5][0-9]$
 *         location:
 *           type: string
 *           example: "Room 101"
 *         programIds:
 *           type: array
 *           items:
 *             type: string
 *           example: ["60d21b4667d0d8992e610c86"]
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *           example: ["60d21b4667d0d8992e610c88"]
 *       required:
 *         - courseCode
 *         - title
 *         - description
 *         - credits
 *         - dayOfWeek
 *         - startTime
 *         - endTime
 *         - location
 *         - programIds
 */
const mongoose = require("mongoose");

/**
 * Course Schema
 * @typedef {Object} Course
 * @property {ObjectId} id - Unique identifier
 * @property {string} courseCode - Course code (format: Cxxxxxxxx)
 * @property {string} title - Course title
 * @property {string} description - Course description
 * @property {number} credits - Course credits
 * @property {Array<string>} dayOfWeek - Days when course is held
 * @property {string} startTime - Course start time
 * @property {string} endTime - Course end time
 * @property {string} location - Course location
 * @property {Array<ObjectId>} programIds - Associated programs
 * @property {Array<ObjectId>} prerequisites - Prerequisite courses
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^C\d{8}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid course code! Format should be Cxxxxxxxx where x is a digit`,
      },
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [0, "Credits must be greater than 0"],
      max: [12, "Credits cannot exceed 12"],
    },
    dayOfWeek: {
      type: [
        {
          type: String,
          enum: {
            values: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            message: "{VALUE} is not a valid day of week",
          },
        },
      ],
      required: [true, "Day of week is required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one day of week must be specified",
      },
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      validate: {
        validator: function (v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:mm format`,
      },
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      validate: {
        validator: function (v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:mm format`,
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    programIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Program",
        },
      ],
      required: [true, "At least one program must be associated"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one program must be specified",
      },
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for course's URL
courseSchema.virtual("url").get(function () {
  return `/course/${this._id}`;
});

// Validate that endTime is after startTime
courseSchema.pre("validate", function (next) {
  if (this.startTime && this.endTime) {
    const start = this.startTime.split(":").map(Number);
    const end = this.endTime.split(":").map(Number);
    if (start[0] > end[0] || (start[0] === end[0] && start[1] >= end[1])) {
      this.invalidate("endTime", "End time must be after start time");
    }
  }
  next();
});

// Create indexes (removed duplicate courseCode index)
courseSchema.index({ title: 1 });
courseSchema.index({ programIds: 1 });
courseSchema.index({ credits: 1 });

// Add text index for search functionality
courseSchema.index(
  { courseCode: "text", title: "text", description: "text", location: "text" },
  {
    weights: {
      courseCode: 10, // Higher weight
      title: 8, // High weight
      description: 3, // Medium weight
      location: 1, // Lower weight
    },
    name: "course_text_index",
  }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

module.exports = Course;
