const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { toPascalCase, toCamelCase } = require('./utils/stringHelpers');
const { getAvailableTypesMessage } = require('./utils/validationHelpers');
const {
    generateDTOContent,
    generateUseCaseContent,
    generateControllerContent,
    generateIndexContent,
    generateValidationContent
} = require('./utils/templateHelpers');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function collectFields() {
    const fields = [];
    console.log('\n💡 Tipos disponíveis:');
    console.log(getAvailableTypesMessage());
    console.log('\n💡 Fonte: body, param, query (padrão: body)\n');

    while (true) {
        const fieldName = await question('Nome do campo (Enter para finalizar): ');
        if (!fieldName) break;

        console.log('\n💡 Tipos: string, number, boolean, email, uuid, date, array, any');
        const fieldType = await question(`Tipo do campo "${fieldName}" (padrão: string): `) || 'string';
        const isOptional = await question(`"${fieldName}" é opcional? (s/N): `);
        const fieldSource = await question(`Fonte do campo "${fieldName}" (body/param/query, padrão: body): `) || 'body';

        fields.push({
            name: fieldName,
            type: fieldType,
            optional: isOptional.toLowerCase() === 's' || isOptional.toLowerCase() === 'sim',
            source: fieldSource
        });

        console.log(`✅ Campo "${fieldName}" adicionado!\n`);
    }

    return fields;
}

function createUseCaseFiles(useCasePath, useCaseCamel, useCasePascal, fields) {
    fs.mkdirSync(useCasePath, { recursive: true });

    const dtoContent = generateDTOContent(useCasePascal, fields);
    const useCaseContent = generateUseCaseContent(useCasePascal, useCaseCamel);
    const controllerContent = generateControllerContent(useCasePascal, useCaseCamel, fields);
    const indexContent = generateIndexContent(useCasePascal, useCaseCamel);
    const validationContent = generateValidationContent(useCaseCamel, fields);

    fs.writeFileSync(path.join(useCasePath, `${useCaseCamel}.DTO.ts`), dtoContent);
    fs.writeFileSync(path.join(useCasePath, `${useCaseCamel}.ts`), useCaseContent);
    fs.writeFileSync(path.join(useCasePath, `${useCaseCamel}.controller.ts`), controllerContent);
    fs.writeFileSync(path.join(useCasePath, 'index.ts'), indexContent);
    fs.writeFileSync(path.join(useCasePath, 'validation.ts'), validationContent);
}

function printSummary(useCasePath, useCaseCamel, fields) {
    console.log('\n✅ Use case criado com sucesso!\n');
    console.log(`📁 Localização: ${useCasePath}\n`);
    console.log('📝 Arquivos criados:');
    console.log(`   - ${useCaseCamel}.DTO.ts`);
    console.log(`   - ${useCaseCamel}.ts`);
    console.log(`   - ${useCaseCamel}.controller.ts`);
    console.log(`   - index.ts`);
    console.log(`   - validation.ts`);

    if (fields.length > 0) {
        console.log('\n📋 Campos do DTO criados:');
        fields.forEach(field => {
            const optional = field.optional ? ' (opcional)' : ' (obrigatório)';
            console.log(`   - ${field.name}: ${field.type}${optional} [${field.source}]`);
        });
    }

    console.log('\n⚠️  Não esqueça de:');
    console.log('   1. Implementar a lógica do use case');
    if (fields.length === 0) {
        console.log('   2. Configurar as validações em validation.ts');
    }
    console.log(`   ${fields.length === 0 ? '3' : '2'}. Criar/usar o repositório necessário`);
    console.log(`   ${fields.length === 0 ? '4' : '3'}. Adicionar a rota na API\n`);
}

async function main() {
    try {
        console.log('\n🚀 Gerador de Use Cases\n');

        const domain = await question('Digite o nome do domínio (padrão: base): ') || 'base';

        console.log('\n💡 Formatos aceitos:');
        console.log('   - camelCase: getUserById (recomendado)');
        console.log('   - kebab-case: get-user-by-id');
        console.log('   - snake_case: get_user_by_id\n');

        const useCaseName = await question('Digite o nome do use case: ');

        if (!useCaseName) {
            console.log('❌ Nome do use case é obrigatório!');
            rl.close();
            process.exit(1);
        }

        const version = await question('Digite a versão (padrão: v1): ') || 'v1';

        const useCasePascal = toPascalCase(useCaseName);
        const useCaseCamel = toCamelCase(useCaseName);

        const useCasePath = path.join(
            __dirname,
            '..',
            'src',
            'useCases',
            domain,
            useCaseCamel,
            version
        );

        if (fs.existsSync(useCasePath)) {
            console.log(`\n❌ O use case "${useCaseName}" já existe em "${domain}"!`);
            console.log(`   Caminho: ${useCasePath}\n`);
            rl.close();
            process.exit(1);
        }

        console.log('\n📝 Configuração do DTO (pressione Enter para pular)\n');
        const addFields = await question('Deseja adicionar campos ao DTO? (s/N): ');

        const fields = [];
        if (addFields.toLowerCase() === 's' || addFields.toLowerCase() === 'sim') {
            const collectedFields = await collectFields();
            fields.push(...collectedFields);
        }

        createUseCaseFiles(useCasePath, useCaseCamel, useCasePascal, fields);
        printSummary(useCasePath, useCaseCamel, fields);

    } catch (error) {
        console.error('❌ Erro ao criar use case:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
