import { IGetUserBySchoolIdDTO } from "./getUserBySchoolId.DTO";
import { IUserRepository } from "../../../../repositories/IUserRepository";

export class GetUserBySchoolIdUseCase {
    constructor(private userRepository: IUserRepository) {}

    async execute(data: IGetUserBySchoolIdDTO) {
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
