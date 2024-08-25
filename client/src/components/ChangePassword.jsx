import React from "react";
import { Dialog, DialogTitle } from "@headlessui/react";
import { useForm } from "react-hook-form";
import Button from "./Button";
import Loader from "./Loader";
import ModalWrapper from "./ModalWrapper";
import { useChangePasswordMutation } from "../redux/slices/api/userApiSlice";
import { toast } from "react-toastify";
import Textbox from "./Textbox";

/**
 * Functional Component returns the Change Password Component
 */
const ChangePassword = ({ open, setOpen }) => {
  //Destructuring the props from the react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Destructuring the Password props
  const [changeUserPassword, { isLoading }] = useChangePasswordMutation();

  // Function to submit the password
  const handleOnSubmit = async (data) => {
    if (data?.password !== data.cpass) {
      toast.warning("Passwords doesn't match");
      return;
    }
    try {
      const res = await changeUserPassword(data).unwrap();
      toast.success("Password changed successfully");
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || error.error);
    }
  };
  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className="">
          <DialogTitle
            as="h2"
            className={"text-base font-bold leading-6 text-gray-900 mb-4"}
          >
            Change Password
          </DialogTitle>

          <div className="mt-2 flex flex-col gap-6">
            {/* New Password Text field */}
            <Textbox
              placeholder="New Password"
              type="password"
              name="password"
              label="New Password"
              className="w-full rounded"
              register={register("password", {
                required: "New Password is required",
              })}
              error={errors?.password ? errors?.password?.message : ""}
            />

            {/* Confirm Password Text field */}
            <Textbox
              placeholder="Confirm New Password"
              type="password"
              name="cpass"
              label="Confirm New Password"
              className="w-full rounded"
              register={register("cpass", {
                required: "Confirm New Password is required!",
              })}
              error={errors?.cpass ? errors?.cpass.message : ""}
            />
          </div>

          {/* Submit button to submit the form */}
          {isLoading ? (
            <div className="py-5">
              <Loader />
            </div>
          ) : (
            <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-200"
                label="Save"
              />

              <button
                type="button"
                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};
export default ChangePassword;
