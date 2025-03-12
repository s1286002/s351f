/**
 * Database configuration - Handles MongoDB connection setup
 */

import mongoose from "mongoose";

let connected = false;

const connectDB = async () => {
  mongoose.set("strictQuery", true);

  // if the database is already connected, return
  if (connected) {
    console.log("Connected to MongoDB");
    return;
  }

  // Connect to the MongoDB database
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
};

export default connectDB;
