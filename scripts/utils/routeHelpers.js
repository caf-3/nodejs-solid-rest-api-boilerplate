const fs = require('fs');
const path = require('path');

function findRouterFile(baseDir, domain) {
    const routerPath = path.join(baseDir, 'src', 'api', 'routes', 'v1', `${domain}.router.ts`);
    return fs.existsSync(routerPath) ? routerPath : null;
}

function checkValidationExists(useCasePath) {
    const validationPath = path.join(useCasePath, 'validation.ts');
    return fs.existsSync(validationPath);
}

function generateRouterImports(controllerPath, controllerName, validationPath, validationName, authType) {
    const imports = [];

    imports.push(`import express, { Request, Response, NextFunction } from "express";`);

    if (validationName) {
        imports.push(`import { ${validationName} } from "${validationPath}";`);
        imports.push(`import { validatorError } from "../../../api/middleware/v1/validation/global.validation";`);
    }

    imports.push(`import { ${controllerName} } from "${controllerPath}";`);

    if (authType) {
        if (authType === 'basicAuth') {
            imports.push(`import { basicAuth } from "../../middleware/v1/guard/basic.mdiddleware";`);
        } else {
            imports.push(`import { ${authType} } from "../../middleware/v1/guard/jwt.middleware";`);
        }
    }

    imports.push('const router = express.Router();');

    return imports.join('\n');
}

function generateRouteHandler(method, path, controllerName, validationName, authType) {
    const middlewares = [];

    if (authType) {
        middlewares.push(authType);
    }

    if (validationName) {
        middlewares.push(validationName);
        middlewares.push('validatorError');
    }

    const middlewareStr = middlewares.length > 0 ? middlewares.join(', ') + ', ' : '';

    return `router.${method.toLowerCase()}("${path}", ${middlewareStr}(req: Request, res: Response, next: NextFunction) => {
    return ${controllerName}.handle(req, res, next);
});`;
}

function parseRouterFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extrai imports
    const imports = [];
    const importRegex = /import\s+.*from\s+["'].*["'];/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[0]);
    }

    // Extrai rotas
    const routes = [];
    const routeRegex = /router\.(get|post|put|delete|patch)\s*\([^)]+\)\s*=>\s*{[^}]+}\);/gs;
    while ((match = routeRegex.exec(content)) !== null) {
        routes.push(match[0]);
    }

    return {
        imports,
        routes,
        content
    };
}

function createOrUpdateRouterFile(routerFilePath, selectedUseCase, method, routePath, useValidation, authType, controllerName, validationName, controllerRelPath, validationRelPath) {
    let routerContent;

    if (fs.existsSync(routerFilePath)) {
        // Atualiza arquivo existente
        const parsed = parseRouterFile(routerFilePath);
        const newRoute = generateRouteHandler(method, routePath, controllerName, validationName, authType);

        // Adiciona imports necessários
        const needsControllerImport = !parsed.content.includes(controllerName);
        const needsValidationImport = validationName && !parsed.content.includes(validationName);
        const needsAuthImport = authType && !parsed.content.includes(authType);
        const needsValidatorErrorImport = validationName && !parsed.content.includes('validatorError');

        let newImports = [];
        if (needsControllerImport) {
            newImports.push(`import { ${controllerName} } from "${controllerRelPath}";`);
        }
        if (needsValidationImport) {
            newImports.push(`import { ${validationName} } from "${validationRelPath}";`);
        }
        if (needsValidatorErrorImport) {
            newImports.push(`import { validatorError } from "../../../api/middleware/v1/validation/global.validation";`);
        }
        if (needsAuthImport) {
            if (authType === 'basicAuth') {
                newImports.push(`import { basicAuth } from "../../middleware/v1/guard/basic.mdiddleware";`);
            } else {
                newImports.push(`import { ${authType} } from "../../middleware/v1/guard/jwt.middleware";`);
            }
        }

        // Adiciona imports antes de "const router"
        let content = parsed.content;
        if (newImports.length > 0) {
            content = content.replace(
                'const router = express.Router();',
                newImports.join('\n') + '\nconst router = express.Router();'
            );
        }

        // Adiciona nova rota antes do export
        content = content.replace(
            'export default router;',
            `\n${newRoute}\n\nexport default router;`
        );

        routerContent = content;
    } else {
        // Cria novo arquivo
        const imports = generateRouterImports(
            controllerRelPath,
            controllerName,
            validationRelPath,
            validationName,
            authType
        );

        const route = generateRouteHandler(method, routePath, controllerName, validationName, authType);

        routerContent = `${imports}\n\n${route}\n\nexport default router;\n`;
    }

    return routerContent;
}

module.exports = {
    findRouterFile,
    checkValidationExists,
    generateRouterImports,
    generateRouteHandler,
    parseRouterFile,
    createOrUpdateRouterFile
};
