const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { toPascalCase, toCamelCase } = require('./utils/stringHelpers');
const {
    findAllUseCases,
    findAllRepositories,
    parseUseCaseFile,
    parseIndexFile
} = require('./utils/useCaseHelpers');
const {
    injectRepositoryIntoUseCase,
    injectRepositoryIntoIndex
} = require('./utils/injectDependencyHelpers');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    try {
        console.log('\n💉 Injetor de Dependências\n');

        const baseDir = path.join(__dirname, '..');

        // Lista use cases
        console.log('📋 Buscando use cases...\n');
        const useCases = findAllUseCases(baseDir);

        if (useCases.length === 0) {
            console.log('❌ Nenhum use case encontrado!\n');
            rl.close();
            process.exit(1);
        }

        console.log('📦 Use cases disponíveis:');
        useCases.forEach((uc, index) => {
            console.log(`   ${index + 1}. ${uc.displayName}`);
        });
        console.log('');

        // Seleciona use case
        const useCaseIndex = await question('Digite o número do use case: ');
        const selectedUseCase = useCases[parseInt(useCaseIndex) - 1];

        if (!selectedUseCase) {
            console.log('❌ Use case inválido!\n');
            rl.close();
            process.exit(1);
        }

        console.log(`\n✅ Use case selecionado: ${selectedUseCase.displayName}\n`);

        // Lista repositories
        console.log('📋 Buscando repositórios...\n');
        const repositories = findAllRepositories(baseDir);

        if (repositories.length === 0) {
            console.log('❌ Nenhum repositório encontrado!');
            console.log('💡 Execute: npm run generate:repository\n');
            rl.close();
            process.exit(1);
        }

        console.log('📦 Repositórios disponíveis:');
        repositories.forEach((repo, index) => {
            const status = repo.implementation ? '✅' : '⚠️ (sem implementação)';
            console.log(`   ${index + 1}. ${repo.interface} ${status}`);
        });
        console.log('');

        // Seleciona repository
        const repoIndex = await question('Digite o número do repositório: ');
        const selectedRepo = repositories[parseInt(repoIndex) - 1];

        if (!selectedRepo) {
            console.log('❌ Repositório inválido!\n');
            rl.close();
            process.exit(1);
        }

        if (!selectedRepo.implementation) {
            console.log(`\n❌ O repositório "${selectedRepo.interface}" não tem implementação!`);
            console.log('💡 Execute: npm run generate:repository\n');
            rl.close();
            process.exit(1);
        }

        console.log(`\n✅ Repositório selecionado: ${selectedRepo.interface}\n`);

        // Encontra o arquivo do use case principal
        const useCaseFiles = fs.readdirSync(selectedUseCase.path)
            .filter(f => f.endsWith('.ts') && !f.includes('controller') && !f.includes('DTO') && f !== 'index.ts' && f !== 'validation.ts');

        if (useCaseFiles.length === 0) {
            console.log('❌ Arquivo do use case não encontrado!\n');
            rl.close();
            process.exit(1);
        }

        const useCaseFile = useCaseFiles[0];
        const useCaseFilePath = path.join(selectedUseCase.path, useCaseFile);
        const indexFilePath = path.join(selectedUseCase.path, 'index.ts');

        // Parse dos arquivos
        const useCaseInfo = parseUseCaseFile(useCaseFilePath);
        const indexInfo = parseIndexFile(indexFilePath);

        console.log('🔧 Injetando dependência...\n');

        // Injeta no use case
        const newUseCaseContent = injectRepositoryIntoUseCase(
            useCaseInfo.content,
            selectedRepo.interface,
            useCaseInfo.className
        );

        // Injeta no index
        const useCaseVarName = toCamelCase(useCaseInfo.className.replace('UseCase', ''));
        const newIndexContent = injectRepositoryIntoIndex(
            indexInfo.content,
            selectedRepo.interface,
            selectedRepo.implementation,
            useCaseVarName
        );

        // Escreve os arquivos
        fs.writeFileSync(useCaseFilePath, newUseCaseContent);
        fs.writeFileSync(indexFilePath, newIndexContent);

        console.log('✅ Dependência injetada com sucesso!\n');
        console.log('📝 Arquivos atualizados:');
        console.log(`   - ${useCaseFile}`);
        console.log(`   - index.ts\n`);
        console.log('💡 Alterações:');
        console.log(`   - Import adicionado: ${selectedRepo.interface}`);
        console.log(`   - Construtor atualizado com: ${toCamelCase(selectedRepo.interface.replace('I', '').replace('Repository', ''))}Repository`);
        console.log(`   - Index atualizado com instanciação do ${selectedRepo.implementation}\n`);

    } catch (error) {
        console.error('❌ Erro ao injetar dependência:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
