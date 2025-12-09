const { getValidatorForType } = require('./validationHelpers');

function generateDTOContent(useCasePascal, fields) {
    let dtoFields = '';
    if (fields.length > 0) {
        dtoFields = fields.map(field => {
            const tsType = field.type === 'email' ? 'string' :
                          field.type === 'uuid' ? 'string' :
                          field.type === 'date' ? 'Date' :
                          field.type;
            const optional = field.optional ? '?' : '';
            return `    ${field.name}${optional}: ${tsType};`;
        }).join('\n');
    } else {
        dtoFields = '    // TODO: Adicione os campos necessários\n    id?: string;';
    }

    return `export interface I${useCasePascal}DTO {
${dtoFields}
}
`;
}

function generateUseCaseContent(useCasePascal, useCaseCamel) {
    return `import { I${useCasePascal}DTO } from "./${useCaseCamel}.DTO";

export class ${useCasePascal}UseCase {
    // TODO: Injete as dependências necessárias (repositories, services, etc)
    constructor() {}

    async execute(data: I${useCasePascal}DTO) {
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
`;
}

function generateControllerContent(useCasePascal, useCaseCamel, fields) {
    let controllerDataExtraction = '';
    if (fields.length > 0) {
        const dataFields = fields.map(field => {
            const source = field.source === 'param' ? 'params' :
                          field.source === 'query' ? 'query' :
                          'body';
            return `                ${field.name}: req.${source}.${field.name}`;
        }).join(',\n');
        controllerDataExtraction = `const data: I${useCasePascal}DTO = {
${dataFields}
            };`;
    } else {
        controllerDataExtraction = `// TODO: Extraia os dados necessários de req.body, req.params ou req.query
            const data: I${useCasePascal}DTO = {
                // Exemplo: id: req.params.id
            };`;
    }

    return `import { Response, Request, NextFunction } from "express";
import { ${useCasePascal}UseCase } from "./${useCaseCamel}";
import { I${useCasePascal}DTO } from "./${useCaseCamel}.DTO";

export class ${useCasePascal}Controller {
    constructor(private ${useCaseCamel}UseCase: ${useCasePascal}UseCase) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            ${controllerDataExtraction}

            const response = await this.${useCaseCamel}UseCase.execute(data);
            res.status(response.status).json(response);
        } catch (error: any) {
            next(error);
        }
    }
}
`;
}

function generateIndexContent(useCasePascal, useCaseCamel) {
    return `// TODO: Importe e instancie o repositório necessário
import { ${useCasePascal}UseCase } from "./${useCaseCamel}";
import { ${useCasePascal}Controller } from "./${useCaseCamel}.controller";

const ${useCaseCamel}UseCase = new ${useCasePascal}UseCase();
const ${useCaseCamel}Controller = new ${useCasePascal}Controller(${useCaseCamel}UseCase);

export { ${useCaseCamel}Controller };
`;
}

function generateValidationContent(useCaseCamel, fields) {
    let validationRules = '';
    const importedValidators = new Set();

    if (fields.length > 0) {
        validationRules = fields.map(field => {
            const validator = getValidatorForType(field.name, field.type, field.optional, field.source);
            importedValidators.add(field.source === 'param' ? 'param' : field.source === 'query' ? 'query' : 'body');
            return `    ${validator}`;
        }).join(',\n');
    } else {
        validationRules = `    // TODO: Configure as validações necessárias
    // Exemplo de validação de body:
    // body("email", "Email inválido").isEmail(),
    // body("name", "Nome é obrigatório").notEmpty(),

    // Exemplo de validação de params:
    // param("id", "ID inválido").isUUID(),

    // Exemplo de validação de query:
    // query("page", "Página deve ser um número").optional().isInt()`;
        importedValidators.add('body');
        importedValidators.add('param');
        importedValidators.add('query');
    }

    const importValidators = Array.from(importedValidators).join(', ');

    return `import { ${importValidators} } from "express-validator";

export const ${useCaseCamel}Validation = [
${validationRules}
];
`;
}

module.exports = {
    generateDTOContent,
    generateUseCaseContent,
    generateControllerContent,
    generateIndexContent,
    generateValidationContent
};
