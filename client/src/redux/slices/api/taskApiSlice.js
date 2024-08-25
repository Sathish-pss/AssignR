import { apiSlice } from "../apiSlice";

// Declaring the task route here
const TASK_URL = "/task";

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Method to get the dashboard Statistics
    getDashboardStats: builder.query({
      query: () => ({
        url: `${TASK_URL}/dashboard`,
        method: "GET",
        credentials: "include",
      }),
    }),

    // Method to fetch all the tasks
    getAllTask: builder.query({
      query: ({ strQuery, isTrashed, search }) => ({
        url: `${TASK_URL}?stage${strQuery}&isTrashed=${isTrashed}&search=${search}`,
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

// Exporting the methods
export const { useGetDashboardStatsQuery, useGetAllTaskQuery } = taskApiSlice;
