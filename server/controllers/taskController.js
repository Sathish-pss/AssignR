import express from "express";
// Importing the models here
import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

/**
 * @returns Controller function to create a new task
 */
export const createTask = async (req, res) => {
  try {
    // Getting the user id from the user
    const { userId } = req.user;

    // Getting the parameters from the req.body
    const { title, team, stage, date, priority, assets } = req.body;

    // Returing response text
    let text = "New task has been assigned to you";
    // If the task created is a team task (Team is an array), returning text with team length
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    // Returning the priority
    text =
      text +
      `The task priority is set a ${priority}, so check and act accordingly. Thank you`;

    // Returning the priority
    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    // After getting all the parameters, now creating the task in the db
    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
    });

    // After creating the task successfully, creating the notificatoin
    await Notice.create({
      team,
      text,
      task: task._id,
    });

    res.status(200).json({
      status: true,
      task,
      message: "Task created Successfully",
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
 * @returns Controller function to duplicate a task
 */
export const duplicateTask = async (req, res) => {
  try {
    // Getting the task id
    const { id } = req.params;

    // Finding the task by id
    const task = await Task.findById(id);

    const newTask = await Task.create({
      ...task,
      title: task.title + " - Duplicate",
    });
    // Assigning the new task's parameters
    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    // Alerting the users after the task is created
    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1}  and others.`;
    }

    text =
      text +
      ` The task priority is set a ${task.priority} priority, so 
    check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

    // Returning the response
    res.status(200).json({
      status: true,
      message: "Task Duplicated successfully",
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
 * @returns Controller function to create post task post activity
 */
export const postTaskActivity = async (req, res) => {
  try {
    // Getting the task id from the params
    const { id } = req.params;
    // Getting the user id
    const { userId } = req.user;

    const { type, activity } = req.body;

    // Finding the task by id
    const task = await Task.findById(id);

    // Declaring a object
    const data = {
      type,
      activity,
      by: userId,
    };

    // Pushing the data to the activities array
    task.activities.push(data);
    await task.save();

    // Returning the response
    res.status(200).json({
      status: true,
      message: "Activity posted successfully",
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
 * @returns controller function to get the dashboard statistics
 */
export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    const allTasks = isAdmin
      ? await Task.find({
          isTrashed: false,
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $all: [userId] },
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isAdmin createdAt")
      .limit(10)
      .sort({ _id: -1 });

    //   group task by stage and calculate counts
    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    // Group tasks by priority
    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // calculate total tasks
    const totalTasks = allTasks?.length;
    const last10Task = allTasks?.slice(0, 10);

    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupTaskks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Successfully",
      ...summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

/**
 * @returns Controller function to return all the tasks
 */
export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;

    let query = { isTrashed: isTrashed ? true : false };
    if (stage) {
      query.stage = stage;
    }

    // Finding the tasks by query params
    let queryResult = Task.find(query)
      .populate({
        path: "team",
        select: "name title email",
      })
      .sort({ _id: -1 });

    const tasks = await queryResult;

    // Returning the response json for all tasks
    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

/**
 * @returns Controller function to return the specific task by id
 */
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Finding the task by id and also the activities
    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      })
      .sort({ _id: -1 });

    // Returning the task
    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

/**
 * @returns Controller function to create subtasks for the tasks with id
 */
export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;
    const { id } = req.params;

    const newSubTask = {
      title,
      date,
      tag,
    };

    // Finding the task by id and pushing the Subtasks to tasks
    const task = await Task.findById(id);
    task.subTasks.push(newSubTask);

    await task.save();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

/**
 * @returns Controller function to update task based on id
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, priority, assets } = req.body;
    const task = await Task.findById(id);
    // Updating the tasks
    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;

    await task.save();

    // Returning the response
    res.status(200).json({
      status: true,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

/**
 * @returns Controller function to trash tasks to true
 */
export const trashTask = async (req, res) => {
  try {
    // Finding the task by id
    const { id } = req.params;
    const task = await Task.findById(id);

    // Setting the value to true - trashed task
    task.isTrashed = true;

    await task.save();

    // Returning the response
    res.status(200).json({
      status: true,
      message: "Task trashed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

/**
 * @returns Controller function to Delete, restore tasks based on condition
 */
export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    // Checking the condition and performing actions based on that
    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);
      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    // Returning the response
    res.status(200).json({
      status: true,
      message: "Operation performed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
