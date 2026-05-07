import { LoginUseCase } from "../../../modules/auth/use-cases/LoginUseCase";
import { RegisterUseCase } from "../../../modules/auth/use-cases/RegisterUseCase";
import { FakeUserRepository } from "../../fakes/FakeUserRepository";
import { AppError } from "../../../shared/errors/AppError";
import { verify } from "jsonwebtoken";

describe("LoginUseCase", () => {
  let fakeUserRepository: FakeUserRepository;
  let loginUseCase: LoginUseCase;

  beforeEach(async () => {
    fakeUserRepository = new FakeUserRepository();
    loginUseCase = new LoginUseCase(fakeUserRepository);

    // Seed a registered user
    const register = new RegisterUseCase(fakeUserRepository);
    await register.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    });
  });

  it("deve retornar token e dados do usuário ao fazer login com sucesso", async () => {
    const result = await loginUseCase.execute({
      email: "joao@email.com",
      password: "senha123",
    });

    expect(result.token).toBeDefined();
    expect(result.user).toMatchObject({
      name: "João Silva",
      email: "joao@email.com",
    });
  });

  it("deve gerar um JWT válido com o id do usuário como subject", async () => {
    const result = await loginUseCase.execute({
      email: "joao@email.com",
      password: "senha123",
    });

    const decoded = verify(result.token, process.env.JWT_SECRET as string) as { sub: string };
    expect(decoded.sub).toBe(result.user.id);
  });

  it("deve lançar AppError 401 quando o e-mail não existe", async () => {
    await expect(
      loginUseCase.execute({
        email: "naoexiste@email.com",
        password: "senha123",
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("deve lançar AppError 401 quando a senha está incorreta", async () => {
    await expect(
      loginUseCase.execute({
        email: "joao@email.com",
        password: "senhaerrada",
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("deve retornar a mesma mensagem de erro para e-mail inexistente e senha errada (evitar enumeração)", async () => {
    const [errEmail, errPassword] = await Promise.allSettled([
      loginUseCase.execute({ email: "naoexiste@email.com", password: "qualquer" }),
      loginUseCase.execute({ email: "joao@email.com", password: "errada" }),
    ]);

    expect(errEmail.status).toBe("rejected");
    expect(errPassword.status).toBe("rejected");

    if (errEmail.status === "rejected" && errPassword.status === "rejected") {
      expect((errEmail.reason as AppError).message).toBe(
        (errPassword.reason as AppError).message
      );
    }
  });

  it("não deve retornar a senha do usuário no resultado", async () => {
    const result = await loginUseCase.execute({
      email: "joao@email.com",
      password: "senha123",
    });

    expect(result.user).not.toHaveProperty("password");
  });
});
