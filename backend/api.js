import { Router } from "express";

import authRouter from "./auth/authRouter.js";
import questionRouter from "./questions/questionRouter.js";

const api = Router();

api.use("/questions", questionRouter);
api.use("/auth", authRouter);

export default api;
