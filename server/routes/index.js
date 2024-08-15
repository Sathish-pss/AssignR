import express from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";

// Decalring the express router here
const router = express.Router();

// Defining the routes for user and Tasks
router.use("/user", userRoutes);
router.use("/task", taskRoutes);

export default router;
