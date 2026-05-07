import { IUserRepository, UserEntity } from "../../modules/auth/repositories/IUserRepository";
import { RegisterDTO } from "../../modules/auth/dtos/authDTOs";
import { hash } from "bcryptjs";

export class FakeUserRepository implements IUserRepository {
  private users: UserEntity[] = [];

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async create(data: RegisterDTO): Promise<UserEntity> {
    const user: UserEntity = {
      id: `user-${this.users.length + 1}`,
      name: data.name,
      email: data.email,
      password: await hash(data.password, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  seed(user: UserEntity) { this.users.push(user); }
  clear() { this.users = []; }
}
