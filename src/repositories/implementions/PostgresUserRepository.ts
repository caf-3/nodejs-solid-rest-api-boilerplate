import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../IUserRepository";
import { UserEntity } from "../../entities/user.entity";

const prisma = new PrismaClient();

export class PostgresUserRepository implements IUserRepository {
    async create(data: Omit<UserEntity, "id" | "created_at" | "updated_at">): Promise<UserEntity> {
        try {
            return await prisma.user.create({ data });
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }

    async findById(id: string): Promise<UserEntity | null> {
        try {
            return await prisma.user.findUnique({ where: { id } });
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }

    async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
        try {
            return await prisma.user.update({
                where: { id },
                data
            });
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await prisma.user.delete({ where: { id } });
            return true;
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }
}
