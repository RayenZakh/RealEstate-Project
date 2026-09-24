// Middleware for handling requests to routes that do not exist (404)
const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Centralized error-handling middleware.
// Must accept 4 arguments (err, req, res, next) so Express recognizes it as an error handler.
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    // Handle invalid Mongoose ObjectId (CastError)
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = `Invalid ID format for resource: ${err.value}`;
    }

    // Handle Mongoose schema validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    // Handle MongoDB duplicate key errors (code 11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `An account with this ${field} already exists`;
    }

    res.status(statusCode).json({
        message,
        // Include stack trace only in development to prevent leaking internal paths in production
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

module.exports = { notFound, errorHandler };
