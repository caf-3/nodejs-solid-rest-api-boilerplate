function isAlreadyCamelCase(str) {
    // Verifica se já está em camelCase: começa com minúscula e tem maiúsculas no meio
    return /^[a-z]+[A-Z]/.test(str);
}

function isAlreadyPascalCase(str) {
    // Verifica se já está em PascalCase: começa com maiúscula e tem mais maiúsculas
    return /^[A-Z][a-z]+[A-Z]/.test(str);
}

function toPascalCase(str) {
    // Se já está em PascalCase, retorna como está
    if (isAlreadyPascalCase(str)) {
        return str;
    }

    // Se está em camelCase, só capitaliza a primeira letra
    if (isAlreadyCamelCase(str)) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Caso contrário, faz a conversão normal
    return str
        .split(/[-_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

function toCamelCase(str) {
    // Se já está em camelCase, retorna como está
    if (isAlreadyCamelCase(str)) {
        return str;
    }

    // Se está em PascalCase, só minuscula a primeira letra
    if (isAlreadyPascalCase(str)) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    // Caso contrário, faz a conversão normal
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

module.exports = {
    toPascalCase,
    toCamelCase
};
