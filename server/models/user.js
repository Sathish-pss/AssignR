import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

/**
 * Defining the user scheme here
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    role: { type: String, requried: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    isActive: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

/**
 * Function to hash the password
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Comparing the password with entered password
  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
});

const User = mongoose.model("User", userSchema);

export default User;
