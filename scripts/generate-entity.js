const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { parsePrismaSchema, getModelByName, listModelNames } = require('./utils/prismaParser');
const { generateEntityContent } = require('./utils/entityTemplateHelpers');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    try {
        console.log('\n🏗️  Gerador de Entities\n');

        // Caminho para o schema.prisma
        const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

        if (!fs.existsSync(schemaPath)) {
            console.log('❌ Arquivo schema.prisma não encontrado!');
            console.log(`   Esperado em: ${schemaPath}\n`);
            rl.close();
            process.exit(1);
        }

        // Parse do schema
        console.log('📖 Lendo schema.prisma...\n');
        const models = parsePrismaSchema(schemaPath);

        if (models.length === 0) {
            console.log('❌ Nenhum model encontrado no schema.prisma!\n');
            rl.close();
            process.exit(1);
        }

        // Lista os models disponíveis
        console.log('📋 Models disponíveis:');
        listModelNames(models).forEach(name => {
            console.log(`   - ${name}`);
        });
        console.log('');

        // Pergunta qual model usar
        const tableName = await question('Digite o nome da tabela/model: ');

        if (!tableName) {
            console.log('❌ Nome da tabela é obrigatório!');
            rl.close();
            process.exit(1);
        }

        // Busca o model
        const model = getModelByName(models, tableName);

        if (!model) {
            console.log(`\n❌ Model "${tableName}" não encontrado no schema.prisma!`);
            console.log('\n💡 Models disponíveis:', listModelNames(models).join(', '));
            console.log('');
            rl.close();
            process.exit(1);
        }

        // Caminho da entity
        const entityPath = path.join(__dirname, '..', 'src', 'entities');
        const entityFileName = `${model.name.toLowerCase()}.entity.ts`;
        const entityFilePath = path.join(entityPath, entityFileName);

        // Verifica se já existe
        if (fs.existsSync(entityFilePath)) {
            const overwrite = await question(`\n⚠️  Entity "${entityFileName}" já existe. Sobrescrever? (s/N): `);
            if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'sim') {
                console.log('\n❌ Operação cancelada.\n');
                rl.close();
                process.exit(0);
            }
        }

        // Gera o conteúdo da entity
        const entityContent = generateEntityContent(model.name, model.fields);

        // Cria o diretório se não existir
        if (!fs.existsSync(entityPath)) {
            fs.mkdirSync(entityPath, { recursive: true });
        }

        // Escreve o arquivo
        fs.writeFileSync(entityFilePath, entityContent);

        console.log('\n✅ Entity criada com sucesso!\n');
        console.log(`📁 Localização: ${entityFilePath}\n`);
        console.log('📋 Campos criados:');
        model.fields.forEach(field => {
            const badges = [];
            if (field.isId) badges.push('ID');
            if (field.isUnique) badges.push('UNIQUE');
            if (field.hasDefault) badges.push('DEFAULT');
            const badgeStr = badges.length > 0 ? ` [${badges.join(', ')}]` : '';
            const optional = field.isOptional ? ' (opcional)' : '';
            console.log(`   - ${field.name}: ${field.tsType}${optional}${badgeStr}`);
        });
        console.log('');

    } catch (error) {
        console.error('❌ Erro ao criar entity:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
