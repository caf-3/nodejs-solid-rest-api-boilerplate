import { param, query } from "express-validator";

export const getUserBySchoolIdValidation = [
    param("schoolId").isString().withMessage("schoolId deve ser uma string").notEmpty().withMessage("schoolId é obrigatório"),
    query("isDeleted").optional()
];
