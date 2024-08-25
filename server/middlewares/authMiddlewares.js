import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Middleware Function to check whether the route is a protected routes
 * Routes can be accessed, only in sign
 */
const protectRoute = async (req, res, next) => {
  try {
    /**
     * Retrieving the token from the cookies
     */
    let token = req.cookies?.token;

    //If the token exists, Verifying the token with secret key
    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // Finding the details by user id
      const resp = await User.findById(decodedToken?.USERiD).select(
        "isAdmin email"
      );

      req.user = {
        email: resp?.email,
        isAdmin: resp?.isAdmin,
        userId: decodedToken?.USERiD,
      };
      next();
    } else {
      // Else returning as not authorized endpoint
      return res.status(401).json({
        status: false,
        message: "Not authorized. Try login again",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ status: false, message: "Not authorized. Try login again" });
  }
};

/**
 * Middleware Function to check the whether the routes is a Admin routes
 */
const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Not authorized as admin. Try login as admin",
    });
  }
};

export { isAdminRoute, protectRoute };
