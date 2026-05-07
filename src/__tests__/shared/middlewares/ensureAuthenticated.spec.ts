import { Request, Response, NextFunction } from "express";
import { sign } from "jsonwebtoken";
import { ensureAuthenticated } from "../../../shared/middlewares/ensureAuthenticated";
import { AppError } from "../../../shared/errors/AppError";

function makeMocks() {
  const req = { headers: {} } as unknown as Request;
  const res = {} as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

function makeToken(payload: object, secret = "test-secret-key", options = {}) {
  return sign(payload, secret, { subject: "user-id-1", expiresIn: "1h", ...options });
}

describe("ensureAuthenticated middleware", () => {
  it("deve chamar next() com usuário válido no req quando token é válido", () => {
    const { req, res, next } = makeMocks();
    const token = makeToken({ name: "João", email: "joao@email.com" });
    req.headers.authorization = `Bearer ${token}`;

    ensureAuthenticated(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: "user-id-1", name: "João", email: "joao@email.com" });
  });

  it("deve lançar AppError 401 quando o header Authorization está ausente", () => {
    const { req, res, next } = makeMocks();

    expect(() => ensureAuthenticated(req, res, next)).toThrow(AppError);
    expect(() => ensureAuthenticated(req, res, next)).toThrow("Token de autenticação ausente");
  });

  it("deve lançar AppError 401 quando o token não é informado após Bearer", () => {
    const { req, res, next } = makeMocks();
    req.headers.authorization = "Bearer ";

    expect(() => ensureAuthenticated(req, res, next)).toThrow(AppError);
  });

  it("deve lançar AppError 401 quando o token está expirado", () => {
    const { req, res, next } = makeMocks();
    const expiredToken = makeToken(
      { name: "João", email: "joao@email.com" },
      "test-secret-key",
      { expiresIn: "-1s" }
    );
    req.headers.authorization = `Bearer ${expiredToken}`;

    expect(() => ensureAuthenticated(req, res, next)).toThrow(AppError);
    expect(() => ensureAuthenticated(req, res, next)).toThrow("Token inválido ou expirado");
  });

  it("deve lançar AppError 401 quando o token é assinado com secret incorreto", () => {
    const { req, res, next } = makeMocks();
    const tokenWrongSecret = makeToken({ name: "João", email: "joao@email.com" }, "wrong-secret");
    req.headers.authorization = `Bearer ${tokenWrongSecret}`;

    expect(() => ensureAuthenticated(req, res, next)).toThrow(AppError);
  });

  it("deve lançar AppError 401 quando o token é inválido/malformado", () => {
    const { req, res, next } = makeMocks();
    req.headers.authorization = "Bearer token.invalido.aqui";

    expect(() => ensureAuthenticated(req, res, next)).toThrow(AppError);
  });

  it("deve lançar erro com statusCode 401", () => {
    const { req, res, next } = makeMocks();
    req.headers.authorization = "Bearer token.invalido";

    let caughtError: AppError | null = null;
    try {
      ensureAuthenticated(req, res, next);
    } catch (e) {
      caughtError = e as AppError;
    }

    expect(caughtError?.statusCode).toBe(401);
  });
});
