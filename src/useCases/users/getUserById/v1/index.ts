// TODO: Importe e instancie o repositório necessário
import { GetUserByIdUseCase } from "./getUserById";
import { GetUserByIdController } from "./getUserById.controller";

const getUserByIdUseCase = new GetUserByIdUseCase();
const getUserByIdController = new GetUserByIdController(getUserByIdUseCase);

export { getUserByIdController };
