jest.mock("../../../shared/container/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from "../../../shared/container/prisma";
import { UserRepository } from "../../../modules/auth/repositories/UserRepository";

const prismaMock = prisma as jest.Mocked<typeof prisma>;

const baseUser = {
  id: "user-1",
  name: "João Silva",
  email: "joao@email.com",
  password: "hashed",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UserRepository.findById", () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
  });

  it("deve retornar o usuário quando encontrado", async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(baseUser);

    const result = await repo.findById("user-1");

    expect(result).toEqual(baseUser);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("deve retornar null quando usuário não existe", async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const result = await repo.findById("inexistente");

    expect(result).toBeNull();
  });
});
