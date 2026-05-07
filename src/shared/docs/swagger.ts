export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Task Manager API",
    version: "1.0.0",
    description: "API REST para gerenciamento de tarefas com autenticação JWT",
  },
  servers: [
    { url: "http://localhost:3333", description: "Desenvolvimento" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira o token JWT obtido no login. Ex: Bearer eyJ...",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id:    { type: "string", format: "uuid", example: "a1b2c3d4-..." },
          name:  { type: "string", example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@email.com" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id:              { type: "string", format: "uuid" },
          title:           { type: "string", example: "Estudar Clean Architecture" },
          category:        { type: "string", example: "Estudos" },
          completed:       { type: "boolean", example: false },
          durationMinutes: { type: "integer", nullable: true, example: 90 },
          userId:          { type: "string", format: "uuid" },
          createdAt:       { type: "string", format: "date-time" },
          updatedAt:       { type: "string", format: "date-time" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status:  { type: "string", example: "error" },
          message: { type: "string", example: "Mensagem de erro" },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          status:  { type: "string", example: "validation_error" },
          message: { type: "string", example: "Erro de validação" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field:   { type: "string", example: "email" },
                message: { type: "string", example: "E-mail inválido" },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    // ── Auth ─────────────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Criar conta",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name:     { type: "string", example: "João Silva" },
                  email:    { type: "string", format: "email", example: "joao@email.com" },
                  password: { type: "string", minLength: 6, example: "senha123" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Usuário criado com sucesso" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          409: { description: "E-mail já cadastrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          422: { description: "Erro de validação", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email:    { type: "string", format: "email", example: "joao@email.com" },
                  password: { type: "string", example: "senha123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login realizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    user:  { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Credenciais inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          422: { description: "Erro de validação", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Dados do usuário logado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Dados do usuário",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          401: { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // ── Tasks ─────────────────────────────────────────────────────────────────
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Listar tarefas do usuário logado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de tarefas",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Task" } },
              },
            },
          },
          401: { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Criar tarefa",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "category"],
                properties: {
                  title:           { type: "string", example: "Estudar Clean Architecture" },
                  category:        { type: "string", example: "Estudos" },
                  durationMinutes: { type: "integer", example: 90, description: "Duração em minutos (1–1440)" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Tarefa criada", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
          401: { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          422: { description: "Erro de validação", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
        },
      },
    },
    "/tasks/{id}": {
      put: {
        tags: ["Tasks"],
        summary: "Editar tarefa",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "ID da tarefa" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title:           { type: "string", example: "Novo título" },
                  category:        { type: "string", example: "Trabalho" },
                  completed:       { type: "boolean", example: true },
                  durationMinutes: { type: "integer", example: 60, nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Tarefa atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
          401: { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Sem permissão", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Tarefa não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          422: { description: "Erro de validação", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Remover tarefa",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "ID da tarefa" },
        ],
        responses: {
          204: { description: "Tarefa removida" },
          401: { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Sem permissão", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Tarefa não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
  },
};
