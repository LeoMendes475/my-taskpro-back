import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { errorHandler } from "../../../shared/middlewares/errorHandler";
import { AppError } from "../../../shared/errors/AppError";

function makeMocks() {
  const req = {
    requestId: "test-id",
    method: "GET",
    originalUrl: "/test",
  } as unknown as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe("errorHandler middleware", () => {
  it("deve retornar o statusCode e mensagem do AppError", () => {
    const { req, res, next } = makeMocks();
    const error = new AppError("Recurso não encontrado", 404);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Recurso não encontrado",
    });
  });

  it("deve retornar 422 e erros formatados para ZodError", () => {
    const { req, res, next } = makeMocks();
    const zodError = new ZodError([
      { code: "custom", message: "Campo inválido", path: ["email"], params: {} },
    ]);

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "validation_error",
        message: "Erro de validação",
        errors: expect.arrayContaining([
          expect.objectContaining({ field: "email" }),
        ]),
      })
    );
  });

  it("deve retornar 500 para erros genéricos não tratados", () => {
    const { req, res, next } = makeMocks();
    const error = new Error("Falha inesperada no banco");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Erro interno do servidor",
    });
  });
});
