import { PrismaClient } from "@prisma/client";
import { IBaseRepository } from "../IBaseRepository";
import { BaseEntity } from "../../entities/base.entity";
const prisma = new PrismaClient();

export class PostgresBaseRepository implements IBaseRepository {
    async getBaseActionById(id: string): Promise<BaseEntity | null> {
        try {
            return await prisma.base.findFirst({ where: { id } });
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }
}
