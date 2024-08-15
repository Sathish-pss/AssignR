import mongoose from "mongoose";

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
