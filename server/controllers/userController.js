import User from "../models/user.js";
import Notice from "../models/notification.js";
import { createJWT } from "../utils/index.js";

/**
 *
 * @returns Controller funciton to register user details
 */
export const registerUser = async (req, res) => {
  try {
    // Getting the req paramaters from the users
    const { name, email, password, isAdmin, role, title } = req.body;

    // Checking whether the user exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    // If not we can create a new user
    const user = await User.create({
      name,
      email,
      password,
      isAdmin,
      role,
      title,
    });

    // If the created user user is a admin, execute JWT Token, and do not send the password to the frontend
    if (user) {
      isAdmin ? createJWT(res, user._id) : null;
      user.password = undefined;
      res.status(200).json(user);
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * @returns Contoller function to login
 */

export const loginUser = async (req, res) => {
  try {
    // Getting the user parameters from the frontend
    const { email, password } = req.body;

    // Checking if the user already exists in db by email
    const user = await User.findOne({ email });

    // If there is no such user, return with Invalid response
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid user email or password",
      });
    }

    // If the user is inactive, Sends the response with user account deactivated
    if (!user?.isActive) {
      return res.status(400).json({
        status: false,
        message: "User account has been deactivated, contact the admin",
      });
    }

    // If the credentials are correct, verify the password
    const isMatch = await user.matchPassword(password);

    // If the user and the password is matched, Creating the token for the user
    if (user && isMatch) {
      createJWT(res, user._id);
      user.password = undefined;
      res.status(200).json({
        status: true,
        message: "Login Successful",
        data: user,
      });
    } else {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }
    // Else returning the error message with a status code
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * @returns Controller function returns the logout functionality
 */
export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      message: "Logged out Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * @returns Controller function to get the team details => Admin Route
 */
export const getTeamList = async (req, res) => {
  try {
    // Getting the team list from the db with specific fields
    const users = await User.find().select("name title role email isActive");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 *@returns Function to get the Notifications list
 */
export const getNotificationsList = async (req, res) => {
  try {
    // Getting the userId from the user, because we want to show the notifications to the particular user
    const { userId } = req.user;

    // Finding the notifications for the particualar user
    const notice = await Notice.find({
      team: userId,
      // If my id is in, then i will not see it
      isRead: { $nin: userId },
    }).populate("task", "title");

    res.status(201).json(notice);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * @returns Controller function to update the user profile
 */
export const updateUserProfile = async (req, res) => {
  try {
    // Getting the user details from the token
    const { userId, isAdmin } = req.user;

    // Getting the specific id from the Body
    const { _id } = req.body;

    // Checking the id to update the admin or own account id
    const id =
      isAdmin && userId === _id
        ? userId
        : isAdmin && userId !== _id
        ? _id
        : userId;

    // Finding the user by id
    const user = await User.findById(id);

    // If the user exists, updating the neccessary details from the request body
    if (user) {
      user.name = req.body.name || user.name;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;

      // Once updated, saving the details
      const updateUser = await user.save();
      user.password = undefined;

      // Returning the response
      res.status(201).json({
        status: true,
        message: "Profile Updated Successfully",
        user: updateUser,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * @returns Controller function to mark the notifications as read
 */
export const markNotificationRead = async (req, res) => {
  try {
    // Getting the user id from the frontend
    const { userId } = req.user;

    // Getting the id from the query params
    const { isReadType, id } = req.query;

    // Checking the if the user has clicked mark all or mark one
    if (isReadType == "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } }
      );
    }
    res.status(201).json({
      status: true,
      message: "Done",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * @returns Controller function to change the password
 */
export const changeUserPassword = async (req, res) => {
  // Since it is a protected route, always getting the user id
  try {
    const { userId } = req.user;
    console.log(userId);

    // Finding the user by id
    const user = await User.findById(userId);

    // If the user exists just update the password
    if (user) {
      user.password = req.body.password;
      await user.save();
      user.password = undefined;

      res.status(201).json({
        status: true,
        message: "Password Changed Successfully",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * @returns Controller function to Activate User profile
 */
export const activateUserProfile = async (req, res) => {
  try {
    // Fetching the id from the query params
    const { id } = req.params;

    // Finding the user by id
    const user = await User.findById(id);

    if (user) {
      user.isActive = req.body.isActive; // setting the isActive to true
      await user.save();

      res.status(201).json({
        status: true,
        message: `User account has been ${
          user.isActive ? "activated" : "disabled"
        }`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * @returns Controller function to delete the user - Admin only function
 */
export const deleteUserProfile = async (req, res) => {
  try {
    // Getting the user from the params
    const { id } = req.params;

    // Finding the user by id and deleting
    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "User deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};
