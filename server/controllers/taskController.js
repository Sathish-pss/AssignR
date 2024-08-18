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
