import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express, { Router } from "express";
import helmet from "helmet";
import morgan from "morgan";

import logger from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * CORS Middleware Configuration
 * Configure FRONTEND_URL environment variable for production.
 * Defaults to http://localhost:5173 for development.
 * @returns {import("express").RequestHandler}
 */
export const configuredCors = () => {
	const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
	const corsOptions = {
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			
			// Allow the configured frontend URL
			if (origin === frontendUrl) return callback(null, true);
			
			// Allow localhost for development
			if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
				return callback(null, true);
			}
			
			// Reject other origins
			callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
		allowedMethods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		allowedHeaders: "Content-Type,Authorization",
	};
	return cors(corsOptions);
};

export const clientRouter = (apiRoot) => {
	const staticDir = resolve(__dirname, "..", "static");
	const router = Router();

	// Serve static files with explicit MIME type configuration
	router.use(
		express.static(staticDir, {
			setHeaders: (res, path) => {
				// Ensure JavaScript files are served with correct MIME type
				if (path.endsWith(".js") || path.endsWith(".mjs")) {
					res.setHeader(
						"Content-Type",
						"application/javascript; charset=utf-8",
					);
				} else if (path.endsWith(".css")) {
					res.setHeader("Content-Type", "text/css; charset=utf-8");
				}
			},
		}),
	);

	// Fallback to index.html for non-API routes (SPA routing)
	router.use((req, res, next) => {
		if (req.method === "GET" && !req.url.startsWith(apiRoot)) {
			return res.sendFile(join(staticDir, "index.html"));
		}
		next();
	});
	return router;
};

export const configuredHelmet = () => helmet({ contentSecurityPolicy: false });

export const configuredMorgan = () =>
	morgan("dev", {
		skip(req) {
			return "container-healthcheck" in req.headers && isHealthcheck(req);
		},
		stream: { write: (message) => logger.info(message.trim()) },
	});

export const httpsOnly = () => (req, res, next) => {
	if (req.secure || isHealthcheck(req)) {
		return next();
	}
	res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
};

/** @type {() => import("express").ErrorRequestHandler} */
export const logErrors = () => (err, _, res, next) => {
	if (res.headersSent) {
		return next(err);
	}
	logger.error("%O", err);
	res.sendStatus(500);
};

/**
 * Whether the request is a `GET /healthz`
 * @param {import("express").Request} req
 * @returns {boolean}
 */
function isHealthcheck(req) {
	return req.path === "/healthz" && req.method === "GET";
}
