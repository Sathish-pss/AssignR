// Importing the create api from the redux toolkit
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const API_URI = "http://localhost:8800/api";
const API_URI = import.meta.env.VITE_APP_BASE_URL;

// Fetching the base query
const baseQuery = fetchBaseQuery({ baseUrl: API_URI + "/api" });

/**
 * @returns API Slice function to build api endpoins
 */
export const apiSlice = createApi({
  baseQuery,
  tagTypes: [],
  endpoints: (builder) => ({}),
});
