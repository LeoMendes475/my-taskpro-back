import prisma from "../../../shared/container/prisma";
import { RegisterDTO } from "../dtos/authDTOs";
import { IUserRepository, UserEntity } from "./IUserRepository";
import { hash } from "bcryptjs";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: RegisterDTO): Promise<UserEntity> {
    const hashedPassword = await hash(data.password, 10);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
  }
}
