import express from "express";

import apiRouter from "./api.js";
import { testConnection } from "./db.js";
import config from "./utils/config.js";
import {
	clientRouter,
	configuredCors,
	configuredHelmet,
	configuredMorgan,
	httpsOnly,
	logErrors,
} from "./utils/middleware.js";

const API_ROOT = "/api";

const app = express();

app.use(express.json());
// Enable CORS - will use FRONTEND_URL if set, otherwise defaults to localhost for dev
// Also allows all .hosting.codeyourfuture.io domains
app.use(configuredCors());
app.use(configuredHelmet());
app.use(configuredMorgan());

if (config.production) {
	app.enable("trust proxy");
	app.use(httpsOnly());
}

app.get("/healthz", async (_, res) => {
	try {
		await testConnection();
		res.sendStatus(200);
	} catch (error) {
		// Database connection failed - return 503 Service Unavailable
		res.status(503).json({ status: "unhealthy", error: "Database connection failed" });
	}
});

app.use(API_ROOT, apiRouter);

app.use(clientRouter(API_ROOT));

app.use(logErrors());

export default app;
