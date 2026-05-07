import request from "supertest";
import { sign, SignOptions } from "jsonwebtoken";
import { app } from "../../app";

jest.mock("../../shared/container/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from "../../shared/container/prisma";

const prismaMock = prisma as jest.Mocked<typeof prisma>;

// ── helpers ────────────────────────────────────────────────────────────────────

function makeToken(userId: string, name = "João", email = "joao@email.com") {
  const options: SignOptions = { subject: userId, expiresIn: "1h" };
  return sign({ name, email }, process.env.JWT_SECRET as string, options);
}

function makeTask(overrides: Partial<ReturnType<typeof baseTask>> = {}) {
  return { ...baseTask(), ...overrides };
}

function baseTask() {
  return {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    title: "Estudar testes",
    category: "Estudos",
    completed: false,
    durationMinutes: 60 as number | null,
    userId: "user-uuid-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("Task Routes — Integração", () => {
  const userId = "user-uuid-1";
  const token = makeToken(userId);
  const authHeader = { Authorization: `Bearer ${token}` };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /tasks ────────────────────────────────────────────────────────────

  describe("POST /tasks", () => {
    it("deve criar tarefa e retornar 201", async () => {
      const task = makeTask()
      ;(prismaMock.task.create as jest.Mock).mockResolvedValueOnce(task);

      const res = await request(app)
        .post("/tasks")
        .set(authHeader)
        .send({ title: "Estudar testes", category: "Estudos", durationMinutes: 60 });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: "Estudar testes",
        category: "Estudos",
        completed: false,
      });
    });

    it("deve retornar 401 sem token", async () => {
      const res = await request(app)
        .post("/tasks")
        .send({ title: "Tarefa", category: "Pessoal" });

      expect(res.status).toBe(401);
    });

    it("deve retornar 422 quando o título está ausente", async () => {
      const res = await request(app)
        .post("/tasks")
        .set(authHeader)
        .send({ category: "Estudos" });

      expect(res.status).toBe(422);
      expect(res.body.status).toBe("validation_error");
    });

    it("deve retornar 422 quando a categoria está ausente", async () => {
      const res = await request(app)
        .post("/tasks")
        .set(authHeader)
        .send({ title: "Minha tarefa" });

      expect(res.status).toBe(422);
    });

    it("deve criar tarefa sem durationMinutes quando não informado", async () => {
      const task = makeTask({ durationMinutes: null })
      ;(prismaMock.task.create as jest.Mock).mockResolvedValueOnce(task);

      const res = await request(app)
        .post("/tasks")
        .set(authHeader)
        .send({ title: "Tarefa simples", category: "Pessoal" });

      expect(res.status).toBe(201);
    });
  });

  // ── GET /tasks ─────────────────────────────────────────────────────────────

  describe("GET /tasks", () => {
    it("deve retornar lista de tarefas do usuário", async () => {
      const tasks = [makeTask(), makeTask({ id: "task-uuid-2", title: "Outra tarefa" })]
      ;(prismaMock.task.findMany as jest.Mock).mockResolvedValueOnce(tasks);

      const res = await request(app).get("/tasks").set(authHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it("deve retornar lista vazia quando não há tarefas", async () => {
      ;(prismaMock.task.findMany as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app).get("/tasks").set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/tasks");
      expect(res.status).toBe(401);
    });
  });

  // ── PUT /tasks/:id ─────────────────────────────────────────────────────────

  describe("PUT /tasks/:id", () => {
    it("deve atualizar a tarefa e retornar 200", async () => {
      const task = makeTask();
      const updated = makeTask({ title: "Título atualizado", completed: true })

      ;(prismaMock.task.findUnique as jest.Mock).mockResolvedValueOnce(task)
      ;(prismaMock.task.update as jest.Mock).mockResolvedValueOnce(updated);

      const res = await request(app)
        .put(`/tasks/${task.id}`)
        .set(authHeader)
        .send({ title: "Título atualizado", completed: true });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Título atualizado");
      expect(res.body.completed).toBe(true);
    });

    it("deve retornar 404 quando a tarefa não existe", async () => {
      ;(prismaMock.task.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put("/tasks/00000000-0000-0000-0000-000000000000")
        .set(authHeader)
        .send({ title: "novo" });

      expect(res.status).toBe(404);
    });

    it("deve retornar 403 quando o usuário não é dono da tarefa", async () => {
      const taskDeOutroUser = makeTask({ userId: "outro-user-id" })
      ;(prismaMock.task.findUnique as jest.Mock).mockResolvedValueOnce(taskDeOutroUser);

      const res = await request(app)
        .put(`/tasks/${taskDeOutroUser.id}`)
        .set(authHeader)
        .send({ title: "tentativa" });

      expect(res.status).toBe(403);
    });

    it("deve retornar 422 com ID inválido (não UUID)", async () => {
      const res = await request(app)
        .put("/tasks/id-nao-uuid")
        .set(authHeader)
        .send({ title: "teste" });

      expect(res.status).toBe(422);
    });

    it("deve retornar 401 sem token", async () => {
      const res = await request(app)
        .put("/tasks/task-uuid-1")
        .send({ title: "sem auth" });

      expect(res.status).toBe(401);
    });
  });

  // ── DELETE /tasks/:id ──────────────────────────────────────────────────────

  describe("DELETE /tasks/:id", () => {
    it("deve deletar a tarefa e retornar 204", async () => {
      const task = makeTask()
      ;(prismaMock.task.findUnique as jest.Mock).mockResolvedValueOnce(task)
      ;(prismaMock.task.delete as jest.Mock).mockResolvedValueOnce(task);

      const res = await request(app)
        .delete(`/tasks/${task.id}`)
        .set(authHeader);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    it("deve retornar 404 quando a tarefa não existe", async () => {
      ;(prismaMock.task.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .delete("/tasks/00000000-0000-0000-0000-000000000000")
        .set(authHeader);

      expect(res.status).toBe(404);
    });

    it("deve retornar 403 quando o usuário não é dono da tarefa", async () => {
      const taskDeOutroUser = makeTask({ userId: "outro-user-id" })
      ;(prismaMock.task.findUnique as jest.Mock).mockResolvedValueOnce(taskDeOutroUser);

      const res = await request(app)
        .delete(`/tasks/${taskDeOutroUser.id}`)
        .set(authHeader);

      expect(res.status).toBe(403);
    });

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).delete("/tasks/task-uuid-1");
      expect(res.status).toBe(401);
    });
  });

  // ── Health check ───────────────────────────────────────────────────────────

  describe("GET /health", () => {
    it("deve retornar 200 e status ok", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });
});
