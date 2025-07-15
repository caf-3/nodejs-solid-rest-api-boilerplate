import { PostgresBaseRepository } from "../../../../repositories/implementions/PostgreStudentSubscriptionRepository";
import { GetBaseByIdUseCase } from "./getBaseById";
import { GetBaseByIdController } from "./getBaseById.controller";

const postgresBaseRepository = new PostgresBaseRepository();
const etBaseByIdUseCase = new GetBaseByIdUseCase(postgresBaseRepository);
const baseController = new GetBaseByIdController(etBaseByIdUseCase);

export { baseController };
