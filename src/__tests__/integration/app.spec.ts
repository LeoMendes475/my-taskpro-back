import request from "supertest";
import { sign } from "jsonwebtoken";
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

function makeToken(userId: string) {
  return sign(
    { name: "Test User", email: "test@test.com" },
    process.env.JWT_SECRET as string,
    { subject: userId, expiresIn: "1h" }
  );
}

describe("App — endpoints gerais", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("GET /metrics", () => {
    it("deve retornar métricas no formato Prometheus", async () => {
      const res = await request(app).get("/metrics");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/plain/);
    });
  });

  describe("GET /rota-inexistente", () => {
    it("deve retornar 404 para rotas não cadastradas", async () => {
      const res = await request(app).get("/esta-rota-nao-existe");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        message: "Rota não encontrada",
      });
    });
  });

  describe("Erro 500 — erro interno não tratado", () => {
    it("deve retornar 500 quando o repositório lança erro genérico", async () => {
      const token = makeToken("user-1");

      (prismaMock.task.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB connection lost")
      );

      const res = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        status: "error",
        message: "Erro interno do servidor",
      });
    });
  });
});
