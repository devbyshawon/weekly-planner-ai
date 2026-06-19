import mongoose from "mongoose";

/**
 * Connects to MongoDB using the URI in .env (MONGO_URI).
 * Works with either a local MongoDB instance or a free MongoDB Atlas cluster.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
