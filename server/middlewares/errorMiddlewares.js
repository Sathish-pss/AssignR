/**
 * Middleware error funciton to handle route not found errors
 */
const routeNotFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware error handler function
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === "CaseError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  req.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV !== "production" ? null : err.stack,
  });
};

export { routeNotFound, errorHandler };
