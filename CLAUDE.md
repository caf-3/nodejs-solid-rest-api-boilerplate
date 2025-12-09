# Diretrizes do Projeto

## ⚠️ IMPORTANTE - Git Workflow
**NUNCA faça commits ou push automaticamente. Sempre aguarde instrução explícita do usuário.**

## Visão Geral
Boilerplate Node.js REST API com arquitetura SOLID, seguindo princípios de Clean Architecture e Domain-Driven Design.

## Estrutura do Projeto

```
src/
├── api/
│   ├── middleware/
│   │   └── v1/
│   │       ├── guard/           # Middlewares de autenticação
│   │       └── validation/      # Validações globais
│   └── routes/
│       └── v1/                  # Rotas versionadas
├── entities/                    # Entidades de domínio
├── repositories/
│   ├── implementions/           # Implementações concretas (Postgres)
│   └── I*Repository.ts          # Interfaces dos repositórios
├── useCases/
│   └── [domain]/
│       └── [useCaseName]/
│           └── v1/
│               ├── [name].ts              # Lógica do use case
│               ├── [name].controller.ts   # Controller
│               ├── [name].DTO.ts          # Interface de dados
│               ├── validation.ts          # Validações específicas
│               └── index.ts               # Instanciação
└── utils/                       # Utilitários compartilhados
```

## Scripts de Geração

### 1. Gerar Use Case
```bash
npm run generate:usecase
```
- Cria estrutura completa de use case (DTO, Controller, UseCase, Index, Validation)
- Suporta campos com tipos e validações
- Aceita camelCase, kebab-case ou snake_case
- Campos podem ter fonte: body, param ou query

**Formatos aceitos:**
- `camelCase`: getUserById (recomendado)
- `kebab-case`: get-user-by-id
- `snake_case`: get_user_by_id

### 2. Gerar Entity
```bash
npm run generate:entity
```
- Lê o schema.prisma automaticamente
- Gera entity com tipos TypeScript corretos
- Detecta campos @id, @default, @unique
- Omite campos do construtor conforme necessário

### 3. Gerar Repository
```bash
npm run generate:repository
```
- Cria interface com 4 métodos CRUD padrão:
  - `create(data)` - Criar registro
  - `findById(id)` - Buscar por ID
  - `update(id, data)` - Atualizar registro
  - `delete(id)` - Deletar registro
- Opcionalmente cria implementação Postgres

### 4. Injetar Dependência
```bash
npm run inject:dependency
```
- Injeta repositórios em use cases
- Atualiza construtor do use case
- Atualiza index.ts com instanciação
- Remove comentários TODO automaticamente

### 5. Gerar Rota
```bash
npm run generate:route
```
- Lista use cases disponíveis
- Suporta métodos: GET, POST, PUT, DELETE, PATCH
- Validação opcional (se validation.ts existir)
- Autenticação opcional:
  - `basicAuth` - Autenticação básica
  - `jwtDecoder` - JWT com validação de sessão
  - `authMiddleware` - JWT ou Basic Auth
- Cria ou atualiza arquivo de rota do domínio

## Convenções de Nomenclatura

### Arquivos
- **Use Cases**: camelCase (getUserById.ts)
- **Entities**: camelCase (user.entity.ts)
- **Repositories**: PascalCase com prefixo I para interfaces (IUserRepository.ts)
- **Routers**: camelCase com sufixo .router (users.router.ts)

### Classes
- **Use Cases**: PascalCase + UseCase (GetUserByIdUseCase)
- **Controllers**: PascalCase + Controller (GetUserByIdController)
- **Entities**: PascalCase + Entity (UserEntity)
- **Repositories**: PascalCase + Repository (PostgresUserRepository)

### Variáveis
- **Instâncias**: camelCase (getUserByIdUseCase, userRepository)

## Padrões de Código

### Use Cases
```typescript
export class GetUserByIdUseCase {
    constructor(private userRepository: IUserRepository) {}

    async execute(data: IGetUserByIdDTO) {
        try {
            const user = await this.userRepository.findById(data.id);
            return { message: "sucesso", status: 200, data: user };
        } catch (error: any) {
            throw new Error(error);
        }
    }
}
```

### Controllers
```typescript
export class GetUserByIdController {
    constructor(private getUserByIdUseCase: GetUserByIdUseCase) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: IGetUserByIdDTO = {
                id: req.params.id
            };
            const response = await this.getUserByIdUseCase.execute(data);
            res.status(response.status).json(response);
        } catch (error: any) {
            next(error);
        }
    }
}
```

### Validations
```typescript
import { body, param, query } from "express-validator";

export const getUserByIdValidation = [
    param("id").isUUID().withMessage("ID deve ser um UUID válido")
];
```

### Repositories
```typescript
export class PostgresUserRepository implements IUserRepository {
    async findById(id: string): Promise<UserEntity | null> {
        try {
            return await prisma.user.findUnique({ where: { id } });
        } catch (error: any) {
            throw new Error(error);
        } finally {
            await prisma.$disconnect();
        }
    }
}
```

## Fluxo de Desenvolvimento

### Criar Nova Funcionalidade
1. **Criar Model no Prisma** (se necessário)
   ```bash
   # Editar prisma/schema.prisma
   npx prisma generate
   ```

2. **Gerar Entity**
   ```bash
   npm run generate:entity
   ```

3. **Gerar Repository**
   ```bash
   npm run generate:repository
   ```

4. **Gerar Use Case**
   ```bash
   npm run generate:usecase
   ```

5. **Injetar Dependências**
   ```bash
   npm run inject:dependency
   ```

6. **Gerar Rota**
   ```bash
   npm run generate:route
   ```

7. **Implementar Lógica**
   - Completar a lógica no use case
   - Adicionar métodos customizados no repository (se necessário)

## Tipos de Autenticação

### basicAuth
- Autenticação básica com username e password
- Configurado via variáveis de ambiente
- Uso: APIs internas, webhooks

### jwtDecoder
- Autenticação JWT com validação de token
- Valida sessão ativa no banco de dados
- Adiciona `req.user` com dados do usuário
- Uso: APIs protegidas que requerem usuário autenticado

### authMiddleware
- Aceita JWT ou Basic Auth
- Tenta JWT primeiro, fallback para Basic Auth
- Flexível para diferentes tipos de clientes

## Validações

### Tipos Disponíveis
- `string` - Texto simples
- `number` - Número
- `boolean` - Verdadeiro/Falso
- `email` - Email (validado)
- `uuid` - UUID (validado)
- `date` - Data ISO8601
- `array` - Array/Lista
- `any` - Qualquer tipo

### Fontes de Dados
- `body` - Dados do corpo da requisição
- `param` - Parâmetros da URL
- `query` - Query string

## Princípios SOLID

### Single Responsibility
- Cada use case tem uma única responsabilidade
- Controllers apenas delegam para use cases
- Repositories apenas lidam com persistência

### Open/Closed
- Interfaces de repository permitem extensão
- Use cases dependem de abstrações, não implementações

### Liskov Substitution
- Implementações de repository são intercambiáveis
- Qualquer implementação deve seguir o contrato da interface

### Interface Segregation
- DTOs específicos para cada use case
- Interfaces de repository focadas

### Dependency Inversion
- Use cases dependem de interfaces (IRepository)
- Controllers dependem de use cases
- Injeção de dependências no construtor

## Versionamento

### Rotas
- Todas as rotas são versionadas: `/v1/`, `/v2/`
- Versões antigas são mantidas para compatibilidade

### Use Cases
- Use cases são versionados em pastas: `v1/`, `v2/`
- Permite evolução sem quebrar clientes existentes

## Diretrizes de Commits

### Regras Principais
- **NUNCA faça commits ou push sem autorização explícita do usuário**
- Um arquivo por commit quando possível
- Mensagens claras, descritivas e em português
- Sempre usar autor: `caf-3 <caf-3@example.com>`
- Sem comentários de IA, Claude Code ou similares nas mensagens

### Formato dos Commits
```bash
git commit --author="caf-3 <caf-3@example.com>" -m "mensagem descritiva"
```

### Mensagens de Commit
- **add**: Adicionar novo arquivo ou funcionalidade
- **update**: Atualizar arquivo existente
- **fix**: Corrigir bug
- **remove**: Remover arquivo ou funcionalidade
- **refactor**: Refatorar código sem mudar funcionalidade

### Exemplos
```bash
# Bom ✅
git commit -m "add user authentication middleware"
git commit -m "update validation helpers with new types"
git commit -m "fix repository injection in use cases"

# Ruim ❌
git commit -m "add files 🤖 Generated with Claude Code"
git commit -m "updates"
git commit -m "changes"
```

## Diretrizes dos Scripts

### Scripts de Geração
Todos os scripts devem seguir estas regras:

#### 1. Limite de Linhas
- Arquivo principal: máximo 200 linhas
- Se exceder, mover lógica para `scripts/utils/`
- Manter código organizado e modular

#### 2. Nomenclatura
- Arquivos principais: `generate-*.js`, `inject-*.js`
- Arquivos utilitários: `*Helpers.js`, `*Utils.js`
- Usar camelCase para funções e variáveis
- Usar PascalCase para classes

#### 3. Estrutura Padrão
```javascript
const fs = require('fs');
const path = require('path');
const readline = require('readline');
// Imports de helpers

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    try {
        // Lógica principal
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
```

#### 4. User Experience
- Sempre mostrar mensagens claras com emojis
- Listar opções disponíveis antes de pedir input
- Validar inputs do usuário
- Mostrar progresso e resultados
- Dar feedback sobre o que foi criado/modificado

#### 5. Mensagens Console
```javascript
// Títulos
console.log('\n🚀 Gerador de Use Cases\n');

// Listas
console.log('📋 Models disponíveis:');
console.log('   1. User');
console.log('   2. Post');

// Sucesso
console.log('✅ Arquivo criado com sucesso!');

// Aviso
console.log('⚠️  Atenção: validação não encontrada');

// Erro
console.log('❌ Erro: arquivo já existe');

// Informação
console.log('💡 Dica: use camelCase para nomes');
```

#### 6. Validação e Segurança
- Sempre verificar se arquivos/diretórios existem
- Perguntar antes de sobrescrever arquivos
- Validar nomes e paths fornecidos pelo usuário
- Tratar erros adequadamente
- Nunca assumir estrutura de diretórios

#### 7. Helpers e Utilitários
Organizar em `scripts/utils/`:
- `stringHelpers.js` - Conversões de case
- `validationHelpers.js` - Validações express-validator
- `templateHelpers.js` - Geração de templates
- `prismaParser.js` - Parse do schema.prisma
- `*Helpers.js` - Helpers específicos por domínio

### Padrões de Templates

#### Use Case
```javascript
function generateUseCaseContent(useCasePascal, useCaseCamel) {
    return `import { I${useCasePascal}DTO } from "./${useCaseCamel}.DTO";

export class ${useCasePascal}UseCase {
    // TODO: Injete as dependências necessárias
    constructor() {}

    async execute(data: I${useCasePascal}DTO) {
        try {
            // TODO: Implemente a lógica do use case

            return {
                message: "sucesso",
                status: 200,
                data: {}
            };
        } catch (error: any) {
            throw new Error(error);
        }
    }
}
`;
}
```

#### Repository Interface
```javascript
function generateRepositoryInterface(entityName) {
    return `import { ${entityName}Entity } from "../entities/${entityName.toLowerCase()}.entity";

export interface I${entityName}Repository {
    create(data: Omit<${entityName}Entity, "id" | "created_at" | "updated_at">): Promise<${entityName}Entity>;
    findById(id: string): Promise<${entityName}Entity | null>;
    update(id: string, data: Partial<${entityName}Entity>): Promise<${entityName}Entity | null>;
    delete(id: string): Promise<boolean>;
}
`;
}
```

## Boas Práticas

### Commits
- **Aguardar instrução explícita para fazer commits/push**
- Um arquivo por commit quando possível
- Mensagens claras e descritivas
- Autor configurado: caf-3

### Código
- Evite comentários desnecessários
- Código auto-explicativo
- Use TypeScript para type safety
- Trate erros apropriadamente

### Segurança
- Nunca commit arquivos com secrets (.env)
- Use variáveis de ambiente
- Valide todos os inputs
- Sanitize dados antes de persistir

### Performance
- Desconecte o Prisma após operações
- Use índices no banco de dados
- Cache quando apropriado
- Evite N+1 queries

## Arquivos Importantes

- `prisma/schema.prisma` - Schema do banco de dados
- `src/app.ts` - Configuração do Express
- `.env.local` - Variáveis de ambiente (não commitar)
- `package.json` - Scripts e dependências

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev                    # Inicia servidor em modo dev

# Build
npm run build                  # Compila TypeScript
npm start                      # Inicia servidor produção

# Geradores
npm run generate:usecase       # Gerar use case
npm run generate:entity        # Gerar entity do Prisma
npm run generate:repository    # Gerar repository
npm run inject:dependency      # Injetar dependências
npm run generate:route         # Gerar rota

# Prisma
npx prisma generate           # Gera Prisma Client
npx prisma migrate dev        # Cria migração
npx prisma studio             # Abre GUI do Prisma

# Qualidade de Código
npm run lint                  # Verifica erros
npm run lint:fix              # Corrige erros automaticamente
npm run format                # Formata código
npm run format:check          # Verifica formatação

# Git (apenas quando autorizado pelo usuário)
git add <arquivo>
git commit --author="caf-3 <caf-3@example.com>" -m "mensagem"
git push
```

## Workflow Completo - Exemplo Prático

### Criar feature completa de "Posts"

1. **Atualizar Schema Prisma**
```prisma
model Post {
  id         String   @id @unique @default(uuid())
  title      String
  content    String
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("posts")
}
```

2. **Gerar Prisma Client**
```bash
npx prisma generate
```

3. **Gerar Entity**
```bash
npm run generate:entity
# Escolher: Post
```

4. **Gerar Repository**
```bash
npm run generate:repository
# Escolher: Post
# Criar implementação: Sim
```

5. **Gerar Use Case "CreatePost"**
```bash
npm run generate:usecase
# Domínio: posts
# Nome: createPost
# Versão: v1
# Adicionar campos: Sim
  # Campo: title, tipo: string, obrigatório, fonte: body
  # Campo: content, tipo: string, obrigatório, fonte: body
  # Campo: userId, tipo: uuid, obrigatório, fonte: body
```

6. **Injetar Repository no Use Case**
```bash
npm run inject:dependency
# Use case: posts/createPost/v1
# Repository: IPostRepository
```

7. **Implementar Lógica**
Editar `src/useCases/posts/createPost/v1/createPost.ts`:
```typescript
async execute(data: ICreatePostDTO) {
    try {
        const post = await this.postRepository.create(data);
        return { message: "Post criado com sucesso", status: 201, data: post };
    } catch (error: any) {
        throw new Error(error);
    }
}
```

8. **Gerar Rota**
```bash
npm run generate:route
# Use case: posts/createPost/v1
# Método: POST
# Path: /
# Validação: Sim
# Autenticação: jwtDecoder
```

9. **Aguardar autorização para commit e push**

**Resultado:** Feature completa de criação de posts com validação, autenticação JWT e seguindo SOLID.
