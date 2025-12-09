# Diretrizes do Projeto

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

## Boas Práticas

### Commits
- Um arquivo por commit quando possível
- Mensagens claras e descritivas
- Autor configurado corretamente

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

# Prisma
npx prisma generate           # Gera Prisma Client
npx prisma migrate dev        # Cria migração
npx prisma studio             # Abre GUI do Prisma

# Qualidade de Código
npm run lint                  # Verifica erros
npm run lint:fix              # Corrige erros automaticamente
npm run format                # Formata código
npm run format:check          # Verifica formatação
```
