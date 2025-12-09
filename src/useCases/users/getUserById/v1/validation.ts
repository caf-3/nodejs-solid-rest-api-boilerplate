import { param } from "express-validator";

export const getUserByIdValidation = [
    param("userId").isString().withMessage("userId deve ser uma string").notEmpty().withMessage("userId é obrigatório")
];
