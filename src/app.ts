/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response, NextFunction } from "express";
import dotEnv from "dotenv";
import cors from "cors";
const app = express();
import v1BaseRoutes from "./api/routes/v1/base.router";
import morgan from "morgan";
import cron from "node-cron";
// import BaseJobHander from "./jobs/base/baseFunc";

import events from "events";
import bodyParser from "body-parser";
import { Error } from "./interfaces/custom.interfaces";
export const appEventEmitter = new events.EventEmitter();
dotEnv.config();
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use(cors());
app.use(bodyParser.json({ limit: '990mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '990mb' }));


// V1 ROUTES
app.use("/api/v1/base", v1BaseRoutes);



app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.statusCode || 500;
    let message = error.message || "Uncaught error";

    if (error.message?.includes("PrismaClient")) {
        message = "Validation error";
    }

    console.log({ message: error.message, status });
    res.status(status).json({
        message: message,
        status,
    });
});

// JOBS
// cron.schedule(
//     "0 */12 * * *",
//     () => {
//         BaseJobHander();
//     },
//     {
//         timezone: "Africa/Maputo",
//     },
// );

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT::" + process.env.PORT);
});
