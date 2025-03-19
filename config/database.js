/**
 * Database configuration - Handles MongoDB connection setup
 * @module database
 */

import mongoose from "mongoose";

/**
 * Cached database connection
 * @type {mongoose.Connection}
 */
let cachedConnection = global.mongooseConnection;

/**
 * Connects to MongoDB with connection pooling and caching
 * @async
 * @returns {Promise<mongoose.Connection>} Mongoose connection instance
 * @throws {Error} If connection fails
 */
const connectDB = async () => {
  // If we have a cached connection, return it
  if (cachedConnection) {
    return cachedConnection;
  }

  // Configure mongoose options for optimal performance
  mongoose.set("strictQuery", true);

  try {
    // Set up connection options
    const opts = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Keep at least 5 connections open
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      serverSelectionTimeoutMS: 10000, // Give up server selection after 10 seconds
    };

    // Connect to MongoDB
    const connection = await mongoose.connect(process.env.MONGODB_URI, opts);

    // Cache the connection globally
    cachedConnection = connection;
    global.mongooseConnection = connection;

    console.log("Connected to MongoDB successfully");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error; // Rethrow to handle it in the calling code
  }
};

export default connectDB;
