const { toPascalCase, toCamelCase } = require('./stringHelpers');

function generateRepositoryInterface(entityName) {
    const pascalEntity = toPascalCase(entityName);
    const camelEntity = toCamelCase(entityName);

    return `import { ${pascalEntity}Entity } from "../entities/${camelEntity}.entity";

export interface I${pascalEntity}Repository {
    create(data: Omit<${pascalEntity}Entity, "id" | "created_at" | "updated_at">): Promise<${pascalEntity}Entity>;
    findById(id: string): Promise<${pascalEntity}Entity | null>;
    update(id: string, data: Partial<${pascalEntity}Entity>): Promise<${pascalEntity}Entity | null>;
    delete(id: string): Promise<boolean>;
}
`;
}

function generateRepositoryImplementation(entityName, tableName) {
    const pascalEntity = toPascalCase(entityName);
    const camelEntity = toCamelCase(entityName);
    const camelTable = toCamelCase(tableName);

    return `import { PrismaClient } from "@prisma/client";
import { I${pascalEntity}Repository } from "../I${pascalEntity}Repository";
import { ${pascalEntity}Entity } from "../../entities/${camelEntity}.entity";

const prisma = new PrismaClient();

export class Postgres${pascalEntity}Repository implements I${pascalEntity}Repository {
    async create(data: Omit<${pascalEntity}Entity, "id" | "created_at" | "updated_at">): Promise<${pascalEntity}Entity> {
        try {
            return await prisma.${camelTable}.create({ data });
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }

    async findById(id: string): Promise<${pascalEntity}Entity | null> {
        try {
            return await prisma.${camelTable}.findUnique({ where: { id } });
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }

    async update(id: string, data: Partial<${pascalEntity}Entity>): Promise<${pascalEntity}Entity | null> {
        try {
            return await prisma.${camelTable}.update({
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
            await prisma.${camelTable}.delete({ where: { id } });
            return true;
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }
}
`;
}

module.exports = {
    generateRepositoryInterface,
    generateRepositoryImplementation
};
