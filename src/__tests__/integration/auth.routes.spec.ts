import request from "supertest";
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
import { hash } from "bcryptjs";

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe("Auth Routes — Integração", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /auth/register ────────────────────────────────────────────────────

  describe("POST /auth/register", () => {
    it("deve retornar 201 e dados do usuário ao registrar com sucesso", async () => {
      const newUser = {
        id: "user-uuid-1",
        name: "João Silva",
        email: "joao@email.com",
        password: await hash("senha123", 1),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(null)
      ;(prismaMock.user.create as jest.Mock).mockResolvedValueOnce(newUser);

      const res = await request(app).post("/auth/register").send({
        name: "João Silva",
        email: "joao@email.com",
        password: "senha123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Usuário criado com sucesso",
        user: { name: "João Silva", email: "joao@email.com" },
      });
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("deve retornar 409 quando e-mail já está cadastrado", async () => {
      const existingUser = {
        id: "user-uuid-1",
        name: "João",
        email: "joao@email.com",
        password: "hash",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(existingUser);

      const res = await request(app).post("/auth/register").send({
        name: "João Silva",
        email: "joao@email.com",
        password: "senha123",
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("E-mail já cadastrado");
    });

    it("deve retornar 422 quando o nome está ausente", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "joao@email.com",
        password: "senha123",
      });

      expect(res.status).toBe(422);
      expect(res.body.status).toBe("validation_error");
    });

    it("deve retornar 422 quando o e-mail é inválido", async () => {
      const res = await request(app).post("/auth/register").send({
        name: "João",
        email: "email-invalido",
        password: "senha123",
      });

      expect(res.status).toBe(422);
    });

    it("deve retornar 422 quando a senha tem menos de 6 caracteres", async () => {
      const res = await request(app).post("/auth/register").send({
        name: "João",
        email: "joao@email.com",
        password: "123",
      });

      expect(res.status).toBe(422);
    });
  });

  // ── POST /auth/login ───────────────────────────────────────────────────────

  describe("POST /auth/login", () => {
    it("deve retornar 200, token e dados do usuário ao fazer login com sucesso", async () => {
      const hashedPassword = await hash("senha123", 1);
      const user = {
        id: "user-uuid-1",
        name: "João Silva",
        email: "joao@email.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

      const res = await request(app).post("/auth/login").send({
        email: "joao@email.com",
        password: "senha123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toMatchObject({ name: "João Silva", email: "joao@email.com" });
      expect(typeof res.body.token).toBe("string");
    });

    it("deve retornar 401 quando o e-mail não existe", async () => {
      ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).post("/auth/login").send({
        email: "naoexiste@email.com",
        password: "senha123",
      });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
    });

    it("deve retornar 401 quando a senha está incorreta", async () => {
      const user = {
        id: "user-uuid-1",
        name: "João",
        email: "joao@email.com",
        password: await hash("senha123", 1),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

      const res = await request(app).post("/auth/login").send({
        email: "joao@email.com",
        password: "senhaerrada",
      });

      expect(res.status).toBe(401);
    });

    it("deve retornar 422 quando o body está incompleto", async () => {
      const res = await request(app).post("/auth/login").send({ email: "joao@email.com" });
      expect(res.status).toBe(422);
    });
  });

  // ── GET /auth/me ───────────────────────────────────────────────────────────

  describe("GET /auth/me", () => {
    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.status).toBe(401);
    });

    it("deve retornar 401 com token inválido", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", "Bearer token.invalido");

      expect(res.status).toBe(401);
    });

    it("deve retornar 200 e dados do usuário com token válido", async () => {
      const hashedPassword = await hash("senha123", 1);
      const user = {
        id: "user-uuid-1",
        name: "João Silva",
        email: "joao@email.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

      // First login to get a real token
      const loginRes = await request(app).post("/auth/login").send({
        email: "joao@email.com",
        password: "senha123",
      });

      const { token } = loginRes.body;

      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ name: "João Silva", email: "joao@email.com" });
    });
  });
});
