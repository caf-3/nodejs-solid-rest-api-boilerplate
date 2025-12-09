function generateEntityContent(modelName, fields) {
    const entityName = `${modelName}Entity`;

    // Gera as propriedades públicas
    const properties = fields.map(field => {
        const modifier = field.isId ? 'public readonly' : 'public';
        const optional = field.isOptional ? ' | null' : '';
        return `    ${modifier} ${field.name}!: ${field.tsType}${optional};`;
    }).join('\n');

    // Identifica campos que devem ser omitidos do construtor (geralmente id, created_at, updated_at)
    const omitFields = fields
        .filter(f => f.isId || f.hasDefault && (f.name.includes('created') || f.name.includes('updated')))
        .map(f => `"${f.name}"`)
        .join(' | ');

    const hasOmitFields = omitFields.length > 0;
    const constructorType = hasOmitFields
        ? `Omit<I${modelName}Entity, ${omitFields}>`
        : `I${modelName}Entity`;

    // Gera parâmetros opcionais do construtor para campos com @default
    const optionalParams = fields
        .filter(f => f.isId)
        .map(f => `${f.name}?: ${f.tsType}`)
        .join(', ');

    // Lógica de inicialização do ID
    const idField = fields.find(f => f.isId);
    const idInitialization = idField && idField.hasDefault ? `
        if (!${idField.name}) {
            this.${idField.name} = uuidV4();
        }` : '';

    return `import { ${modelName} as I${modelName}Entity } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

export class ${entityName} {
${properties}

    constructor(props: ${constructorType}${optionalParams ? ', ' + optionalParams : ''}) {
        Object.assign(this, props);${idInitialization}
    }
}
`;
}

module.exports = {
    generateEntityContent
};
