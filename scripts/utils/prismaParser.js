const fs = require('fs');
const path = require('path');

function parsePrismaSchema(schemaPath) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const models = [];

    // Regex para capturar models do Prisma
    const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
        const modelName = match[1];
        const modelContent = match[2];

        const fields = parseModelFields(modelContent);

        models.push({
            name: modelName,
            fields: fields
        });
    }

    return models;
}

function parseModelFields(content) {
    const fields = [];
    const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('@@'));

    for (const line of lines) {
        const trimmed = line.trim();

        // Ignora comentários e linhas vazias
        if (!trimmed || trimmed.startsWith('//')) continue;

        // Regex para campo: nome tipo modificadores
        const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(\[\])?([\?\!])?(.*)$/);

        if (fieldMatch) {
            const [, name, type, isArray, modifier, rest] = fieldMatch;

            // Detecta se é @id, @default, etc
            const isId = rest.includes('@id');
            const hasDefault = rest.includes('@default');
            const isUnique = rest.includes('@unique');
            const isOptional = modifier === '?';

            // Converte tipos do Prisma para TypeScript
            const tsType = convertPrismaTypeToTS(type, isArray === '[]');

            fields.push({
                name,
                prismaType: type,
                tsType,
                isOptional,
                isRequired: !isOptional && modifier === '!',
                isArray: isArray === '[]',
                isId,
                hasDefault,
                isUnique
            });
        }
    }

    return fields;
}

function convertPrismaTypeToTS(prismaType, isArray = false) {
    const typeMap = {
        'String': 'string',
        'Int': 'number',
        'Float': 'number',
        'Boolean': 'boolean',
        'DateTime': 'Date',
        'Json': 'any',
        'Bytes': 'Buffer'
    };

    const baseType = typeMap[prismaType] || 'any';
    return isArray ? `${baseType}[]` : baseType;
}

function getModelByName(models, modelName) {
    return models.find(model =>
        model.name.toLowerCase() === modelName.toLowerCase()
    );
}

function listModelNames(models) {
    return models.map(m => m.name);
}

module.exports = {
    parsePrismaSchema,
    getModelByName,
    listModelNames
};
