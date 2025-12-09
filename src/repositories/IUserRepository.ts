import { UserEntity } from "../entities/user.entity";

export interface IUserRepository {
    create(data: Omit<UserEntity, "id" | "created_at" | "updated_at">): Promise<UserEntity>;
    findById(id: string): Promise<UserEntity | null>;
    update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null>;
    delete(id: string): Promise<boolean>;
}
