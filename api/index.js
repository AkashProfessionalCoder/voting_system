require("dotenv").config();
const app = require("../server/app");
const connectDB = require("../server/config/db");

// Connect to database in serverless environment
connectDB();

// Export the Express app as a serverless function handler
module.exports = app;
