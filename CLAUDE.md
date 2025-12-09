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
Cria estrutura completa: DTO, Controller, UseCase, Index, Validation

### 2. Gerar Entity
```bash
npm run generate:entity
```
Lê schema.prisma e gera entity com tipos TypeScript

### 3. Gerar Repository
```bash
npm run generate:repository
```
Cria interface e implementação com CRUD básico (create, findById, update, delete)

### 4. Injetar Dependência
```bash
npm run inject:dependency
```
Injeta repositórios em use cases automaticamente

### 5. Gerar Rota
```bash
npm run generate:route
```
Cria rotas com suporte a validação e autenticação (basicAuth, jwtDecoder, authMiddleware)

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

### Use Case
- Recebe dependências no construtor
- Método `execute()` com DTO
- Retorna `{ message, status, data }`

### Controller
- Recebe use case no construtor
- Método `handle()` com req, res, next
- Extrai dados e chama use case

### Repository
- Implementa interface com métodos CRUD
- Usa Prisma Client
- Disconnect após operações

## Fluxo de Desenvolvimento

1. Criar model no Prisma → `npx prisma generate`
2. `npm run generate:entity`
3. `npm run generate:repository`
4. `npm run generate:usecase`
5. `npm run inject:dependency`
6. `npm run generate:route`
7. Implementar lógica do use case

## Autenticação

- **basicAuth**: Username/password (APIs internas)
- **jwtDecoder**: JWT com validação de sessão (APIs protegidas)
- **authMiddleware**: JWT ou Basic Auth (flexível)

## Princípios

### SOLID
- Use cases com responsabilidade única
- Dependência de interfaces, não implementações
- Injeção de dependências no construtor

### Versionamento
- Rotas: `/v1/`, `/v2/`
- Use cases: `v1/`, `v2/`

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

### Regras Básicas
- Arquivo principal: máximo 200 linhas
- Se exceder, mover para `scripts/utils/`
- Mensagens claras com emojis (✅ ❌ ⚠️ 💡)
- Validar inputs antes de processar
- Perguntar antes de sobrescrever arquivos

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
