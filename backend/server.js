import { connectDb } from "./db.js";
import config from "./utils/config.js";
import logger from "./utils/logger.js";

const { port } = config.init();

// Try to connect to database, but don't crash if it fails
// The health check will report the status
try {
	await connectDb();
} catch (error) {
	logger.error("Failed to connect to database on startup: %O", error);
	logger.warn("Server will start, but database operations will fail until connection is established");
}

const { default: app } = await import("./app.js");

app.listen(port, (err) => {
	if (err) {
		throw err;
	}
	logger.info(`listening on ${port}`);
});
