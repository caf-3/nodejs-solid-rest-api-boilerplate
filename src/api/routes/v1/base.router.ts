import express, { Request, Response, NextFunction } from "express";
import { baseValidation } from "../../middleware/v1/validation/useCases/base/v1/index.validation";
import { validatorError } from "../../../api/middleware/v1/validation/global.validation";
import { baseController } from "../../../useCases/base/v1";
import { basicAuth } from "../../middleware/v1/guard/basic.mdiddleware";
const router = express.Router();

router.get("/base", basicAuth, baseValidation, validatorError, (req: Request, res: Response, next: NextFunction) => {
    return baseController.handle(req, res, next);
});

export default router;
