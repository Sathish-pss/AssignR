import React, { useState } from "react";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import { toast } from "react-toastify";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
// Importing the mutations here
import {
  useGetTeamListQuery,
  useDeteteUserMutation,
  useUserActionMutation,
  useUpdateUserMutation,
} from "../redux/slices/api/userApiSlice";

/**
 * Functional Component returns the Users list of the Application
 */
const Users = () => {
  const [openDialog, setOpenDialog] = useState(false); // State to open the Add Users dialog open
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false); // State to open the Action dialog box open
  const [selected, setSelected] = useState(null); // State to set the edit id

  //Destructuring the users list from the redux GET Team list mutations
  const { data, error, isLoading, refetch } = useGetTeamListQuery();
  // Destructuring the delete user from DELETE User mutation
  const [deleteUser] = useDeteteUserMutation();
  // Destructuring the update user from UPDATE user mutation
  const [userAction] = useUserActionMutation();

  // Function to action handler for forms
  const userActionHandler = async () => {
    try {
      const result = await userAction({
        isActive: !selected?.isActive,
        id: selected?._id,
      });
      // Refetching the get api
      refetch();
      toast.success(result?.data?.message);
      setSelected(null);
      setTimeout(() => {
        setOpenAction(false);
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error(error.data.message || error.error);
    }
  };

  // Delete function to delete a user
  const deleteHandler = async () => {
    try {
      const result = await deleteUser(selected);
      refetch();
      toast.success(result?.data?.message);
      setSelected(null);
      setTimeout(() => {
        setOpenDialog(false);
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error(error.data.message || error.error);
    }
  };

  // Function to set the id to delete
  const deleteClick = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  // Function to set the edit id
  const editClick = (el) => {
    setSelected(el);
    setOpen(true);
  };

  // Function to click the user status
  const userStatusClick = (el) => {
    setSelected(el);
    setOpenAction(true);
  };

  // Table header
  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Title</th>
        <th className="py-2">Email</th>
        <th className="py-2">Role</th>
        <th className="py-2">Active</th>
      </tr>
    </thead>
  );

  // Table row
  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      {/* User Name With Initials */}
      <td className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
            <span className="text-xs md:text-sm text-center">
              {getInitials(user?.name)}
            </span>
          </div>
          {user.name}
        </div>
      </td>

      {/* User title */}
      <td className="p-2">{user?.title}</td>
      {/* User Email */}
      <td className="p-2">{user?.email || "user.emal.com"}</td>
      {/* User Role */}
      <td className="p-2">{user?.role}</td>

      <td>
        <button
          onClick={() => userStatusClick(user)}
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user?.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </button>
      </td>

      {/* Edit button */}
      <td className="p-2 flex gap-4 justify-end">
        <Button
          className="text-blue-600 hover:text-blue-500 font-semibold sm:px-0"
          label="Edit"
          type="button"
          onClick={() => editClick(user)}
        />

        {/* Delete button */}
        <Button
          className="text-red-700 hover:text-red-500 font-semibold sm:px-0"
          label="Delete"
          type="button"
          onClick={() => deleteClick(user?._id)}
        />
      </td>
    </tr>
  );

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          {/* Title of the page */}
          <Title title="Team Members" />

          {/* Add New user button */}
          <Button
            label="Add New User"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
            onClick={() => setOpen(true)}
          />
        </div>

        {/* Rendering the Users table here */}
        <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
          <div className="overflow-x-auto">
            <table className="w-full mb-5">
              <TableHeader />
              <tbody>
                {data?.map((user, index) => (
                  <TableRow key={index} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rendering the Add User dialog here */}
      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        key={new Date().getTime().toString()}
      />

      {/* Confirmation dialog for Delete */}
      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      {/* User Action handler dialog here */}
      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};

export default Users;
