/**
 * Database Initialization Script
 *
 * This script initializes the MongoDB database with required collections and indexes
 * Run this script once when setting up the database for the first time
 */

const mongoose = require("mongoose");

const MONGODB_URI =
  "mongodb+srv://s1286002:TmtUhhJk6i0Rtuvt@cluster0.wnnmo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for initialization");

    const db = mongoose.connection;

    // Create collections with comments

    await db.createCollection("users");
    await db.createCollection("departments");
    await db.createCollection("programs");
    await db.createCollection("courses");
    await db.createCollection("academicrecords");
    await db.createCollection("attendances");
    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the initialization
initializeDatabase().catch(console.error);
