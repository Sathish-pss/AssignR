import express from "express";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewares.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getTeamList,
  getNotificationsList,
  updateUserProfile,
  markNotificationRead,
} from "../controllers/userController.js";

// Decalring the express router here
const router = express.Router();
/**
 * Defining the user end points here
 */
// User Registrations and Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("logout", logoutUser);

// Routes to get the Team details
router.get("/get-team", protectRoute, isAdminRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

// Route to update user profile
router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationRead);

export default router;
