import { PostgresUserRepository } from "../../../../repositories/implementions/PostgresUserRepository";
import { GetUserBySchoolIdUseCase } from "./getUserBySchoolId";
import { GetUserBySchoolIdController } from "./getUserBySchoolId.controller";

const userRepository = new PostgresUserRepository();
const getUserBySchoolIdUseCase = new GetUserBySchoolIdUseCase(userRepository);
const getUserBySchoolIdController = new GetUserBySchoolIdController(getUserBySchoolIdUseCase);

export { getUserBySchoolIdController };
