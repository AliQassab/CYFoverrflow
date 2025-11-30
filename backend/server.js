import { connectDb } from "./db.js";
import config from "./utils/config.js";
import logger from "./utils/logger.js";

try {
  const { port } = config.init();

  // Try to connect to database, but don't crash if it fails
  try {
    await connectDb();
  } catch (error) {
    logger.error("Failed to connect to database on startup: %O", error);
    logger.warn(
      "Server will start, but database operations will fail until connection is established"
    );
  }

  const { default: app } = await import("./app.js");

  // Listen on 0.0.0.0 to accept connections from outside the container
  const server = app.listen(port, "0.0.0.0", () => {
    logger.info(`listening on 0.0.0.0:${port}`);
  });

  server.on("error", (err) => {
    logger.error("Server error: %O", err);
    process.exit(1);
  });
} catch (error) {
  console.error("Fatal error during server startup:", error);
  process.exit(1);
}
