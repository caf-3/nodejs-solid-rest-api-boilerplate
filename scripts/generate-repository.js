const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { toPascalCase, toCamelCase } = require('./utils/stringHelpers');
const { parsePrismaSchema, getModelByName, listModelNames } = require('./utils/prismaParser');
const {
    generateRepositoryInterface,
    generateRepositoryImplementation
} = require('./utils/repositoryTemplateHelpers');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    try {
        console.log('\n📦 Gerador de Repositórios\n');

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

        // Pergunta qual entidade usar
        const entityName = await question('Digite o nome da entidade: ');

        if (!entityName) {
            console.log('❌ Nome da entidade é obrigatório!');
            rl.close();
            process.exit(1);
        }

        // Busca o model
        const model = getModelByName(models, entityName);

        if (!model) {
            console.log(`\n❌ Model "${entityName}" não encontrado no schema.prisma!`);
            console.log('\n💡 Models disponíveis:', listModelNames(models).join(', '));
            console.log('');
            rl.close();
            process.exit(1);
        }

        const pascalEntity = toPascalCase(entityName);
        const camelEntity = toCamelCase(entityName);

        // Verificar se entity existe
        const entityPath = path.join(__dirname, '..', 'src', 'entities', `${camelEntity}.entity.ts`);
        if (!fs.existsSync(entityPath)) {
            console.log(`\n⚠️  A entity "${camelEntity}.entity.ts" não existe!`);
            const createEntity = await question('Deseja criar a entity primeiro? (s/N): ');
            if (createEntity.toLowerCase() === 's' || createEntity.toLowerCase() === 'sim') {
                console.log('\n💡 Execute: npm run generate:entity\n');
                rl.close();
                process.exit(0);
            }
        }

        // Cria a interface do repositório
        const repoPath = path.join(__dirname, '..', 'src', 'repositories');
        const interfaceFileName = `I${pascalEntity}Repository.ts`;
        const interfaceFilePath = path.join(repoPath, interfaceFileName);

        if (fs.existsSync(interfaceFilePath)) {
            const overwrite = await question(`\n⚠️  Interface "${interfaceFileName}" já existe. Sobrescrever? (s/N): `);
            if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'sim') {
                console.log('\n❌ Operação cancelada.\n');
                rl.close();
                process.exit(0);
            }
        }

        const interfaceContent = generateRepositoryInterface(entityName);
        fs.writeFileSync(interfaceFilePath, interfaceContent);

        console.log(`\n✅ Interface criada: ${interfaceFileName}`);

        // Pergunta se quer criar implementação
        const createImpl = await question('\nDeseja criar a implementação? (S/n): ');

        if (createImpl.toLowerCase() !== 'n' && createImpl.toLowerCase() !== 'nao' && createImpl.toLowerCase() !== 'não') {
            const implPath = path.join(repoPath, 'implementions');
            const implFileName = `Postgres${pascalEntity}Repository.ts`;
            const implFilePath = path.join(implPath, implFileName);

            if (!fs.existsSync(implPath)) {
                fs.mkdirSync(implPath, { recursive: true });
            }

            if (fs.existsSync(implFilePath)) {
                const overwriteImpl = await question(`\n⚠️  Implementação "${implFileName}" já existe. Sobrescrever? (s/N): `);
                if (overwriteImpl.toLowerCase() !== 's' && overwriteImpl.toLowerCase() !== 'sim') {
                    console.log('\n✅ Interface criada com sucesso!\n');
                    rl.close();
                    process.exit(0);
                }
            }

            const implContent = generateRepositoryImplementation(entityName, model.name);
            fs.writeFileSync(implFilePath, implContent);

            console.log(`✅ Implementação criada: ${implFileName}\n`);
            console.log('📋 Métodos CRUD criados:');
            console.log('   - create(data): Criar novo registro');
            console.log('   - findById(id): Buscar por ID');
            console.log('   - update(id, data): Atualizar registro');
            console.log('   - delete(id): Deletar registro\n');
        } else {
            console.log('\n✅ Interface criada com sucesso!\n');
        }

    } catch (error) {
        console.error('❌ Erro ao criar repositório:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
