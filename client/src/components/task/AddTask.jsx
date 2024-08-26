import React, { useEffect, useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog, DialogTitle } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import { dateFormatter } from "../../utils";
import { toast } from "react-toastify";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
// Importing the functions from firebase to store the assets
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../utils/firebase";
import { useGetTeamListQuery } from "../../redux/slices/api/userApiSlice";

// Declaring the constants
const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

// Array contains the uploaded file urls
const uploadedFileURLs = [];

/**
 *
 * @param {*} param0
 * @returns Functional component to open the Add Task dialog
 */
const AddTask = ({ open, setOpen, task }) => {
  const { data: teamListData, refetch } = useGetTeamListQuery();
  // Decalring the default values for the task form
  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    team: [],
    stage: "",
    priority: "",
    assets: [],
  };
  // Destructuring the use hook from props
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });
  const [team, setTeam] = useState(teamListData); // State to set the team data
  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]); // State to set the stage
  const [priority, setPriority] = useState(
    task?.priority?.toUpperCase() || PRIORIRY[2]
  ); // State to set the priority
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  // UseEffect to fetch the team data
  useEffect(() => {
    refetch();
  }, [team]);

  // Destructuring the task api functions from the redux task slices
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // If the task object contains the assets , pushing to the array
  const URLs = task?.assets ? [...task.assets] : [];

  // Submit handler for Creating the task and Updating the task in a single function
  const submitHandler = async (data) => {
    // For uploading the file in the Firebase storage bucket
    for (const file of assets) {
      setUploading(true);
      try {
        await uploadFile(file);
      } catch (error) {
        console.error("Error uploading file:", error?.message);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Method to create task and upload task
    try {
      const newData = {
        ...data,
        assets: [...URLs, ...uploadedFileURLs],
        team,
        stage,
        priority,
      };
      // If the task id is present, update it else create it
      const res = task?._id
        ? await updateTask({
            ...newData,
            _id: task?._id,
          }).unwrap()
        : await createTask(newData).unwrap();

      // Toatify the message
      toast.success(res?.message);

      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error(err?.data?.message || err.error);
    }
  };

  // Function to upload the task imagses
  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  /**
   * Function to store the assets in the firebase storage bucket
   */
  const uploadFile = async (file) => {
    const storage = getStorage(app);
    const name = new Date().getTime() + file.name;
    const storageRef = ref(storage, name);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log("Uploading");
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              uploadedFileURLs.push(downloadURL);
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
    });
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogTitle
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4"
          >
            {task ? "UPDATE TASK" : "ADD TASK"}
          </DialogTitle>

          {/* Title text box  */}
          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder="Task Title"
              type="text"
              name="title"
              label="Task Title"
              className="w-full rounded"
              register={register("title", { required: "Title is required" })}
              error={errors.title ? errors.title.message : ""}
            />

            {/* Rendering the user list component here */}
            <UserList setTeam={setTeam} team={team} />

            {/* Rendering the Select list component here */}
            <div className="flex gap-4">
              <SelectList
                label="Task Stage"
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
              />

              {/* Date text field */}
              <div className="w-full">
                <Textbox
                  placeholder="Date"
                  type="date"
                  name="date"
                  label="Task Date"
                  className="w-full rounded"
                  register={register("date", {
                    required: "Date is required!",
                  })}
                  error={errors.date ? errors.date.message : ""}
                />
              </div>
            </div>

            {/* Component for Selecting priority */}
            <div className="flex gap-4">
              <SelectList
                label="Priority Level"
                lists={PRIORIRY}
                selected={priority}
                setSelected={setPriority}
              />

              {/* File upload component to upload the assets    */}
              <div className="w-full flex items-center justify-center mt-4">
                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
                  htmlFor="imgUpload"
                >
                  <input
                    type="file"
                    className="hidden"
                    id="imgUpload"
                    onChange={(e) => handleSelect(e)}
                    accept=".jpg, .png, .jpeg"
                    multiple={true}
                  />
                  <BiImages />
                  <span>Add Assets</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
              {uploading ? (
                <span className="text-sm py-2 text-red-500">
                  Uploading assets
                </span>
              ) : (
                <Button
                  label="Submit"
                  type="submit"
                  className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto"
                />
              )}

              {/* Button to close the dialog */}
              <Button
                type="button"
                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Cancel"
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;
