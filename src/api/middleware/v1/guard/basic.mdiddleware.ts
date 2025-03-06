import { NextFunction, Request, Response } from "express";

export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const statusCode = 401;
        const authHeaders = req.headers.authorization;

        if (!authHeaders) {
            res.status(statusCode).send({ error: true, status: statusCode, message: "Not allowed", data: [] });
            return; // Return without a value after sending response
        }

        const parts = Buffer.from(authHeaders.split(" ")[1], "base64").toString().split(":");
        const username = parts[0];
        const password = parts[1];
        
        if (username == process.env.BASIC_AUTH_USERNAME && password == process.env.BASIC_AUTH_PASSWORD) {
            next();
        } else {
            res.status(statusCode).send({ error: true, status: statusCode, message: "Not allowed", data: [] });
            // No return statement with a value
        }
    } catch (error: any) {
        next(error); // Pass errors to Express error handler
    }
};