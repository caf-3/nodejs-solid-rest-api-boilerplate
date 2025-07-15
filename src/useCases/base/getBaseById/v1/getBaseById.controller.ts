import { Response, Request, NextFunction } from "express";
import { GetBaseByIdUseCase } from "./getBaseById";
import { IGetBaseByIdDTO } from "./getBaseById.DTO";

export class GetBaseByIdController {
    constructor(private getBaseByIdUseCase: GetBaseByIdUseCase) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data: IGetBaseByIdDTO = { id };
            const response = await this.getBaseByIdUseCase.execute(data);
            res.status(response.status).json(response);
            // No return statement here
        } catch (error: any) {
            next(error);
        }
    }
}
