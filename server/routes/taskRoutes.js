import express from "express";
// Importing the middleware functions here
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewares.js";
// Importing the controller function here
import {
  createTask,
  duplicateTask,
  postTaskActivity,
} from "../controllers/taskController.js";

// Declaring the express router here
const router = express.Router();

// Route endpoints of Tasks
router.post("/create", protectRoute, isAdminRoute, createTask);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);

export default router;
