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
  }),
});

// Exporting the methods 
export const { useUpdateUserMutation, useGetTeamListQuery } = userApiSlice;
