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
 * Calculate a checksum digit using a modified Luhn algorithm
 * This version properly handles the alphabetic prefix
 *
 * @param {string} idWithoutChecksum - ID string without checksum (e.g., "A0000001")
 * @returns {string} Single checksum digit
 */
function calculateChecksum(idWithoutChecksum) {
  // Extract the prefix and numeric part
  const prefix = idWithoutChecksum.charAt(0);
  const numericPart = idWithoutChecksum.substring(1);

  // Convert prefix to a number value (A=1, T=20, S=19)
  let prefixValue = 0;
  if (prefix === "A") prefixValue = 1;
  else if (prefix === "T") prefixValue = 20;
  else if (prefix === "S") prefixValue = 19;

  // Start sum with the prefix value
  let sum = prefixValue;

  // Process the numeric part using Luhn algorithm
  const digits = numericPart.split("").map(Number);

  for (let i = 0; i < digits.length; i++) {
    let digit = digits[i];
    // Double every second digit (from right to left)
    if ((digits.length - i) % 2 === 1) {
      digit *= 2;
      // If doubling results in a two-digit number, add those digits together
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  // Calculate the check digit that would make the sum divisible by 10
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

/**
 * Utility function to generate sequential IDs with prefix and checksum
 * @param {string} prefix - Prefix for the ID (A/T/S)
 * @param {number} start - Starting number
 * @param {number} count - How many IDs to generate
 * @returns {Array<string>} Array of generated IDs
 */
const generateUserIds = (prefix, start, count) => {
  return Array.from({ length: count }, (_, i) => {
    // Generate 7-digit sequential number
    const sequentialNumber = (start + i).toString().padStart(6, "0");

    // Create ID without checksum
    const idWithoutChecksum = `${prefix}${sequentialNumber}`;

    // Calculate checksum
    const checksum = calculateChecksum(idWithoutChecksum);

    // Final ID with checksum
    return `${idWithoutChecksum}${checksum}`;
  });
};

/**
 * Utility function to generate sequential IDs with prefix (for non-user entities)
 * @param {string} prefix - Prefix for the ID (D/P/C)
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

  // Define department-specific programs
  const departmentPrograms = {
    "Computer Science": {
      associate: ["Software Development", "Web Development", "IT Support"],
      bachelor: [
        "Computer Science",
        "Software Engineering",
        "Information Technology",
        "Cybersecurity",
      ],
      master: [
        "Computer Science",
        "Artificial Intelligence",
        "Data Science",
        "Information Security",
      ],
      doctoral: [
        "Computer Science",
        "Computational Theory",
        "Human-Computer Interaction",
      ],
    },
    Mathematics: {
      associate: [
        "Applied Mathematics",
        "Mathematical Foundations",
        "Statistical Methods",
      ],
      bachelor: [
        "Mathematics",
        "Applied Mathematics",
        "Statistics",
        "Mathematical Finance",
      ],
      master: [
        "Pure Mathematics",
        "Applied Mathematics",
        "Statistics",
        "Mathematical Modeling",
      ],
      doctoral: ["Mathematics", "Statistical Science", "Mathematical Physics"],
    },
    Physics: {
      associate: ["Physical Sciences", "Laboratory Technology", "Electronics"],
      bachelor: [
        "Physics",
        "Applied Physics",
        "Astronomy",
        "Materials Science",
      ],
      master: ["Physics", "Astrophysics", "Quantum Physics", "Optics"],
      doctoral: ["Physics", "Theoretical Physics", "Particle Physics"],
    },
    Chemistry: {
      associate: [
        "Chemical Technology",
        "Laboratory Science",
        "Environmental Science",
      ],
      bachelor: [
        "Chemistry",
        "Biochemistry",
        "Medicinal Chemistry",
        "Environmental Chemistry",
      ],
      master: [
        "Chemistry",
        "Analytical Chemistry",
        "Organic Chemistry",
        "Biochemistry",
      ],
      doctoral: [
        "Chemistry",
        "Pharmaceutical Chemistry",
        "Materials Chemistry",
      ],
    },
    Biology: {
      associate: [
        "Biological Sciences",
        "Healthcare Preparation",
        "Laboratory Techniques",
      ],
      bachelor: ["Biology", "Microbiology", "Molecular Biology", "Ecology"],
      master: ["Biology", "Genetics", "Biotechnology", "Environmental Biology"],
      doctoral: ["Biology", "Molecular Biology", "Evolutionary Biology"],
    },
    Engineering: {
      associate: [
        "Engineering Technology",
        "Mechanical Design",
        "Electrical Systems",
      ],
      bachelor: [
        "Mechanical Engineering",
        "Electrical Engineering",
        "Civil Engineering",
        "Chemical Engineering",
      ],
      master: [
        "Engineering Management",
        "Mechanical Engineering",
        "Electrical Engineering",
        "Biomedical Engineering",
      ],
      doctoral: ["Engineering", "Robotics", "Nanotechnology"],
    },
    Business: {
      associate: [
        "Business Administration",
        "Accounting Technology",
        "Marketing Fundamentals",
      ],
      bachelor: [
        "Business Administration",
        "Finance",
        "Marketing",
        "Accounting",
      ],
      master: [
        "Business Administration",
        "Finance",
        "Marketing Analytics",
        "International Business",
      ],
      doctoral: ["Business Administration", "Management", "Finance"],
    },
    Economics: {
      associate: [
        "Economic Principles",
        "Business Economics",
        "Financial Services",
      ],
      bachelor: [
        "Economics",
        "Applied Economics",
        "Financial Economics",
        "International Economics",
      ],
      master: [
        "Economics",
        "Applied Economics",
        "Development Economics",
        "Econometrics",
      ],
      doctoral: ["Economics", "Economic Theory", "Political Economy"],
    },
    Psychology: {
      associate: [
        "Behavioral Science",
        "Human Services",
        "Mental Health Support",
      ],
      bachelor: [
        "Psychology",
        "Clinical Psychology",
        "Developmental Psychology",
        "Cognitive Psychology",
      ],
      master: [
        "Psychology",
        "Clinical Psychology",
        "Counseling Psychology",
        "Industrial-Organizational Psychology",
      ],
      doctoral: ["Psychology", "Clinical Psychology", "Neuropsychology"],
    },
  };

  // Program descriptions that explain what the program is about
  const programDescriptions = {
    // Computer Science
    "Software Development":
      "Focuses on practical programming skills and software development methodologies for building applications across various platforms.",
    "Web Development":
      "Specializes in front-end and back-end technologies for creating responsive and dynamic web applications.",
    "IT Support":
      "Prepares students for technical support roles with training in hardware, software troubleshooting, and customer service.",
    "Computer Science":
      "Comprehensive study of computational theory, algorithms, data structures, and software development with applications across multiple domains.",
    "Software Engineering":
      "Emphasizes systematic approaches to designing, developing, and maintaining complex software systems with focus on quality and scalability.",
    "Information Technology":
      "Covers the implementation, support, and management of computer-based information systems with focus on organizational needs.",
    Cybersecurity:
      "Focuses on protecting computer systems, networks, and data from security breaches, attacks, and unauthorized access.",
    "Artificial Intelligence":
      "Advanced study of intelligent agents, machine learning algorithms, and systems that can perform tasks requiring human intelligence.",
    "Data Science":
      "Interdisciplinary field using scientific methods, processes, and systems to extract knowledge from structured and unstructured data.",
    "Information Security":
      "Advanced study of protecting information systems from unauthorized access, use, disclosure, disruption, modification, or destruction.",
    "Computational Theory":
      "Research-focused program exploring theoretical foundations of computation, algorithms, and computational complexity.",
    "Human-Computer Interaction":
      "Research on the design and use of computer technology, focusing on interfaces between people and computers.",

    // Mathematics
    "Applied Mathematics":
      "Application of mathematical methods to solve problems in science, engineering, business, and industry.",
    "Mathematical Foundations":
      "Study of fundamental mathematical concepts and their applications in various fields.",
    "Statistical Methods":
      "Introduction to collecting, analyzing, interpreting, and presenting data for decision-making.",
    Mathematics:
      "Study of quantity, structure, space, and change, developing abstract reasoning and problem-solving skills.",
    "Mathematical Finance":
      "Application of mathematical methods to financial markets and risk management.",
    Statistics:
      "Collection, analysis, interpretation, presentation, and organization of data for decision-making.",
    "Pure Mathematics":
      "Abstract study of mathematical concepts independent of any application outside mathematics.",
    "Mathematical Modeling":
      "Construction and analysis of mathematical representations of real-world systems.",
    "Statistical Science":
      "Advanced research in statistical theory, methods, and applications across various domains.",
    "Mathematical Physics":
      "Application of advanced mathematical methods to problems in physics.",

    // Physics
    "Physical Sciences":
      "Introduction to the fundamental principles of physics and their applications.",
    "Laboratory Technology":
      "Hands-on training in laboratory techniques and equipment used in physical sciences.",
    Electronics:
      "Study of electronic circuits, components, and systems with practical applications.",
    Physics:
      "Study of matter, energy, and their interactions, from subatomic particles to the cosmos.",
    "Applied Physics":
      "Application of physics principles to practical problems in engineering, medicine, and technology.",
    Astronomy:
      "Study of celestial objects, space, and the physical universe as a whole.",
    "Materials Science":
      "Interdisciplinary study of the properties of matter and their applications in science and engineering.",
    Astrophysics:
      "Application of physics principles to understand the behavior of astronomical objects and phenomena.",
    "Quantum Physics":
      "Study of physical phenomena at nanoscopic scales, where quantum effects are important.",
    Optics:
      "Study of light and its interactions with matter, including optical devices and techniques.",
    "Theoretical Physics":
      "Development of mathematical models to explain and predict natural phenomena.",
    "Particle Physics":
      "Study of the elementary constituents of matter and radiation, and their interactions.",

    // Add more descriptions for other departments as needed...
  };

  const programIds = generateIds("P", 1, count);
  const programs = [];

  // Track used program names to ensure uniqueness
  const usedProgramNames = new Set();

  for (let i = 0; i < count; i++) {
    const programCode = programIds[i];
    const departmentIndex = i % departmentIds.length;
    const departmentId = departmentIds[departmentIndex];

    // Get department name (assuming we have department objects with name property)
    // This is a simplification - in real code you'd need to look up the actual department name
    const departmentName =
      Object.keys(departmentPrograms)[
        departmentIndex % Object.keys(departmentPrograms).length
      ];

    // Select degree level - distribute evenly
    const degreeLevel = degreeLevels[i % degreeLevels.length];

    // Get available programs for this department and degree level
    const availablePrograms = departmentPrograms[departmentName][degreeLevel];

    // Select a program name that hasn't been used yet
    let programName;
    for (const name of availablePrograms) {
      const fullName = `${
        degreeLevel === "bachelor"
          ? "BSc"
          : degreeLevel === "master"
          ? "MSc"
          : degreeLevel === "doctoral"
          ? "PhD"
          : "Associate"
      } in ${name}`;
      if (!usedProgramNames.has(fullName)) {
        programName = name;
        usedProgramNames.add(fullName);
        break;
      }
    }

    // If all names are used, just pick one (in a real scenario, you might add a suffix or number)
    if (!programName) {
      programName = availablePrograms[i % availablePrograms.length];
    }

    // Format the display name based on degree level
    const displayName = `${
      degreeLevel === "bachelor"
        ? "BSc"
        : degreeLevel === "master"
        ? "MSc"
        : degreeLevel === "doctoral"
        ? "PhD"
        : "Associate"
    } in ${programName}`;

    // Get a detailed description or use a generic one if not available
    const description =
      programDescriptions[programName] ||
      `${
        degreeLevel.charAt(0).toUpperCase() + degreeLevel.slice(1)
      } level program in ${programName}, providing students with theoretical knowledge and practical skills in the field.`;

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

    programs.push({
      programCode,
      name: displayName,
      description,
      department: departmentId,
      degreeLevel,
      credits: degreeCreditMap[degreeLevel],
      duration: degreeDurationMap[degreeLevel],
      status: "active",
    });
  }

  return programs;
};

// Generate users
const generateUsers = (deptIds = [], programIds = []) => {
  // Admin users
  const adminCount = 2;
  const adminIds = generateUserIds("A", 1, adminCount);
  const admins = adminIds.map((UserId, index) => ({
    username: `admin${index + 1}`,
    password: `admin${index + 1}123`,
    email: `admin${index + 1}@school.edu`,
    role: "admin",
    UserId,
  }));
  console.log(
    "Admin IDs:",
    admins.map((admin) => admin.UserId)
  );
  console.log(
    "Admin passwords:",
    admins.map((admin) => admin.password)
  );

  // Teacher users
  const teacherCount = 5;
  const teacherIds = generateUserIds("T", 1, teacherCount);
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
  const studentIds = generateUserIds("S", 1, studentCount);
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
const generateCourses = (
  count = 10,
  programIds = [],
  departments = [],
  programs = []
) => {
  // Create a mapping of department IDs to department names
  const departmentMap = departments.reduce((map, dept) => {
    map[dept._id.toString()] = dept.name;
    return map;
  }, {});

  // Create a mapping of program IDs to program info (name, department, degree level)
  const programMap = programs.reduce((map, prog) => {
    map[prog._id.toString()] = {
      name: prog.name,
      departmentId: prog.department.toString(),
      departmentName: departmentMap[prog.department.toString()],
      degreeLevel: prog.degreeLevel,
    };
    return map;
  }, {});

  // Group programs by department
  const programsByDepartment = programs.reduce((map, prog) => {
    const deptId = prog.department.toString();
    if (!map[deptId]) {
      map[deptId] = [];
    }
    map[deptId].push({
      id: prog._id,
      name: prog.name,
      degreeLevel: prog.degreeLevel,
    });
    return map;
  }, {});

  // Department-specific courses
  const departmentCourses = {
    "Computer Science": {
      associate: [
        {
          title: "Introduction to Programming",
          description:
            "Fundamentals of programming using Python, covering variables, control structures, functions, and basic data structures.",
        },
        {
          title: "Web Development Fundamentals",
          description:
            "Introduction to HTML, CSS, and JavaScript for building responsive websites.",
        },
        {
          title: "Computer Hardware Basics",
          description:
            "Overview of computer hardware components, assembly, and troubleshooting techniques.",
        },
        {
          title: "Database Fundamentals",
          description:
            "Introduction to database concepts, SQL, and basic database design.",
        },
        {
          title: "Introduction to Networking",
          description:
            "Basic concepts of computer networks, protocols, and network configuration.",
        },
        {
          title: "IT Support Essentials",
          description:
            "Fundamentals of IT support, troubleshooting, and customer service skills.",
        },
      ],
      bachelor: [
        {
          title: "Data Structures and Algorithms",
          description:
            "Advanced data structures and algorithm analysis, including trees, graphs, sorting, and searching algorithms.",
        },
        {
          title: "Object-Oriented Programming",
          description:
            "Principles of object-oriented design and programming using Java or C++.",
        },
        {
          title: "Computer Networks",
          description:
            "Fundamentals of computer networking, protocols, and network security.",
        },
        {
          title: "Operating Systems",
          description:
            "Principles of operating system design, process management, memory management, and file systems.",
        },
        {
          title: "Software Engineering",
          description:
            "Software development methodologies, requirements analysis, design patterns, and project management.",
        },
        {
          title: "Web Application Development",
          description:
            "Server-side programming, MVC architecture, and full-stack web application development.",
        },
        {
          title: "Database Management Systems",
          description:
            "Advanced database concepts, normalization, transaction processing, and database administration.",
        },
        {
          title: "Computer Architecture",
          description:
            "Computer organization, processor design, memory hierarchy, and I/O systems.",
        },
        {
          title: "Mobile App Development",
          description:
            "Design and development of applications for mobile platforms using modern frameworks.",
        },
        {
          title: "Introduction to Cybersecurity",
          description:
            "Fundamentals of information security, threat modeling, and security best practices.",
        },
      ],
      master: [
        {
          title: "Advanced Algorithms",
          description:
            "Complex algorithm design and analysis, computational complexity theory, and optimization techniques.",
        },
        {
          title: "Machine Learning",
          description:
            "Supervised and unsupervised learning algorithms, neural networks, and practical applications.",
        },
        {
          title: "Big Data Systems",
          description:
            "Distributed computing frameworks, NoSQL databases, and big data processing techniques.",
        },
        {
          title: "Cloud Computing",
          description:
            "Cloud service models, virtualization, containerization, and cloud-native application development.",
        },
        {
          title: "Natural Language Processing",
          description:
            "Computational linguistics, text analysis, sentiment analysis, and language generation models.",
        },
        {
          title: "Advanced Computer Networks",
          description:
            "Advanced networking concepts, software-defined networking, and network virtualization.",
        },
        {
          title: "Computer Vision",
          description:
            "Image processing, feature extraction, object recognition, and visual tracking algorithms.",
        },
        {
          title: "Distributed Systems",
          description:
            "Design and implementation of distributed systems, consensus algorithms, and fault tolerance.",
        },
      ],
      doctoral: [
        {
          title: "Advanced Machine Learning",
          description:
            "Cutting-edge machine learning techniques, deep learning architectures, and research methodologies.",
        },
        {
          title: "Computational Complexity Theory",
          description:
            "Advanced study of computational complexity classes, reducibility, and open problems.",
        },
        {
          title: "Research Methods in Computer Science",
          description:
            "Research design, literature review, experimental methods, and academic writing in computer science.",
        },
        {
          title: "Advanced Topics in Artificial Intelligence",
          description:
            "Current research areas in AI, including reinforcement learning, explainable AI, and AI ethics.",
        },
        {
          title: "Quantum Computing",
          description:
            "Principles of quantum computation, quantum algorithms, and quantum information theory.",
        },
      ],
    },
    Mathematics: {
      associate: [
        {
          title: "College Algebra",
          description:
            "Fundamental algebraic concepts, equations, functions, and their applications.",
        },
        {
          title: "Introduction to Statistics",
          description:
            "Basic statistical methods, probability, data analysis, and interpretation.",
        },
        {
          title: "Discrete Mathematics",
          description:
            "Sets, logic, combinatorics, graph theory, and their applications in computer science.",
        },
        {
          title: "Precalculus",
          description:
            "Preparation for calculus, including functions, trigonometry, and analytic geometry.",
        },
        {
          title: "Mathematics for Business",
          description:
            "Mathematical concepts and techniques used in business and finance.",
        },
      ],
      bachelor: [
        {
          title: "Calculus I",
          description:
            "Limits, derivatives, integrals, and applications of differential calculus.",
        },
        {
          title: "Calculus II",
          description:
            "Techniques of integration, sequences, series, and applications of integral calculus.",
        },
        {
          title: "Linear Algebra",
          description:
            "Vector spaces, linear transformations, matrices, and systems of linear equations.",
        },
        {
          title: "Differential Equations",
          description:
            "Ordinary differential equations, solution methods, and applications in science and engineering.",
        },
        {
          title: "Abstract Algebra",
          description:
            "Groups, rings, fields, and their properties and applications.",
        },
        {
          title: "Real Analysis",
          description:
            "Rigorous treatment of limits, continuity, differentiation, and integration of real-valued functions.",
        },
        {
          title: "Probability Theory",
          description:
            "Axiomatic probability, random variables, distributions, and limit theorems.",
        },
        {
          title: "Complex Analysis",
          description:
            "Functions of a complex variable, analytic functions, contour integration, and residue theory.",
        },
        {
          title: "Number Theory",
          description:
            "Properties of integers, prime numbers, congruences, and Diophantine equations.",
        },
      ],
      master: [
        {
          title: "Advanced Linear Algebra",
          description:
            "Advanced topics in linear algebra, including canonical forms, inner product spaces, and applications.",
        },
        {
          title: "Numerical Analysis",
          description:
            "Numerical methods for solving mathematical problems, error analysis, and implementation.",
        },
        {
          title: "Partial Differential Equations",
          description:
            "Theory and solution methods for partial differential equations with applications.",
        },
        {
          title: "Probability Theory",
          description:
            "Measure-theoretic foundations of probability, random variables, and stochastic processes.",
        },
        {
          title: "Topology",
          description:
            "Topological spaces, continuity, compactness, connectedness, and separation axioms.",
        },
        {
          title: "Mathematical Statistics",
          description:
            "Statistical inference, estimation theory, hypothesis testing, and regression analysis.",
        },
        {
          title: "Optimization Theory",
          description:
            "Linear and nonlinear optimization, convex analysis, and optimization algorithms.",
        },
      ],
      doctoral: [
        {
          title: "Functional Analysis",
          description:
            "Study of vector spaces with additional structure and their applications in analysis.",
        },
        {
          title: "Algebraic Topology",
          description:
            "Topological spaces, homotopy, homology, and their algebraic invariants.",
        },
        {
          title: "Research Seminar in Mathematics",
          description:
            "Current research topics, presentation skills, and collaborative research in mathematics.",
        },
        {
          title: "Advanced Differential Geometry",
          description:
            "Manifolds, tensors, differential forms, and Riemannian geometry.",
        },
        {
          title: "Representation Theory",
          description:
            "Representations of groups and algebras, character theory, and applications.",
        },
      ],
    },
    Physics: {
      associate: [
        {
          title: "Introduction to Physics",
          description:
            "Fundamental principles of mechanics, thermodynamics, and waves with laboratory experiments.",
        },
        {
          title: "Electricity and Magnetism Basics",
          description:
            "Introduction to electric and magnetic fields, circuits, and electromagnetic phenomena.",
        },
        {
          title: "Astronomy Fundamentals",
          description:
            "Introduction to celestial objects, the solar system, and observational astronomy.",
        },
        {
          title: "Physics for Engineering",
          description:
            "Applied physics concepts relevant to engineering disciplines.",
        },
      ],
      bachelor: [
        {
          title: "Classical Mechanics",
          description:
            "Newtonian mechanics, oscillations, central forces, and Lagrangian and Hamiltonian formulations.",
        },
        {
          title: "Electromagnetism",
          description:
            "Maxwell's equations, electromagnetic waves, and applications in various physical systems.",
        },
        {
          title: "Quantum Mechanics",
          description:
            "Schrödinger equation, wave functions, operators, and quantum phenomena.",
        },
        {
          title: "Thermodynamics and Statistical Mechanics",
          description:
            "Laws of thermodynamics, entropy, statistical ensembles, and phase transitions.",
        },
        {
          title: "Optics",
          description:
            "Geometric and physical optics, interference, diffraction, and optical instruments.",
        },
        {
          title: "Modern Physics",
          description:
            "Special relativity, introductory quantum mechanics, and atomic physics.",
        },
        {
          title: "Computational Physics",
          description:
            "Numerical methods and computational techniques for solving physics problems.",
        },
        {
          title: "Nuclear and Particle Physics",
          description:
            "Nuclear structure, radioactivity, elementary particles, and fundamental interactions.",
        },
      ],
      master: [
        {
          title: "Advanced Quantum Mechanics",
          description:
            "Quantum dynamics, symmetries, perturbation theory, and scattering theory.",
        },
        {
          title: "Solid State Physics",
          description:
            "Crystal structures, lattice dynamics, electronic properties of solids, and superconductivity.",
        },
        {
          title: "Astrophysics",
          description:
            "Stellar structure and evolution, galaxies, cosmology, and observational techniques.",
        },
        {
          title: "Advanced Electrodynamics",
          description:
            "Relativistic electrodynamics, radiation theory, and electromagnetic wave propagation.",
        },
        {
          title: "Statistical Physics",
          description:
            "Advanced statistical mechanics, critical phenomena, and non-equilibrium systems.",
        },
        {
          title: "Plasma Physics",
          description:
            "Properties and behavior of plasmas, plasma waves, and fusion physics.",
        },
      ],
      doctoral: [
        {
          title: "Quantum Field Theory",
          description:
            "Relativistic quantum mechanics, quantum electrodynamics, and the Standard Model.",
        },
        {
          title: "General Relativity",
          description:
            "Einstein's theory of gravity, spacetime curvature, black holes, and cosmological models.",
        },
        {
          title: "Advanced Research Methods in Physics",
          description:
            "Experimental design, data analysis, and research techniques in physics.",
        },
        {
          title: "String Theory",
          description:
            "Fundamental principles of string theory, supersymmetry, and extra dimensions.",
        },
        {
          title: "Cosmology",
          description:
            "Origin, evolution, and structure of the universe, dark matter, and dark energy.",
        },
      ],
    },
    Chemistry: {
      associate: [
        {
          title: "General Chemistry",
          description:
            "Fundamental principles of chemistry, atomic structure, chemical bonding, and reactions.",
        },
        {
          title: "Organic Chemistry Basics",
          description:
            "Introduction to organic compounds, functional groups, and basic reaction mechanisms.",
        },
        {
          title: "Laboratory Techniques",
          description:
            "Basic laboratory procedures, safety protocols, and analytical methods in chemistry.",
        },
        {
          title: "Chemistry for Health Sciences",
          description:
            "Chemical principles relevant to biological systems and healthcare applications.",
        },
      ],
      bachelor: [
        {
          title: "Organic Chemistry I",
          description:
            "Structure, properties, and reactions of organic compounds with emphasis on reaction mechanisms.",
        },
        {
          title: "Organic Chemistry II",
          description:
            "Advanced organic reactions, synthesis strategies, and spectroscopic analysis of organic compounds.",
        },
        {
          title: "Analytical Chemistry",
          description:
            "Quantitative and qualitative analysis methods, instrumentation, and data interpretation.",
        },
        {
          title: "Physical Chemistry",
          description:
            "Thermodynamics, kinetics, quantum mechanics, and spectroscopy applied to chemical systems.",
        },
        {
          title: "Inorganic Chemistry",
          description:
            "Properties and reactions of inorganic compounds, coordination chemistry, and solid-state materials.",
        },
        {
          title: "Biochemistry",
          description:
            "Structure and function of biomolecules, metabolism, and cellular processes.",
        },
        {
          title: "Environmental Chemistry",
          description:
            "Chemical processes in the environment, pollution, and environmental remediation.",
        },
      ],
      master: [
        {
          title: "Advanced Organic Synthesis",
          description:
            "Modern synthetic methods, retrosynthetic analysis, and total synthesis of complex molecules.",
        },
        {
          title: "Chemical Instrumentation",
          description:
            "Advanced analytical techniques, instrument design, and method development.",
        },
        {
          title: "Medicinal Chemistry",
          description:
            "Drug design, structure-activity relationships, and pharmacological properties of therapeutic agents.",
        },
        {
          title: "Computational Chemistry",
          description:
            "Molecular modeling, quantum chemical calculations, and simulation methods.",
        },
        {
          title: "Materials Chemistry",
          description:
            "Synthesis, characterization, and properties of advanced materials for technological applications.",
        },
      ],
      doctoral: [
        {
          title: "Research Methods in Chemistry",
          description:
            "Advanced research techniques, experimental design, and scientific communication in chemistry.",
        },
        {
          title: "Chemical Biology",
          description:
            "Interface of chemistry and biology, chemical tools for biological research, and bioorthogonal chemistry.",
        },
        {
          title: "Catalysis",
          description:
            "Homogeneous and heterogeneous catalysis, enzyme catalysis, and catalyst design.",
        },
        {
          title: "Spectroscopic Methods",
          description:
            "Advanced spectroscopic techniques for structural determination and reaction monitoring.",
        },
      ],
    },
    Biology: {
      associate: [
        {
          title: "General Biology",
          description:
            "Introduction to biological principles, cell structure, genetics, and ecology.",
        },
        {
          title: "Human Anatomy and Physiology",
          description:
            "Structure and function of human body systems with laboratory components.",
        },
        {
          title: "Microbiology Basics",
          description:
            "Introduction to microorganisms, their structure, function, and roles in health and disease.",
        },
        {
          title: "Environmental Biology",
          description:
            "Ecological principles, biodiversity, and human impact on natural systems.",
        },
      ],
      bachelor: [
        {
          title: "Cell Biology",
          description:
            "Structure and function of cells, cellular organelles, and cellular processes.",
        },
        {
          title: "Genetics",
          description:
            "Principles of inheritance, gene expression, and genetic engineering.",
        },
        {
          title: "Molecular Biology",
          description:
            "DNA structure and function, protein synthesis, and molecular techniques.",
        },
        {
          title: "Ecology",
          description:
            "Interactions between organisms and their environment, population dynamics, and community ecology.",
        },
        {
          title: "Evolution",
          description:
            "Mechanisms of evolutionary change, natural selection, and the history of life on Earth.",
        },
        {
          title: "Physiology",
          description:
            "Function and regulation of biological systems in animals and plants.",
        },
        {
          title: "Immunology",
          description:
            "Immune system components, immune responses, and immunological disorders.",
        },
        {
          title: "Developmental Biology",
          description:
            "Processes of growth and development from fertilization to maturity in animals and plants.",
        },
      ],
      master: [
        {
          title: "Advanced Genetics",
          description:
            "Advanced topics in genetics, genomics, and genetic regulation.",
        },
        {
          title: "Biotechnology",
          description:
            "Applications of biological systems and organisms in technology development.",
        },
        {
          title: "Neurobiology",
          description:
            "Structure and function of the nervous system, neural signaling, and behavior.",
        },
        {
          title: "Conservation Biology",
          description:
            "Preservation of biodiversity, habitat conservation, and sustainable resource management.",
        },
        {
          title: "Bioinformatics",
          description:
            "Computational analysis of biological data, sequence analysis, and structural bioinformatics.",
        },
      ],
      doctoral: [
        {
          title: "Research Methods in Biology",
          description:
            "Advanced research techniques, experimental design, and data analysis in biological sciences.",
        },
        {
          title: "Evolutionary Biology",
          description:
            "Advanced concepts in evolution, speciation, and phylogenetics.",
        },
        {
          title: "Systems Biology",
          description:
            "Integrated study of biological systems, network analysis, and computational modeling.",
        },
        {
          title: "Molecular Genetics",
          description:
            "Advanced study of gene structure, function, and regulation at the molecular level.",
        },
      ],
    },
    // Add more departments as needed
  };

  // Common course attributes
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
  const courses = [];

  // First, create department-specific courses
  let courseIndex = 0;

  // For each department that has programs
  Object.keys(programsByDepartment).forEach((deptId) => {
    const deptName = departmentMap[deptId];
    const deptPrograms = programsByDepartment[deptId];

    // Skip if no course templates for this department
    if (!departmentCourses[deptName]) return;

    // Group programs by degree level
    const programsByLevel = deptPrograms.reduce((map, prog) => {
      if (!map[prog.degreeLevel]) {
        map[prog.degreeLevel] = [];
      }
      map[prog.degreeLevel].push(prog.id);
      return map;
    }, {});

    // For each degree level in this department
    Object.keys(programsByLevel).forEach((level) => {
      // Skip if no course templates for this level
      if (!departmentCourses[deptName][level]) return;

      const levelPrograms = programsByLevel[level];
      const coursesForLevel = departmentCourses[deptName][level];

      // Create each course for this level
      coursesForLevel.forEach((courseTemplate) => {
        if (courseIndex >= count) return; // Don't exceed requested count

        const courseCode = courseIds[courseIndex];

        // Generate reasonable course schedule
        const dayIndex1 = courseIndex % 5;
        let dayIndex2 = (dayIndex1 + 2) % 5; // Classes typically separated by a day
        const dayOfWeek = [days[dayIndex1], days[dayIndex2]];

        // Generate class times
        const startHour = 8 + (Math.floor(courseIndex / 2) % 8); // Classes between 8 AM and 4 PM
        const startTime = `${startHour.toString().padStart(2, "0")}:00`;
        const endTime = `${(startHour + 1).toString().padStart(2, "0")}:30`;

        courses.push({
          courseCode,
          title: courseTemplate.title,
          description: courseTemplate.description,
          credits: (courseIndex % 3) + 2, // Credits between 2-4
          dayOfWeek,
          startTime,
          endTime,
          location: locations[courseIndex % locations.length],
          programIds: levelPrograms, // Assign to all programs of this level in this department
        });

        courseIndex++;
      });
    });
  });

  // If we haven't created enough courses, add some generic ones
  const genericCourses = [
    {
      title: "Academic Writing",
      description:
        "Principles of academic writing, research, and citation across disciplines.",
    },
    {
      title: "Critical Thinking",
      description:
        "Logical reasoning, argument analysis, and problem-solving techniques.",
    },
    {
      title: "Professional Ethics",
      description:
        "Ethical principles and decision-making in professional contexts.",
    },
    {
      title: "Research Methods",
      description:
        "Fundamentals of research design, data collection, and analysis.",
    },
    {
      title: "Project Management",
      description:
        "Planning, executing, and closing projects efficiently and effectively.",
    },
  ];

  while (courseIndex < count) {
    const courseCode = courseIds[courseIndex];
    const genericCourse = genericCourses[courseIndex % genericCourses.length];

    // Generate schedule
    const dayIndex1 = courseIndex % 5;
    let dayIndex2 = (dayIndex1 + 2) % 5;
    const dayOfWeek = [days[dayIndex1], days[dayIndex2]];

    const startHour = 8 + (Math.floor(courseIndex / 2) % 8);
    const startTime = `${startHour.toString().padStart(2, "0")}:00`;
    const endTime = `${(startHour + 1).toString().padStart(2, "0")}:30`;

    // Assign to random programs
    const randomProgramCount = 1 + (courseIndex % 3); // 1-3 programs
    const assignedPrograms = [];
    for (let i = 0; i < randomProgramCount; i++) {
      const randomIndex = (courseIndex + i) % programIds.length;
      assignedPrograms.push(programIds[randomIndex]);
    }

    courses.push({
      courseCode,
      title: genericCourse.title,
      description: genericCourse.description,
      credits: (courseIndex % 3) + 2,
      dayOfWeek,
      startTime,
      endTime,
      location: locations[courseIndex % locations.length],
      programIds: assignedPrograms,
    });

    courseIndex++;
  }

  return courses;
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
  const statuses = ["present", "absent", "late", "excused"];
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

    // Generate and add programs - increased from 8 to 20
    const programData = generatePrograms(20, departmentIds);
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
        user.passwordHash = user.password;
        delete user.password;

        const userDoc = new User(user);
        return await userDoc.save();
      })
    );
    console.log(`${savedUsers.length} Users added`);

    // Filter students from the saved users
    const savedStudents = savedUsers.filter((user) => user.role === "student");
    console.log(`Found ${savedStudents.length} students`);

    // Generate and add courses - increased from 10 to 30
    const courseData = generateCourses(
      30,
      programIds,
      savedDepartments,
      savedPrograms
    );
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
