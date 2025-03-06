import { body } from "express-validator";

export const baseValidation = [body("base", "base essage.")];
