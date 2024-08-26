import express from "express";
// Importing the middleware functions here
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewares.js";
// Importing the controller function here
import {
  createTask,
  duplicateTask,
  postTaskActivity,
  dashboardStatistics,
  getTask,
  getTasks,
  createSubTask,
  updateTask,
  trashTask,
  deleteRestoreTask,
} from "../controllers/taskController.js";

// Declaring the express router here
const router = express.Router();

// Route endpoints of Tasks
router.post("/create", protectRoute, isAdminRoute, createTask);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);
router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);

router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/update/:id", protectRoute, isAdminRoute, updateTask);
router.put("/:id", protectRoute, isAdminRoute, trashTask);

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);

export default router;
