import express, { Request, Response, NextFunction } from "express";
import { getUserBySchoolIdValidation } from "../../../useCases/users/getUserBySchoolId/v1/validation";
import { validatorError } from "../../../api/middleware/v1/validation/global.validation";
import { getUserBySchoolIdController } from "../../../useCases/users/getUserBySchoolId/v1/index";
import { jwtDecoder } from "../../middleware/v1/guard/jwt.middleware";
import { getUserByIdController } from "../../../useCases/users/getUserById/v1/index";
import { getUserByIdValidation } from "../../../useCases/users/getUserById/v1/validation";
const router = express.Router();

router.get("/:schoolId/users", getUserBySchoolIdValidation, validatorError, (req: Request, res: Response, next: NextFunction) => {
    return getUserBySchoolIdController.handle(req, res, next);
});


router.get("/:userId", jwtDecoder, getUserByIdValidation, validatorError, (req: Request, res: Response, next: NextFunction) => {
    return getUserByIdController.handle(req, res, next);
});

export default router;
