import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing. Copy .env.example to .env.local and add your Atlas connection string."
  );
}

/**
 * Next.js reloads modules a lot in dev mode. We cache the connection on the
 * global object so we don't open a new MongoDB connection on every request
 * (same pattern you'd want on Touring Buddiez too, if you haven't already).
 */
let cached = (global as any).mongooseConn;

if (!cached) {
  cached = (global as any).mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
