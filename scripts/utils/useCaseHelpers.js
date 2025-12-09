const fs = require('fs');
const path = require('path');

function findAllUseCases(baseDir) {
    const useCases = [];
    const useCasesPath = path.join(baseDir, 'src', 'useCases');

    if (!fs.existsSync(useCasesPath)) {
        return useCases;
    }

    const domains = fs.readdirSync(useCasesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const domain of domains) {
        const domainPath = path.join(useCasesPath, domain);
        const useCaseNames = fs.readdirSync(domainPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const useCaseName of useCaseNames) {
            const useCasePath = path.join(domainPath, useCaseName);
            const versions = fs.readdirSync(useCasePath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const version of versions) {
                const versionPath = path.join(useCasePath, version);
                const indexPath = path.join(versionPath, 'index.ts');

                if (fs.existsSync(indexPath)) {
                    useCases.push({
                        domain,
                        name: useCaseName,
                        version,
                        path: versionPath,
                        displayName: `${domain}/${useCaseName}/${version}`
                    });
                }
            }
        }
    }

    return useCases;
}

function findAllRepositories(baseDir) {
    const repositories = [];
    const repoPath = path.join(baseDir, 'src', 'repositories');

    if (!fs.existsSync(repoPath)) {
        return repositories;
    }

    const files = fs.readdirSync(repoPath)
        .filter(file => file.startsWith('I') && file.endsWith('Repository.ts'));

    for (const file of files) {
        const name = file.replace('.ts', '');
        const implementationPath = path.join(repoPath, 'implementions', `Postgres${name.slice(1)}.ts`);

        repositories.push({
            interface: name,
            implementation: fs.existsSync(implementationPath) ? `Postgres${name.slice(1)}` : null,
            interfaceFile: file,
            implementationFile: fs.existsSync(implementationPath) ? `Postgres${name.slice(1)}.ts` : null
        });
    }

    return repositories;
}

function parseUseCaseFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extrair o nome da classe
    const classMatch = content.match(/export\s+class\s+(\w+)\s*{/);
    const className = classMatch ? classMatch[1] : null;

    // Extrair imports
    const imports = [];
    const importRegex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)["'];/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push({
            items: match[1].trim(),
            from: match[2]
        });
    }

    // Extrair o construtor atual
    const constructorMatch = content.match(/constructor\s*\(([^)]*)\)/s);
    const constructorParams = constructorMatch ? constructorMatch[1].trim() : '';

    return {
        className,
        imports,
        constructorParams,
        content
    };
}

function parseIndexFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extrair imports
    const imports = [];
    const importRegex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)["'];/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push({
            items: match[1].trim(),
            from: match[2],
            fullMatch: match[0]
        });
    }

    return {
        imports,
        content
    };
}

module.exports = {
    findAllUseCases,
    findAllRepositories,
    parseUseCaseFile,
    parseIndexFile
};
