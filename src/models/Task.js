import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Task title is required"], trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    category: { type: String, enum: ["Personal", "Work", "Study", "Health", "Other"], default: "Personal" },
    dueDate: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
