import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

export const validatorError = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            type: "error",
            message: "Houve um erro",
            errors: errors.array(),
        });
        return; // Return without a value after sending response
    }
    next();
};