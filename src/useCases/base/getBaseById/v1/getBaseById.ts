import { IBaseRepository } from "../../../../repositories/IBaseRepository";
import { IGetBaseByIdDTO } from "./getBaseById.DTO";

export class GetBaseByIdUseCase {
    constructor(private baseRepository: IBaseRepository) {}
    async execute(data: IGetBaseByIdDTO) {
        try {
            const base = await this.baseRepository.getBaseActionById(data.id);
            return { message: "sucesso", status: 200, data: base };
        } catch (error: any) {
            throw new Error(error);
        }
    }
}
