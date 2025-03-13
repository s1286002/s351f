/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d21b4667d0d8992e610c92
 *         username:
 *           type: string
 *           example: johndoe
 *           minLength: 3
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         role:
 *           type: string
 *           enum: [admin, teacher, student]
 *           example: student
 *         status:
 *           type: string
 *           enum: [active, disabled]
 *           example: active
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         UserId:
 *           type: string
 *           example: S0001234
 *           description: User ID (format (A/T/S)+6digits+checksum)
 *         profileData:
 *           oneOf:
 *             - $ref: '#/components/schemas/TeacherProfile'
 *             - $ref: '#/components/schemas/StudentProfile'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - username
 *         - email
 *         - role
 *         - status
 *         - UserId
 *
 *     TeacherProfile:
 *       type: object
 *       properties:
 *         contactPhone:
 *           type: string
 *           example: "+1234567890"
 *         bio:
 *           type: string
 *           example: "Experienced professor in Computer Science"
 *         status:
 *           type: string
 *           enum: [active, sabbatical, retired, suspended]
 *           example: active
 *       required:
 *         - contactPhone
 *         - status
 *
 *     StudentProfile:
 *       type: object
 *       properties:
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "2000-01-01"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           example: male
 *         address:
 *           type: string
 *           example: "123 Student Street"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         enrollmentStatus:
 *           type: string
 *           enum: [enrolled, on_leave, graduated, withdrawn]
 *           example: enrolled
 *         departmentId:
 *           type: string
 *           example: 60d21b4667d0d8992e610c85
 *         programId:
 *           type: string
 *           example: 60d21b4667d0d8992e610c86
 *         year:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *       required:
 *         - enrollmentStatus
 *         - departmentId
 *         - programId
 *         - year
 *
 *     UserInput:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: johndoe
 *           minLength: 3
 *         password:
 *           type: string
 *           format: password
 *           example: "StrongPassword123!"
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         role:
 *           type: string
 *           enum: [admin, teacher, student]
 *           example: student
 *         status:
 *           type: string
 *           enum: [active, disabled]
 *           example: active
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         UserId:
 *           type: string
 *           example: S0001234
 *           description: User ID (format (A/T/S)+6digits+checksum)
 *         profileData:
 *           oneOf:
 *             - $ref: '#/components/schemas/TeacherProfile'
 *             - $ref: '#/components/schemas/StudentProfile'
 *       required:
 *         - username
 *         - password
 *         - email
 *         - role
 *         - UserId
 *         - firstName
 *         - lastName
 *         - profileData
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Teacher Profile Schema
 */
const teacherProfileSchema = new mongoose.Schema({
  contactPhone: {
    type: String,
    required: [true, "Contact phone is required for teachers"],
  },
  bio: String,
  status: {
    type: String,
    required: [true, "Status is required for teachers"],
    enum: {
      values: ["active", "sabbatical", "retired", "suspended"],
      message: "{VALUE} is not a valid teacher status",
    },
    default: "active",
  },
});

/**
 * Student Profile Schema
 */
const studentProfileSchema = new mongoose.Schema({
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: {
      values: ["male", "female", "other"],
      message: "{VALUE} is not a valid gender",
    },
  },
  address: String,
  phone: String,
  enrollmentStatus: {
    type: String,
    required: [true, "Enrollment status is required"],
    enum: {
      values: ["enrolled", "on_leave", "graduated", "withdrawn"],
      message: "{VALUE} is not a valid enrollment status",
    },
    default: "enrolled",
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: [true, "Department is required for students"],
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    required: [true, "Program is required for students"],
  },
  year: {
    type: Number,
    required: [true, "Year is required"],
    min: [1, "Year must be at least 1"],
  },
});

// Helper for manual validation
const validateTeacherProfile = (profile) => {
  // Check required fields
  if (!profile.contactPhone) {
    return false;
  }

  // Check status enum
  if (
    profile.status &&
    !["active", "sabbatical", "retired", "suspended"].includes(profile.status)
  ) {
    return false;
  }

  return true;
};

// Helper for manual validation
const validateStudentProfile = (profile) => {
  // Check required fields
  if (
    !profile.enrollmentStatus ||
    !profile.departmentId ||
    !profile.programId ||
    !profile.year
  ) {
    return false;
  }

  // Check enrollment status enum
  if (
    !["enrolled", "on_leave", "graduated", "withdrawn"].includes(
      profile.enrollmentStatus
    )
  ) {
    return false;
  }

  // Check gender enum if provided
  if (profile.gender && !["male", "female", "other"].includes(profile.gender)) {
    return false;
  }

  // Check year min value
  if (profile.year < 1) {
    return false;
  }

  return true;
};

/**
 * User Schema
 * @typedef {Object} User
 * @property {ObjectId} id - Unique identifier
 * @property {string} username - Username
 * @property {string} passwordHash - Hashed password
 * @property {string} email - Email address
 * @property {string} role - User role
 * @property {string} status - Account status
 * @property {Date} lastLogin - Last login timestamp
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} UserId - User ID (format: (A/T/S)+6digits+checksum)
 * @property {Object} profileData - Role-specific profile data
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "teacher", "student"],
        message: "{VALUE} is not a valid role",
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["active", "disabled"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
    lastLogin: {
      type: Date,
    },
    firstName: {
      type: String,
      required: [
        function () {
          return this.role !== "admin";
        },
        "First name is required for students and teachers",
      ],
      trim: true,
    },
    lastName: {
      type: String,
      required: [
        function () {
          return this.role !== "admin";
        },
        "Last name is required for students and teachers",
      ],
      trim: true,
    },
    UserId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      validate: {
        validator: function (v) {
          const prefixMap = {
            admin: "A",
            teacher: "T",
            student: "S",
          };
          const prefix = prefixMap[this.role];
          return new RegExp(`^${prefix}\\d{7}$`).test(v);
        },
        message: (props) =>
          `${props.value} is not a valid User ID format! Should be (A/T/S)+7digits based on role (6 sequential digits + 1 checksum digit)`,
      },
    },
    profileData: {
      type: mongoose.Schema.Types.Mixed,
      required: [
        function () {
          return this.role !== "admin";
        },
        "Profile data is required for students and teachers",
      ],
      validate: {
        validator: function (v) {
          if (this.role === "admin") return true;
          if (this.role === "teacher") {
            return validateTeacherProfile(v);
          }
          if (this.role === "student") {
            return validateStudentProfile(v);
          }
          return false;
        },
        message: "Invalid profile data for the specified role",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for user's full name
userSchema.virtual("fullName").get(function () {
  return this.firstName && this.lastName
    ? `${this.firstName} ${this.lastName}`
    : this.username;
});

// Virtual for user's URL
userSchema.virtual("url").get(function () {
  return `/user/${this._id}`;
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Add text index for search functionality
userSchema.index(
  {
    username: "text",
    firstName: "text",
    lastName: "text",
    email: "text",
    UserId: "text",
  },
  {
    weights: {
      username: 10, // Higher weight
      UserId: 8, // High weight
      firstName: 5, // Medium weight
      lastName: 5, // Medium weight
      email: 3, // Lower weight
    },
    name: "user_text_index",
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
