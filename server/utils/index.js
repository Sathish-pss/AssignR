import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/**
 * Function to connect the Mongodb Database
 */
export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connection established");
  } catch (error) {
    console.log("DB Error " + error);
  }
};

/**
 * @returns Function to create a JWT Token for the Authentication and Authorization
 * @param {*} RES Response from the user
 * @param {*} USERiD
 */
export const createJWT = (res, USERiD) => {
  // Signing the token with the user id and setting the expiry time
  const token = jwt.sign({ USERiD }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict", // Prevent CSRF Attack
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};
