import { AppError } from '../../../shared/errors/AppError';
import { RegisterDTO } from '../dtos/authDTOs';
import { IUserRepository } from '../repositories/IUserRepository';

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: RegisterDTO): Promise<RegisterResponse> {
    const emailAlreadyExists = await this.userRepository.findByEmail(data.email);

    if (emailAlreadyExists) {
      throw new AppError('E-mail já cadastrado', 409);
    }

    const user = await this.userRepository.create(data);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
