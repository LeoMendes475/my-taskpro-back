# Task Manager API

API REST para gerenciamento de tarefas com autenticação JWT, construída com Node.js, TypeScript, Prisma e PostgreSQL.

![CI](https://github.com/<seu-usuario>/mytask-pro/actions/workflows/ci.yml/badge.svg)

---

## Tecnologias

### Aplicação

- **Node.js** + **TypeScript**
- **Express** — framework HTTP
- **Prisma ORM** — acesso ao banco de dados
- **PostgreSQL** — banco de dados relacional (rodando em container Docker)
- **Docker / Docker Compose** — containerização completa (app + banco)
- **Zod** — validação de schemas
- **bcryptjs** — hash de senhas
- **jsonwebtoken** — autenticação JWT
- **ts-node-dev** — execução TypeScript em desenvolvimento sem build

### Observabilidade

- **Winston** — logging estruturado (JSON em produção, colorido em desenvolvimento)
- **prom-client** — métricas Prometheus (requests totais, duração, in-flight)
- **swagger-ui-express** — documentação interativa em `/docs`

### Qualidade e testes

- **Jest** + **ts-jest** — framework de testes
- **Supertest** — testes de integração HTTP
- **ESLint** + **typescript-eslint** — linting (aspas duplas, ponto e vírgula, indentação)

---

## Arquitetura

Segue Clean Architecture com separação em camadas: Controllers → Use Cases → Repositories.

```
src/
├── modules/
│   ├── auth/
│   │   ├── controllers/        # Camada HTTP (recebe req, retorna res)
│   │   ├── use-cases/          # Regras de negócio
│   │   ├── repositories/       # Acesso ao banco (interface + implementação)
│   │   └── dtos/               # Schemas Zod e tipos
│   └── tasks/
│       ├── controllers/
│       ├── use-cases/
│       ├── repositories/
│       └── dtos/
├── shared/
│   ├── errors/                 # AppError (extende Error nativo)
│   ├── middlewares/            # errorHandler, ensureAuthenticated, requestLogger
│   ├── observability/          # logger (Winston) e metrics (Prometheus)
│   ├── docs/                   # Swagger
│   └── container/              # Instância singleton do Prisma
├── routes/                     # Definição das rotas
├── __tests__/
│   ├── fakes/                  # Repositórios in-memory para testes unitários
│   ├── modules/                # Testes unitários dos use cases
│   ├── shared/                 # Testes dos middlewares e erros
│   └── integration/            # Testes de integração HTTP (Prisma mockado)
├── app.ts                      # Configuração do Express
└── server.ts                   # Entry point
```

---

## Como rodar

### Pré-requisitos

- Docker e Docker Compose instalados
- Nenhuma instalação local de Node.js ou PostgreSQL necessária

### 1. Clone e configure o .env

```bash
cp .env.example .env
```

> O `.env` é opcional para rodar com Docker — as variáveis já estão definidas no `docker-compose.yml` com valores padrão.

### 2. Suba os containers

```bash
docker-compose up -d
```

Isso irá:
- Buildar a imagem do app com Node.js + OpenSSL
- Subir o PostgreSQL em container com volume persistente
- Aguardar o banco ficar saudável antes de iniciar o app
- Iniciar a API com `ts-node-dev` na porta `3333`

### 3. Execute as migrations

```bash
docker-compose exec app npx prisma migrate dev --name init
```

A API estará disponível em `http://localhost:3333`.

---

### Comandos úteis

```bash
# Ver logs em tempo real
docker-compose logs -f app

# Parar os containers
docker-compose down

# Rebuild completo (após alterações no Dockerfile)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Acessar o Prisma Studio (interface visual do banco)
docker-compose exec app npx prisma studio

# Abrir shell no container do app
docker-compose exec app sh
```

---

## Endpoints

### Autenticação

| Método | Rota             | Auth | Descrição           |
|--------|------------------|------|---------------------|
| POST   | `/auth/register` | ✗    | Criar conta         |
| POST   | `/auth/login`    | ✗    | Login (retorna JWT) |
| GET    | `/auth/me`       | ✓    | Dados do usuário    |

### Tarefas

| Método | Rota          | Auth | Descrição              |
|--------|---------------|------|------------------------|
| POST   | `/tasks`      | ✓    | Criar tarefa           |
| GET    | `/tasks`      | ✓    | Listar tarefas do user |
| PUT    | `/tasks/:id`  | ✓    | Editar tarefa          |
| DELETE | `/tasks/:id`  | ✓    | Remover tarefa         |

### Infraestrutura

| Método | Rota       | Auth | Descrição                        |
|--------|------------|------|----------------------------------|
| GET    | `/health`  | ✗    | Health check                     |
| GET    | `/metrics` | ✗    | Métricas Prometheus              |
| GET    | `/docs`    | ✗    | Documentação Swagger interativa  |

---

## Exemplos de requisição

### Registro
```json
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

### Login
```json
POST /auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```
Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

### Criar tarefa
```
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Estudar Clean Architecture",
  "category": "Estudos",
  "durationMinutes": 60
}
```

### Listar tarefas
```
GET /tasks
Authorization: Bearer <token>
```

### Atualizar tarefa
```
PUT /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Novo título",
  "completed": true
}
```

### Deletar tarefa
```
DELETE /tasks/:id
Authorization: Bearer <token>
```

---

## Tratativa de erros

Todos os erros seguem o padrão:

```json
{
  "status": "error",
  "message": "Mensagem descritiva"
}
```

Erros de validação (Zod):
```json
{
  "status": "validation_error",
  "message": "Erro de validação",
  "errors": [
    { "field": "email", "message": "E-mail inválido" }
  ]
}
```

| Código | Situação                         |
|--------|----------------------------------|
| 201    | Recurso criado                   |
| 204    | Deletado com sucesso             |
| 400    | Dados inválidos                  |
| 401    | Não autenticado / credenciais    |
| 403    | Sem permissão (tarefa de outro)  |
| 404    | Recurso não encontrado           |
| 409    | Conflito (e-mail já cadastrado)  |
| 422    | Erro de validação Zod            |
| 500    | Erro interno                     |

---

## Testes

```bash
# Rodar todos os testes
npm test

# Modo watch
npm run test:watch

# Cobertura de código (mínimo 95% exigido)
npm run test:coverage
```

### Estrutura dos testes

| Tipo        | Localização                        | Descrição                                       |
|-------------|------------------------------------|-------------------------------------------------|
| Unitários   | `src/__tests__/modules/`           | Use cases com repositórios fake (sem banco)     |
| Unitários   | `src/__tests__/shared/`            | Middlewares e classes de erro isolados          |
| Integração  | `src/__tests__/integration/`       | Endpoints HTTP completos com Prisma mockado     |

### Cobertura atual

| Métrica    | Resultado |
|------------|-----------|
| Statements | 100%      |
| Branches   | 100%      |
| Functions  | 100%      |
| Lines      | 100%      |

O threshold mínimo de **95%** é verificado automaticamente a cada `npm run test:coverage` e no CI/CD.

---

## Linting

```bash
# Verificar violações
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

Regras configuradas: aspas duplas, ponto e vírgula obrigatório, indentação de 2 espaços.

---

## CI/CD

O projeto usa **GitHub Actions** para garantir qualidade a cada push ou PR na branch `main`.

### Pipeline (`.github/workflows/ci.yml`)

```text
push/PR → main
    ↓
Install deps (npm ci)
    ↓
Generate Prisma Client
    ↓
Lint (ESLint)
    ↓
Tests + Coverage ≥ 95%  ← bloqueia merge se não atingir
    ↓
Upload coverage report (artifact)
```

Se a cobertura cair abaixo de 95% em qualquer métrica, o job falha e o merge é bloqueado.

---

## Variáveis de ambiente

| Variável       | Descrição                        | Padrão                  |
|----------------|----------------------------------|-------------------------|
| `DATABASE_URL` | URL de conexão do PostgreSQL     | definida pelo compose   |
| `JWT_SECRET`   | Chave secreta do JWT             | `supersecretkey`        |
| `JWT_EXPIRES_IN` | Tempo de expiração do token    | `1d`                    |
| `PORT`         | Porta da API                     | `3333`                  |
| `NODE_ENV`     | Ambiente de execução             | `development`           |
| `LOG_LEVEL`    | Nível de log do Winston          | `info`                  |
| `CORS_ORIGIN`  | Origem permitida pelo CORS       | `http://localhost:3000` |

> Em produção, sempre defina `JWT_SECRET` com um valor forte e seguro no `.env`.
