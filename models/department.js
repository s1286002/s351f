/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d21b4667d0d8992e610c85
 *         code:
 *           type: string
 *           example: D12345678
 *           description: Department code (format Dxxxxxxxx where x is a digit)
 *         name:
 *           type: string
 *           example: Computer Science
 *         description:
 *           type: string
 *           example: Department of Computer Science
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - code
 *         - name
 *     DepartmentInput:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: D12345678
 *           pattern: ^D\d{8}$
 *         name:
 *           type: string
 *           example: Computer Science
 *         description:
 *           type: string
 *           example: Department of Computer Science
 *       required:
 *         - code
 *         - name
 */
const mongoose = require("mongoose");

/**
 * Department Schema
 * @typedef {Object} Department
 * @property {ObjectId} id - Unique identifier
 * @property {string} code - Department code (format: Dxxxxxxxx)
 * @property {string} name - Department name
 * @property {string} description - Department description (optional)
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const departmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Department code is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^D\d{8}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid department code! Format should be Dxxxxxxxx where x is a digit`,
      },
    },
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for department's URL
departmentSchema.virtual("url").get(function () {
  return `/department/${this._id}`;
});

// Create indexes (removed duplicate code index)
departmentSchema.index({ name: 1 });

// Add text index for search functionality
departmentSchema.index(
  { name: "text", description: "text", code: "text" },
  {
    weights: {
      name: 10, // Higher weight for name
      code: 5, // Medium weight for code
      description: 1, // Lower weight for description
    },
    name: "department_text_index",
  }
);

const Department =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);

module.exports = Department;
