import { apiSlice } from "../apiSlice";

// Declaring the auth url in order to avoid any repetition
const AUTH_URL = "/user";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login for Post Request => Mutation
    login: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/login`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    // Register Endpoint for registering users => Mutations
    register: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/register`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    // Logout end point for logging out of the app
    logout: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/logout`,
        method: "POST",
        credentials: "include",
      }),
    }),
  }),
});

// Exporting the Mutations and Query
export const { useLoginMutation, useRegisterMutation, useLogoutMutation } =
  authApiSlice;

// Important notes
// For QUERIES using GET Request use => builder.query
// For POST Requests use => builder.mutations
