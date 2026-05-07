import { RegisterUseCase } from "../../../modules/auth/use-cases/RegisterUseCase";
import { FakeUserRepository } from "../../fakes/FakeUserRepository";
import { AppError } from "../../../shared/errors/AppError";

describe("RegisterUseCase", () => {
  let fakeUserRepository: FakeUserRepository;
  let registerUseCase: RegisterUseCase;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    registerUseCase = new RegisterUseCase(fakeUserRepository);
  });

  it("deve criar um usuário com sucesso", async () => {
    const result = await registerUseCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    });

    expect(result).toMatchObject({
      name: "João Silva",
      email: "joao@email.com",
    });
    expect(result.id).toBeDefined();
    expect(result).not.toHaveProperty("password");
  });

  it("não deve retornar a senha no resultado", async () => {
    const result = await registerUseCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    });

    expect(result).not.toHaveProperty("password");
  });

  it("deve lançar AppError ao tentar cadastrar e-mail duplicado", async () => {
    const data = {
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    };

    await registerUseCase.execute(data);

    await expect(registerUseCase.execute(data)).rejects.toBeInstanceOf(AppError);
  });

  it("deve retornar status 409 ao tentar cadastrar e-mail duplicado", async () => {
    const data = {
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    };

    await registerUseCase.execute(data);

    await expect(registerUseCase.execute(data)).rejects.toMatchObject({
      statusCode: 409,
      message: "E-mail já cadastrado",
    });
  });

  it("deve salvar a senha como hash, não em texto puro", async () => {
    const password = "senha123";

    await registerUseCase.execute({
      name: "João Silva",
      email: "joao@email.com",
      password,
    });

    const savedUser = await fakeUserRepository.findByEmail("joao@email.com");
    expect(savedUser?.password).not.toBe(password);
    expect(savedUser?.password).toMatch(/^\$2[ab]\$/);
  });
});
