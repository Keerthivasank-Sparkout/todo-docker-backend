import { Router } from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";

const router = Router();
const validId = (id) => mongoose.isValidObjectId(id);

router.get("/", async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status === "active") filter.completed = false;
    if (status === "completed") filter.completed = true;
    if (search?.trim()) filter.title = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const tasks = await Task.find(filter).sort({ completed: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: tasks });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, description = "", priority = "Medium", category = "Personal", dueDate = null } = req.body;
    if (typeof title !== "string" || !title.trim()) return res.status(400).json({ success: false, message: "Please enter a task title." });
    const task = await Task.create({ title: title.trim(), description, priority, category, dueDate: dueDate || null });
    res.status(201).json({ success: true, data: task });
  } catch (error) { next(error); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID." });
    const allowed = ["title", "description", "completed", "priority", "category", "dueDate"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (typeof update.title === "string") update.title = update.title.trim();
    if (update.dueDate === "") update.dueDate = null;
    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID." });
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });
    res.json({ success: true, message: "Task deleted." });
  } catch (error) { next(error); }
});

router.delete("/", async (_req, res, next) => {
  try {
    const result = await Task.deleteMany({ completed: true });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) { next(error); }
});

export default router;
