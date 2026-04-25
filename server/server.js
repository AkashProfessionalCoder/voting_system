require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const start = async () => {
  const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

    if (process.env.VOTING_DEADLINE) {
      console.log(`Voting deadline: ${process.env.VOTING_DEADLINE}`);
    }

    // Connect to DB after confirming the port is free
    await connectDB();
  });

  // Catch the Address Already in Use error immediately
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n🚨 ERROR: Port ${PORT} is already in use!`);
      console.error(
        `This usually means another server process is still running in the background.`
      );
      console.error(
        `Please kill the existing process (e.g., run 'killall node' or 'lsof -i :${PORT}') and try again.\n`
      );
      process.exit(1);
    } else {
      console.error("Server error:", err);
    }
  });
};

start();
