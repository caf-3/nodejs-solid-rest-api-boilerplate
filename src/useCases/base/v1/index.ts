import { BaseUseCase } from "./BaseUseCase";
import { BaseController } from "./BaseUserCase.controller";

const baseUseCase = new BaseUseCase();
const baseController = new BaseController(baseUseCase);

export { baseController, baseUseCase };
