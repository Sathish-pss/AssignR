import {
  MenuItems,
  Transition,
  Menu,
  MenuButton,
  MenuItem,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaUser, FaUserLock } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils";
import { useLogoutMutation } from "../redux/slices/api/authApiSlice";
import { toast } from "react-toastify";
import { logout } from "../redux/slices/authSlice";
import AddUser from "./AddUser";
import ChangePassword from "./ChangePassword";

const UserAvatar = () => {
  const [open, setOpen] = useState(false); // State to set the menu bar open
  const [openPassword, setOpenPassword] = useState(false); // State to open the password
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); // Dispatch hook
  const navigate = useNavigate(); // Navigate hook

  // Invoking the logout functionality here
  const [logoutUser] = useLogoutMutation();

  /**
   * Functinon to logout of the session
   */
  const logoutHandler = async () => {
    try {
      // Calling the api here
      await logoutUser().unwrap();
      // Dispatching the logout functionality here from redux
      dispatch(logout());
      // Navigating back to the login page
      navigate("/log-in");
      // Toast message
      toast.info("Logged out successfully");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="w-10 h-10 2xl:w-12 2xl:h-12 items-center justify-center rounded-full bg-blue-600">
              {/* Rendering the name with initial */}
              <span className="text-white font-semibold">
                {getInitials(user?.data?.data?.name)}
              </span>
            </MenuButton>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-gray-100 rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none">
              <div className="p-4">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => setOpen(true)}
                      className="text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-base"
                    >
                      <FaUser className="mr-2" aria-hidden="true" />
                      Profile
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => setOpenPassword(true)}
                      className={`tetx-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-base`}
                    >
                      <FaUserLock className="mr-2" aria-hidden="true" />
                      Change Password
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={logoutHandler}
                      className={`text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-base`}
                    >
                      <IoLogOutOutline className="mr-2" aria-hidden="true" />
                      Logout
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      {/* Rendering the Add User dialog here */}
      <AddUser open={open} setOpen={setOpen} userData={user?.data?.data} />

      {/* Rendering the Change Password Component here */}
      <ChangePassword open={openPassword} setOpen={setOpenPassword} />
    </>
  );
};

export default UserAvatar;
