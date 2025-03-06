import { IBaseDTO } from "./BaseUseCase.DTO";

export class BaseUseCase {
    constructor() {}
    async execute(data: IBaseDTO) {
        try {
            console.log(data);
            return { message: "sucesso", status: 200 };
        } catch (error: any) {
            throw new Error(error);
        }
    }
}
