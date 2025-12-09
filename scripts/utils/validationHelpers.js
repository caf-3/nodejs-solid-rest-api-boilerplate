const AVAILABLE_TYPES = {
    string: 'Texto simples',
    number: 'Número',
    boolean: 'Verdadeiro/Falso',
    email: 'Email (validado)',
    uuid: 'UUID (validado)',
    date: 'Data ISO8601',
    array: 'Array/Lista',
    any: 'Qualquer tipo'
};

function getAvailableTypesMessage() {
    return Object.entries(AVAILABLE_TYPES)
        .map(([type, desc]) => `  - ${type}: ${desc}`)
        .join('\n');
}

function getValidatorForType(fieldName, type, isOptional, source = 'body') {
    const validators = [];
    const sourceValidator = source === 'param' ? 'param' : source === 'query' ? 'query' : 'body';
    let validationChain = `${sourceValidator}("${fieldName}")`;

    switch (type.toLowerCase()) {
        case 'string':
            validators.push(`${validationChain}.isString().withMessage("${fieldName} deve ser uma string")`);
            if (!isOptional) {
                validators.push(`.notEmpty().withMessage("${fieldName} é obrigatório")`);
            }
            break;
        case 'number':
            validators.push(`${validationChain}.isNumeric().withMessage("${fieldName} deve ser um número")`);
            if (!isOptional) {
                validators.push(`.notEmpty().withMessage("${fieldName} é obrigatório")`);
            }
            break;
        case 'boolean':
            validators.push(`${validationChain}.isBoolean().withMessage("${fieldName} deve ser um booleano")`);
            break;
        case 'email':
            validators.push(`${validationChain}.isEmail().withMessage("${fieldName} deve ser um email válido")`);
            if (!isOptional) {
                validators.push(`.notEmpty().withMessage("${fieldName} é obrigatório")`);
            }
            break;
        case 'uuid':
            validators.push(`${validationChain}.isUUID().withMessage("${fieldName} deve ser um UUID válido")`);
            break;
        case 'date':
            validators.push(`${validationChain}.isISO8601().withMessage("${fieldName} deve ser uma data válida")`);
            break;
        case 'array':
            validators.push(`${validationChain}.isArray().withMessage("${fieldName} deve ser um array")`);
            if (!isOptional) {
                validators.push(`.notEmpty().withMessage("${fieldName} não pode estar vazio")`);
            }
            break;
        default:
            validators.push(`${validationChain}.notEmpty().withMessage("${fieldName} é obrigatório")`);
    }

    if (isOptional) {
        return `${validationChain}.optional()` + validators.slice(1).join('');
    }

    return validators.join('');
}

module.exports = {
    AVAILABLE_TYPES,
    getAvailableTypesMessage,
    getValidatorForType
};
