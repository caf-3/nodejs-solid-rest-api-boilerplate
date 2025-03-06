import { Response, Request, NextFunction } from "express";
import { BaseUseCase } from "./BaseUseCase";
import { IBaseDTO } from "./BaseUseCase.DTO";

export class BaseController {
    constructor(private baseUseCase: BaseUseCase) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { base } = req.body;
            const data: IBaseDTO = { base };
            const response = await this.baseUseCase.execute(data);
            res.status(response.status).json(response);
            // No return statement here
        } catch (error: any) {
            next(error);
        }
    }
}
