import { Response, Request, NextFunction } from "express";
import { GetUserBySchoolIdUseCase } from "./getUserBySchoolId";
import { IGetUserBySchoolIdDTO } from "./getUserBySchoolId.DTO";

export class GetUserBySchoolIdController {
    constructor(private getUserBySchoolIdUseCase: GetUserBySchoolIdUseCase) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: IGetUserBySchoolIdDTO = {
                schoolId: req.params.schoolId,
                isDeleted: req.query.isDeleted
            };

            const response = await this.getUserBySchoolIdUseCase.execute(data);
            res.status(response.status).json(response);
        } catch (error: any) {
            next(error);
        }
    }
}
