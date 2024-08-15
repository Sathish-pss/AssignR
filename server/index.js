import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middlewares/errorMiddlewares.js";
import routes from "./routes/index.js";
import { dbConnection } from "./utils/index.js";

// Configuring the dotenv file
dotenv.config();

// Executing the database here
dbConnection();

// Defining the port here
const PORT = process.env.PORT || 5000;

// Declaring the app here
const app = express();

// Configuring the cors here for server requests
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middle wares for our app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// API routes handler for the app
app.use("/api", routes);

// Middleware functions for router handlers
app.use(routeNotFound);
app.use(errorHandler);

// Configuring the app and listening to the server
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
