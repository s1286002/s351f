const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  Department,
  Program,
  User,
  Course,
  AcademicRecord,
  Attendance,
} = require("../models");

const MONGODB_URI =
  "mongodb+srv://s1286002:TmtUhhJk6i0Rtuvt@cluster0.wnnmo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

/**
 * Utility function to generate sequential IDs with prefix
 * @param {string} prefix - Prefix for the ID (D/P/C/A/T/S)
 * @param {number} start - Starting number
 * @param {number} count - How many IDs to generate
 * @returns {Array<string>} Array of generated IDs
 */
const generateIds = (prefix, start, count) => {
  return Array.from(
    { length: count },
    (_, i) => `${prefix}${(start + i).toString().padStart(8, "0")}`
  );
};

/**
 * Cleans up the database by dropping collections
 */
const cleanupDatabase = async () => {
  console.log("Cleaning up database...");

  // Order matters because of references
  const collectionsToClean = [
    "attendances",
    "academicrecords",
    "courses",
    "users",
    "programs",
    "departments",
  ];

  for (const collectionName of collectionsToClean) {
    if (mongoose.connection.collections[collectionName]) {
      try {
        await mongoose.connection.collections[collectionName].drop();
        console.log(`Dropped collection: ${collectionName}`);
      } catch (error) {
        // Ignore collection doesn't exist error
        if (error.code !== 26) {
          console.error(`Error dropping ${collectionName}:`, error.message);
        }
      }
    }
  }
};

// Generate departments
const generateDepartments = (count = 5) => {
  const departmentNames = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
    "Business",
    "Economics",
    "Psychology",
  ];

  const deptIds = generateIds("D", 1, count);

  return deptIds.map((code, index) => ({
    code,
    name: departmentNames[index % departmentNames.length],
    description: `Department of ${
      departmentNames[index % departmentNames.length]
    }`,
  }));
};

// Generate programs
const generatePrograms = (count = 8, departmentIds = []) => {
  const degreeLevels = ["associate", "bachelor", "master", "doctoral"];
  const programTypes = ["Science", "Arts", "Engineering", "Technology"];
  const subjects = [
    "Computer Science",
    "Data Science",
    "Mathematics",
    "Physics",
  ];

  const programIds = generateIds("P", 1, count);

  return programIds.map((programCode, index) => {
    const degreeLevel = degreeLevels[index % degreeLevels.length];
    const programType =
      programTypes[Math.floor(index / 2) % programTypes.length];
    const subject = subjects[Math.floor(index / 4) % subjects.length];

    const degreeCreditMap = {
      associate: 60,
      bachelor: 120,
      master: 60,
      doctoral: 90,
    };

    const degreeDurationMap = {
      associate: 2,
      bachelor: 4,
      master: 2,
      doctoral: 4,
    };

    return {
      programCode,
      name: `${subject} ${
        degreeLevel === "bachelor"
          ? "BSc"
          : degreeLevel === "master"
          ? "MSc"
          : "Degree"
      }`,
      description: `${
        degreeLevel.charAt(0).toUpperCase() + degreeLevel.slice(1)
      } of ${programType} in ${subject}`,
      department: departmentIds[index % departmentIds.length],
      degreeLevel,
      credits: degreeCreditMap[degreeLevel],
      duration: degreeDurationMap[degreeLevel],
      status: "active",
    };
  });
};

// Generate users
const generateUsers = (deptIds = [], programIds = []) => {
  // Admin users
  const adminCount = 2;
  const adminIds = generateIds("A", 1, adminCount);
  const admins = adminIds.map((UserId, index) => ({
    username: `admin${index + 1}`,
    password: `admin${index + 1}123`,
    email: `admin${index + 1}@school.edu`,
    role: "admin",
    UserId,
  }));

  // Teacher users
  const teacherCount = 5;
  const teacherIds = generateIds("T", 1, teacherCount);
  const teachers = teacherIds.map((UserId, index) => ({
    username: `teacher${index + 1}`,
    password: `teacher${index + 1}123`,
    email: `teacher${index + 1}@school.edu`,
    role: "teacher",
    firstName: `Teacher${index + 1}`,
    lastName: `LastName${index + 1}`,
    UserId,
    profileData: {
      contactPhone: `${10000000 + index}`,
      bio: `Experienced professor in ${
        index % 2 === 0 ? "Computer Science" : "Mathematics"
      }`,
      status: "active",
      departmentId: deptIds[index % deptIds.length],
    },
  }));

  // Student users
  const studentCount = 10;
  const studentIds = generateIds("S", 1, studentCount);
  const students = studentIds.map((UserId, index) => ({
    username: `student${index + 1}`,
    password: `student${index + 1}123`,
    email: `student${index + 1}@school.edu`,
    role: "student",
    firstName: `Student${index + 1}`,
    lastName: `LastName${index + 1}`,
    UserId,
    profileData: {
      dateOfBirth: new Date(2000, index % 12, (index % 28) + 1),
      gender: index % 3 === 0 ? "male" : index % 3 === 1 ? "female" : "other",
      address: `${index + 100} Student St`,
      phone: `${20000000 + index}`,
      enrollmentStatus: "enrolled",
      departmentId: deptIds[index % deptIds.length],
      programId: programIds[index % programIds.length],
      year: (index % 4) + 1,
    },
  }));

  return [...admins, ...teachers, ...students];
};

// Generate courses
const generateCourses = (count = 10, programIds = []) => {
  const subjects = [
    "Introduction to Programming",
    "Data Structures",
    "Database Systems",
    "Algorithms",
    "Web Development",
    "Operating Systems",
    "Computer Networks",
    "Artificial Intelligence",
    "Machine Learning",
    "Software Engineering",
    "Computer Graphics",
    "Mobile Development",
    "Cybersecurity",
  ];

  const descriptions = [
    "Basic concepts and principles",
    "Advanced techniques and applications",
    "Fundamental theory and practice",
    "Comprehensive overview",
    "Practical implementation and design",
  ];

  const locations = [
    "Room 101",
    "Room 102",
    "Room 103",
    "Lab 1",
    "Lab 2",
    "Lecture Hall A",
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const courseIds = generateIds("C", 1, count);

  return courseIds.map((courseCode, index) => {
    const subject = subjects[index % subjects.length];
    const description = `${subject}: ${
      descriptions[index % descriptions.length]
    }`;

    // Generate reasonable course schedule
    const dayIndex1 = index % 5;
    let dayIndex2 = (dayIndex1 + 2) % 5; // Classes typically separated by a day
    const dayOfWeek = [days[dayIndex1], days[dayIndex2]];

    // Generate class times
    const startHour = 8 + (Math.floor(index / 2) % 8); // Classes between 8 AM and 4 PM
    const startTime = `${startHour.toString().padStart(2, "0")}:00`;
    const endTime = `${(startHour + 1).toString().padStart(2, "0")}:30`;

    return {
      courseCode,
      title: subject,
      description,
      credits: (index % 4) + 2, // Credits between 2-5
      dayOfWeek,
      startTime,
      endTime,
      location: locations[index % locations.length],
      programIds: [
        programIds[index % programIds.length],
        // For some courses, add an additional program
        ...(index % 3 === 0
          ? [programIds[(index + 1) % programIds.length]]
          : []),
      ],
    };
  });
};

// Generate academic records
const generateAcademicRecords = (students, courses) => {
  const semesters = ["Fall", "Spring", "Summer"];
  const years = ["2022-2023", "2023-2024"];
  const statuses = ["registered", "completed", "failed"];
  const grades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];

  const records = [];

  // Generate a reasonable number of records
  students.forEach((student, sIndex) => {
    const studentCourseCount = 2 + (sIndex % 3); // 2-4 courses per student

    for (let i = 0; i < studentCourseCount; i++) {
      // Pick a course for this student
      const courseIndex = (sIndex + i) % courses.length;
      const semester = semesters[(sIndex + i) % semesters.length];
      const year = years[i % years.length];
      const status = statuses[i % statuses.length];

      const record = {
        studentId: student._id,
        courseId: courses[courseIndex]._id,
        semester,
        academicYear: year,
        registrationStatus: status,
      };

      // Add grade data for completed or failed courses
      if (status === "completed" || status === "failed") {
        const midterm = 50 + Math.floor(Math.random() * 50); // 50-99
        const final = 50 + Math.floor(Math.random() * 50); // 50-99
        const totalScore = Math.floor((midterm + final) / 2);

        const letterGradeIndex =
          status === "failed"
            ? grades.length - 1 // F for failed
            : Math.floor((100 - totalScore) / 5); // Map score to letter grade

        record.grade = {
          midterm,
          final,
          assignments: [
            {
              name: "Assignment 1",
              score: 50 + Math.floor(Math.random() * 50),
              weight: 20,
            },
            {
              name: "Assignment 2",
              score: 50 + Math.floor(Math.random() * 50),
              weight: 20,
            },
          ],
          totalScore,
          letterGrade: grades[Math.min(letterGradeIndex, grades.length - 1)],
        };
      }

      records.push(record);
    }
  });

  return records;
};

// Generate attendance records
const generateAttendance = (students, courses) => {
  const statuses = ["present", "absent", "late", "early_leave"];
  const remarks = [
    "Participated actively in class",
    "Quiet but attentive",
    "Asked good questions",
    "Worked well in group activities",
    "Seemed distracted",
    "Notified in advance",
    "Medical excuse provided",
    "No notification given",
  ];

  const records = [];

  // Generate a reasonable number of attendance records
  students.forEach((student, sIndex) => {
    // Pick 1-2 courses for attendance tracking
    const courseCount = 1 + (sIndex % 2);

    for (let c = 0; c < courseCount; c++) {
      const courseIndex = (sIndex + c) % courses.length;

      // Generate 3-5 attendance records per course
      const attendanceCount = 3 + (sIndex % 3);

      for (let i = 0; i < attendanceCount; i++) {
        // Create dates going back from today, one week apart
        const date = new Date();
        date.setDate(date.getDate() - i * 7);

        // Determine status - mostly present, sometimes other statuses
        const statusIndex = i === 0 ? 0 : i % statuses.length;
        const status = statuses[statusIndex];

        records.push({
          studentId: student._id,
          courseId: courses[courseIndex]._id,
          date,
          status,
          remarks:
            status === "present"
              ? remarks[sIndex % 4]
              : remarks[4 + (sIndex % 4)],
        });
      }
    }
  });

  return records;
};

// Main function to add sample data
const addSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clean up existing data
    await cleanupDatabase();

    // Generate and add departments
    const departmentData = generateDepartments(5);
    const savedDepartments = await Promise.all(
      departmentData.map(async (dept) => {
        const department = new Department(dept);
        return await department.save();
      })
    );
    console.log(`${savedDepartments.length} Departments added`);

    // Get department IDs
    const departmentIds = savedDepartments.map((dept) => dept._id);

    // Generate and add programs
    const programData = generatePrograms(8, departmentIds);
    const savedPrograms = await Promise.all(
      programData.map(async (prog) => {
        const program = new Program(prog);
        return await program.save();
      })
    );
    console.log(`${savedPrograms.length} Programs added`);

    // Get program IDs
    const programIds = savedPrograms.map((prog) => prog._id);

    // Generate and add users
    const userData = generateUsers(departmentIds, programIds);
    const savedUsers = await Promise.all(
      userData.map(async (user) => {
        // Hash the password
        user.passwordHash = await hashPassword(user.password);
        delete user.password;

        const userDoc = new User(user);
        return await userDoc.save();
      })
    );
    console.log(`${savedUsers.length} Users added`);

    // Filter students from the saved users
    const savedStudents = savedUsers.filter((user) => user.role === "student");
    console.log(`Found ${savedStudents.length} students`);

    // Generate and add courses
    const courseData = generateCourses(10, programIds);
    const savedCourses = await Promise.all(
      courseData.map(async (course) => {
        const courseDoc = new Course(course);
        return await courseDoc.save();
      })
    );
    console.log(`${savedCourses.length} Courses added`);

    // Generate and add academic records
    const academicRecordData = generateAcademicRecords(
      savedStudents,
      savedCourses
    );
    await Promise.all(
      academicRecordData.map(async (record) => {
        const academicRecord = new AcademicRecord(record);
        return await academicRecord.save();
      })
    );
    console.log(`${academicRecordData.length} Academic records added`);

    // Generate and add attendance records
    const attendanceData = generateAttendance(savedStudents, savedCourses);
    await Promise.all(
      attendanceData.map(async (record) => {
        const attendance = new Attendance(record);
        return await attendance.save();
      })
    );
    console.log(`${attendanceData.length} Attendance records added`);

    console.log("All sample data added successfully");
  } catch (error) {
    console.error("Error adding sample data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Function to hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Run the script
addSampleData();
