import { AppError } from "../../../shared/errors/AppError";

describe("AppError", () => {
  it("deve criar erro com mensagem e statusCode padrão 400", () => {
    const error = new AppError("Erro de teste");
    expect(error.message).toBe("Erro de teste");
    expect(error.statusCode).toBe(400);
  });

  it("deve criar erro com statusCode customizado", () => {
    const error = new AppError("Não encontrado", 404);
    expect(error.message).toBe("Não encontrado");
    expect(error.statusCode).toBe(404);
  });

  it("deve criar erro 401 para não autenticado", () => {
    const error = new AppError("Não autenticado", 401);
    expect(error.statusCode).toBe(401);
  });

  it("deve criar erro 403 para não autorizado", () => {
    const error = new AppError("Sem permissão", 403);
    expect(error.statusCode).toBe(403);
  });

  it("deve criar erro 409 para conflito", () => {
    const error = new AppError("E-mail já cadastrado", 409);
    expect(error.statusCode).toBe(409);
  });
});
