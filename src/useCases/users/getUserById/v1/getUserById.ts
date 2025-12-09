import { IGetUserByIdDTO } from "./getUserById.DTO";

export class GetUserByIdUseCase {
    // TODO: Injete as dependências necessárias (repositories, services, etc)
    constructor() {}

    async execute(data: IGetUserByIdDTO) {
        try {
            // TODO: Implemente a lógica do use case

            return {
                message: "sucesso",
                status: 200,
                data: {}
            };
        } catch (error: any) {
            throw new Error(error);
        }
    }
}
