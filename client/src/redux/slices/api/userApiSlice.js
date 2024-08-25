import { apiSlice } from "../apiSlice";

// Setting the base url for the User routes endpoints
const USER_URL = "/user";

/**
 * Redux component to inject endpoints in to the user api slices
 */
export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Method to update the user details
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/profile`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    // Method to get the user details
    getTeamList: builder.query({
      query: () => ({
        url: `${USER_URL}/get-team`,
        method: "GET",
        credentials: "include",
      }),
    }),

    // Method to delete user based on Id
    deteteUser: builder.mutation({
      query: (id) => ({
        url: `${USER_URL}/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    // User Action method
    userAction: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/${data?.id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    // Method to get the user notifications
    getNotifications: builder.query({
      query: () => ({
        url: `${USER_URL}/notifications`,
        method: "GET",
        credentials: "include",
      }),
    }),

    // Method to Read all the notifications
    markNotiasRead: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/read-noti?isReadType=${data?.type}&id={data?.id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    // Method to change the user password
    changePassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/change-password`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
  }),
});

// Exporting the methods
export const {
  useUpdateUserMutation,
  useGetTeamListQuery,
  useDeteteUserMutation,
  useUserActionMutation,
  useGetNotificationsQuery,
  useMarkNotiasReadMutation,
  useChangePasswordMutation,
} = userApiSlice;
