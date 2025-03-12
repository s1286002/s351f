/**
 * OpenAPI/Swagger Documentation Generator
 * Generates OpenAPI documentation for the API endpoints
 */

const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School Management System API",
      version: "1.0.0",
      description: "API documentation for the School Management System",
    },
    servers: [
      {
        url: "/api",
        description: "API Server",
      },
    ],
  },
  // Look for JSDoc comments in these files
  apis: [
    "./app/api/**/*.js",
    "./models/*.js",
    "./utils/apiFeatures.js",
    "./utils/handlerFactory.js",
    "./utils/swaggerComponents.js",
  ],
};

const specification = swaggerJsdoc(options);
const outputPath = path.join(process.cwd(), "public", "swagger.json");
fs.writeFileSync(outputPath, JSON.stringify(specification, null, 2));
