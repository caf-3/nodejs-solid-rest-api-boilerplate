import { Response, Request, NextFunction } from "express";
import { GetUserByIdUseCase } from "./getUserById";
import { IGetUserByIdDTO } from "./getUserById.DTO";

export class GetUserByIdController {
    constructor(private getUserByIdUseCase: GetUserByIdUseCase) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: IGetUserByIdDTO = {
                userId: req.params.userId
            };

            const response = await this.getUserByIdUseCase.execute(data);
            res.status(response.status).json(response);
        } catch (error: any) {
            next(error);
        }
    }
}
