const { toCamelCase } = require('./stringHelpers');

function injectRepositoryIntoUseCase(useCaseContent, repositoryInterface, useCaseClassName) {
    const camelRepo = toCamelCase(repositoryInterface.replace('I', '').replace('Repository', ''));
    const paramName = `${camelRepo}Repository`;

    // Verifica se já tem o import
    const importLine = `import { ${repositoryInterface} } from "../../../../repositories/${repositoryInterface}";`;
    let newContent = useCaseContent;

    if (!newContent.includes(repositoryInterface)) {
        // Adiciona o import após os imports existentes
        const lastImportIndex = newContent.lastIndexOf('import');
        const nextLineIndex = newContent.indexOf('\n', lastImportIndex);
        newContent = newContent.slice(0, nextLineIndex + 1) + importLine + '\n' + newContent.slice(nextLineIndex + 1);
    }

    // Atualiza o construtor - captura mesmo com múltiplas linhas e comentários
    const constructorRegex = /constructor\s*\(([\s\S]*?)\)\s*\{/;
    const match = newContent.match(constructorRegex);

    if (match) {
        let currentParams = match[1];

        // Remove comentários TODO das linhas
        currentParams = currentParams
            .split('\n')
            .filter(line => !line.trim().startsWith('//'))
            .join('\n')
            .trim();

        let newParams;

        if (currentParams === '') {
            // Construtor vazio
            newParams = `private ${paramName}: ${repositoryInterface}`;
        } else {
            // Adiciona ao construtor existente se não existir
            if (!currentParams.includes(paramName)) {
                newParams = `${currentParams},\n        private ${paramName}: ${repositoryInterface}`;
            } else {
                newParams = currentParams;
            }
        }

        newContent = newContent.replace(constructorRegex, `constructor(${newParams}) {`);
    }

    // Remove comentário TODO antes do construtor
    newContent = newContent.replace(/\s*\/\/ TODO: Injete as dependências necessárias.*\n/g, '\n');

    return newContent;
}

function injectRepositoryIntoIndex(indexContent, repositoryInterface, repositoryImplementation, useCaseVarName) {
    const camelRepo = toCamelCase(repositoryInterface.replace('I', '').replace('Repository', ''));
    const repoVarName = `${camelRepo}Repository`;

    let newContent = indexContent;

    // Adiciona import do repositório se não existir
    const importLine = `import { ${repositoryImplementation} } from "../../../../repositories/implementions/${repositoryImplementation}";`;

    if (!newContent.includes(repositoryImplementation)) {
        // Encontra onde adicionar (depois dos comentários de TODO, antes do primeiro import não comentado)
        const lines = newContent.split('\n');
        let insertIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('import') && !line.startsWith('// import')) {
                insertIndex = i;
                break;
            }
        }

        lines.splice(insertIndex, 0, importLine);
        newContent = lines.join('\n');
    }

    // Atualiza a instanciação do use case para incluir o repositório
    // Regex que captura mesmo com quebras de linha dentro dos parênteses
    const useCaseInstantiationRegex = new RegExp(
        `(const\\s+${useCaseVarName}\\s*=\\s*new\\s+(\\w+)\\s*\\(([\\s\\S]*?)\\);?)`,
        ''
    );
    const match = newContent.match(useCaseInstantiationRegex);

    if (match) {
        const [fullMatch, , className, currentParams] = match;

        // Remove comentários e espaços extras
        let cleanParams = currentParams
            .split('\n')
            .filter(line => !line.trim().startsWith('//'))
            .join('\n')
            .replace(/\s+/g, ' ')
            .trim();

        let newParams;
        if (cleanParams === '') {
            newParams = repoVarName;
        } else if (!cleanParams.includes(repoVarName)) {
            newParams = `${cleanParams}, ${repoVarName}`;
        } else {
            newParams = cleanParams;
        }

        // Adiciona instanciação do repositório se não existir
        const repoInstantiation = `const ${repoVarName} = new ${repositoryImplementation}();`;
        let replacement;

        if (!newContent.includes(`${repoVarName} =`)) {
            replacement = `${repoInstantiation}\nconst ${useCaseVarName} = new ${className}(${newParams});`;
        } else {
            replacement = `const ${useCaseVarName} = new ${className}(${newParams});`;
        }

        newContent = newContent.replace(fullMatch, replacement);
    }

    // Remove comentários TODO se existirem
    newContent = newContent.replace(/\/\/ TODO: Importe o repositório necessário\n/g, '');
    newContent = newContent.replace(/\/\/ TODO: Importe e instancie o repositório necessário\n/g, '');
    newContent = newContent.replace(/\/\/ import.*PostgresExampleRepository.*\n/g, '');
    newContent = newContent.replace(/\/\/ TODO: Instancie as dependências\n/g, '');
    newContent = newContent.replace(/\/\/ const exampleRepository.*\n/g, '');
    newContent = newContent.replace(/\/\/ Injete as dependências aqui\n/g, '');
    newContent = newContent.replace(/\n\n\n+/g, '\n\n');

    return newContent;
}

module.exports = {
    injectRepositoryIntoUseCase,
    injectRepositoryIntoIndex
};
