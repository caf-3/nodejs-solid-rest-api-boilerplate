const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { toCamelCase } = require('./utils/stringHelpers');
const { findAllUseCases } = require('./utils/useCaseHelpers');
const {
    findRouterFile,
    checkValidationExists,
    createOrUpdateRouterFile
} = require('./utils/routeHelpers');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    try {
        console.log('\n🛣️  Gerador de Rotas\n');

        const baseDir = path.join(__dirname, '..');

        // Lista use cases
        console.log('📋 Buscando use cases...\n');
        const useCases = findAllUseCases(baseDir);

        if (useCases.length === 0) {
            console.log('❌ Nenhum use case encontrado!');
            console.log('💡 Execute: npm run generate:usecase\n');
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

        // Pergunta método HTTP
        console.log('📝 Métodos HTTP disponíveis:');
        console.log('   1. GET');
        console.log('   2. POST');
        console.log('   3. PUT');
        console.log('   4. DELETE');
        console.log('   5. PATCH\n');

        const methodIndex = await question('Digite o número do método: ');
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        const method = methods[parseInt(methodIndex) - 1];

        if (!method) {
            console.log('❌ Método inválido!\n');
            rl.close();
            process.exit(1);
        }

        // Pergunta o path
        console.log(`\n💡 Exemplos de paths: /, /:id, /search, /:schoolId/users\n`);
        const routePath = await question('Digite o path da rota: ');

        if (!routePath) {
            console.log('❌ Path é obrigatório!\n');
            rl.close();
            process.exit(1);
        }

        // Verifica se tem validação
        const hasValidation = checkValidationExists(selectedUseCase.path);
        let useValidation = false;

        if (hasValidation) {
            const validationAnswer = await question('\n✅ Validação encontrada. Deseja usar? (S/n): ');
            useValidation = validationAnswer.toLowerCase() !== 'n' && validationAnswer.toLowerCase() !== 'nao' && validationAnswer.toLowerCase() !== 'não';
        } else {
            console.log('\n⚠️  Nenhuma validação encontrada para este use case.');
        }

        // Pergunta sobre autenticação
        const authAnswer = await question('\nDeseja adicionar autenticação? (s/N): ');
        let authType = null;

        if (authAnswer.toLowerCase() === 's' || authAnswer.toLowerCase() === 'sim') {
            console.log('\n🔐 Tipos de autenticação disponíveis:');
            console.log('   1. basicAuth - Autenticação básica');
            console.log('   2. jwtDecoder - Autenticação JWT');
            console.log('   3. authMiddleware - JWT ou Basic Auth\n');

            const authTypeIndex = await question('Digite o número do tipo de autenticação: ');
            const authTypes = ['basicAuth', 'jwtDecoder', 'authMiddleware'];
            authType = authTypes[parseInt(authTypeIndex) - 1];

            if (!authType) {
                console.log('❌ Tipo de autenticação inválido! Usando sem autenticação.\n');
            }
        }

        // Encontra ou cria arquivo de rota
        const domain = selectedUseCase.domain;
        let routerFilePath = findRouterFile(baseDir, domain);
        const routesDir = path.join(baseDir, 'src', 'api', 'routes', 'v1');

        if (!fs.existsSync(routesDir)) {
            fs.mkdirSync(routesDir, { recursive: true });
        }

        if (!routerFilePath) {
            routerFilePath = path.join(routesDir, `${domain}.router.ts`);
        }

        // Gera os nomes
        const useCaseFiles = fs.readdirSync(selectedUseCase.path)
            .filter(f => f.endsWith('.ts') && !f.includes('controller') && !f.includes('DTO') && f !== 'index.ts' && f !== 'validation.ts');

        const useCaseName = useCaseFiles.length > 0 ? useCaseFiles[0].replace('.ts', '') : 'unknown';
        const controllerName = `${toCamelCase(useCaseName)}Controller`;
        const validationName = useValidation ? `${toCamelCase(useCaseName)}Validation` : null;

        // Gera paths relativos
        const controllerRelPath = path.relative(
            path.dirname(routerFilePath),
            path.join(selectedUseCase.path, 'index.ts')
        ).replace(/\\/g, '/').replace('.ts', '');

        const validationRelPath = useValidation
            ? path.relative(
                path.dirname(routerFilePath),
                path.join(selectedUseCase.path, 'validation.ts')
            ).replace(/\\/g, '/').replace('.ts', '')
            : null;

        // Cria ou atualiza o arquivo de rota
        const routerContent = createOrUpdateRouterFile(
            routerFilePath,
            selectedUseCase,
            method,
            routePath,
            useValidation,
            authType,
            controllerName,
            validationName,
            controllerRelPath,
            validationRelPath
        );

        fs.writeFileSync(routerFilePath, routerContent);

        console.log('\n✅ Rota criada com sucesso!\n');
        console.log(`📁 Arquivo: ${routerFilePath}\n`);
        console.log('📋 Detalhes:');
        console.log(`   - Método: ${method}`);
        console.log(`   - Path: ${routePath}`);
        console.log(`   - Controller: ${controllerName}`);
        if (validationName) {
            console.log(`   - Validação: ${validationName}`);
        }
        if (authType) {
            console.log(`   - Autenticação: ${authType}`);
        }
        console.log('');

    } catch (error) {
        console.error('❌ Erro ao criar rota:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
