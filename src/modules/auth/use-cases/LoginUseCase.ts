import { compare } from 'bcryptjs';
import { sign, SignOptions } from 'jsonwebtoken';
import { AppError } from '../../../shared/errors/AppError';
import { LoginDTO } from '../dtos/authDTOs';
import { IUserRepository } from '../repositories/IUserRepository';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ email, password }: LoginDTO): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const secret = process.env.JWT_SECRET as string;

    const signOptions: SignOptions = {
      subject: user.id,
      expiresIn: '1d',
    };

    const token = sign(
      { name: user.name, email: user.email },
      secret,
      signOptions
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}