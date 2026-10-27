import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import taskRoutes from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ success: true, message: "TaskFlow API is running" }));
app.use("/api/tasks", taskRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message });
  if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid input." });
  res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
});

try {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow", { serverSelectionTimeoutMS: 5000 });
  console.log("✓ Connected to MongoDB");
  app.listen(PORT, () => console.log(`✓ TaskFlow API running at http://localhost:${PORT}`));
} catch (error) {
  console.error("✗ Could not connect to MongoDB. Start MongoDB or check backend/.env.", error.message);
  process.exit(1);
}
