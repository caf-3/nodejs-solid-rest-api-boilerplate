import { BaseEntity } from "../entities/base.entity";

export interface IBaseRepository {
    getBaseActionById(id: string): Promise<BaseEntity | null>;
}
