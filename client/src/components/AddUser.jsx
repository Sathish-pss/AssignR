import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { DialogTitle } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";

/**
 *
 * @param {} param0
 * @returns Functional Component returns the Add Users Dialog Box
 */
const AddUser = ({ open, setOpen, userData }) => {
  let defaultValues = userData ?? {};

  // Destructuring the user details from the redux
  const { user } = useSelector((state) => state.auth);

  // Setting loading states
  const isLoading = false,
    isUpdating = false;

  // React hook form props here
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  /**
   * Function to submit the user details
   */
  const handleOnSubmit = () => {};

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className="">
          <DialogTitle
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4"
          >
            {userData ? "UPDATE PROFILE" : "ADD NEW USER"}
          </DialogTitle>
          <div className="mt-2 flex flex-col gap-6">
            {/* Name text box */}
            <Textbox
              placeholder="Full name"
              type="text"
              name="name"
              label="Full Name"
              className="w-full rounded"
              register={register("name", {
                required: "Full name is required!",
              })}
              error={errors.name ? errors.name.message : ""}
            />
            {/* Title text field */}
            <Textbox
              placeholder="Title"
              type="text"
              name="title"
              label="Title"
              className="w-full rounded"
              register={register("title", {
                required: "Title is required!",
              })}
              error={errors.title ? errors.title.message : ""}
            />
            {/* Email text field */}
            <Textbox
              placeholder="Email Address"
              type="email"
              name="email"
              label="Email Address"
              className="w-full rounded"
              register={register("email", {
                required: "Email Address is required!",
              })}
              error={errors.email ? errors.email.message : ""}
            />

            {/* Role Field */}
            <Textbox
              placeholder="Role"
              type="text"
              name="role"
              label="Role"
              className="w-full rounded"
              register={register("role", {
                required: "User role is required!",
              })}
              error={errors.role ? errors.role.message : ""}
            />
          </div>

          {isLoading || isUpdating ? (
            <div className="py-5">
              <Loading />
            </div>
          ) : (
            <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
              {/* Button to submit the dialog  */}
              <Button
                type="submit"
                className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto"
                label="Submit"
              />

              <Button
                type="button"
                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Cancel"
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;
